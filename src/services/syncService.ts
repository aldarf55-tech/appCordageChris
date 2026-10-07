import { db } from '@/db/database';

export interface SyncResult {
  success: boolean;
  pushedClients: number;
  pushedJobs: number;
  pulledClients: number;
  pulledJobs: number;
  error?: string;
}

/**
 * Service de synchronisation bidirectionnelle entre Dexie.js (local) et Supabase (cloud).
 * Applique la stratégie Offline-First : Push des données locales (synced = 0) puis Pull des nouveautés.
 */
export async function syncWithSupabase(): Promise<SyncResult> {
  const { supabase } = await import('@/lib/supabaseClient');
  const result: SyncResult = {
    success: false,
    pushedClients: 0,
    pushedJobs: 0,
    pulledClients: 0,
    pulledJobs: 0,
  };

  if (!navigator.onLine) {
    return { ...result, error: 'Appareil hors-ligne' };
  }

  try {
    // ------------------------------------------------------------------
    // 1. PUSH CLIENTS
    // ------------------------------------------------------------------
    const unsyncedClients = await db.clients.where('synced').equals(0).toArray();

    if (unsyncedClients.length > 0) {
      const clientsPayload = unsyncedClients.map((client) => {
        const payload = { ...client };
        Reflect.deleteProperty(payload, 'synced');
        return { ...payload, updatedAt: client.updatedAt || new Date().toISOString() };
      });

      const { error: pushClientError } = await supabase
        .from('clients')
        .upsert(clientsPayload);

      if (pushClientError) {
        throw new Error(`Erreur Push Clients: ${pushClientError.message}`);
      }

      const syncedClientIds = unsyncedClients
        .map((c) => c.id)
        .filter((id): id is string => id !== undefined);

      if (syncedClientIds.length > 0) {
        await db.clients.where('id').anyOf(syncedClientIds).modify({ synced: 1 });
      }

      result.pushedClients = unsyncedClients.length;
    }

    // ------------------------------------------------------------------
    // 2. PUSH TRAVAUX
    // ------------------------------------------------------------------
    const unsyncedJobs = await db.stringingJobs.where('synced').equals(0).toArray();

    if (unsyncedJobs.length > 0) {
      const jobsPayload = unsyncedJobs.map((job) => {
        const payload = { ...job };
        Reflect.deleteProperty(payload, 'synced');
        return { ...payload, updatedAt: job.updatedAt || new Date().toISOString() };
      });

      const { error: pushJobError } = await supabase
        .from('stringingJobs')
        .upsert(jobsPayload);

      if (pushJobError) {
        throw new Error(`Erreur Push Travaux: ${pushJobError.message}`);
      }

      const syncedJobIds = unsyncedJobs
        .map((j) => j.id)
        .filter((id): id is string => id !== undefined);

      if (syncedJobIds.length > 0) {
        await db.stringingJobs.where('id').anyOf(syncedJobIds).modify({ synced: 1 });
      }

      result.pushedJobs = unsyncedJobs.length;
    }

    const pendingDeletions = await db.pendingJobDeletions.toArray();
    if (pendingDeletions.length > 0) {
      const { error: deleteError } = await supabase
        .from('stringingJobs')
        .delete()
        .in('id', pendingDeletions.map(({ id }) => id));

      if (deleteError) {
        throw new Error(`Erreur suppression travaux: ${deleteError.message}`);
      }

      await db.pendingJobDeletions.bulkDelete(pendingDeletions.map(({ id }) => id));
    }

    const pendingClientDeletions = await db.pendingClientDeletions.toArray();
    if (pendingClientDeletions.length > 0) {
      for (const { id } of pendingClientDeletions) {
        const { error: unlinkError } = await supabase
          .from('stringingJobs')
          .update({ clientId: null })
          .eq('clientId', id);

        if (unlinkError) {
          throw new Error(`Erreur dissociation des travaux du client: ${unlinkError.message}`);
        }
      }

      const { error: deleteClientError } = await supabase
        .from('clients')
        .delete()
        .in('id', pendingClientDeletions.map(({ id }) => id));

      if (deleteClientError) {
        throw new Error(`Erreur suppression clients: ${deleteClientError.message}`);
      }

      await db.pendingClientDeletions.bulkDelete(
        pendingClientDeletions.map(({ id }) => id)
      );
    }

    // ------------------------------------------------------------------
    // 3. PULL
    // ------------------------------------------------------------------
    const lastSync = localStorage.getItem('last_sync_timestamp') || new Date(0).toISOString();
    const syncStartTime = new Date().toISOString();

    const { data: remoteClients, error: pullClientError } = await supabase
      .from('clients')
      .select('*')
      .gt('updatedAt', lastSync);

    if (pullClientError) {
      throw new Error(`Erreur Pull Clients: ${pullClientError.message}`);
    }

    if (remoteClients && remoteClients.length > 0) {
      await db.clients.bulkPut(
        remoteClients.map((client) => ({ ...client, synced: 1 }))
      );
      result.pulledClients = remoteClients.length;
    }

    const { data: remoteJobs, error: pullJobError } = await supabase
      .from('stringingJobs')
      .select('*')
      .gt('updatedAt', lastSync);

    if (pullJobError) {
      throw new Error(`Erreur Pull Travaux: ${pullJobError.message}`);
    }

    if (remoteJobs && remoteJobs.length > 0) {
      await db.stringingJobs.bulkPut(
        remoteJobs.map((job) => ({ ...job, synced: 1 }))
      );
      result.pulledJobs = remoteJobs.length;
    }

    localStorage.setItem('last_sync_timestamp', syncStartTime);
    result.success = true;

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Échec de la synchronisation Supabase :', message);
    return { ...result, success: false, error: message };
  }
}