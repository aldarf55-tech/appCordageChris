import { db } from '@/db/database';
import { syncWithSupabase } from '@/services/syncService';
import type { Client } from '@/types/client';
import type { StringingJob, ClientFormData, RacquetFormData, JobStatus } from '@/types/cordage';

/**
 * Crée un client et sa demande de cordage associée de manière atomique,
 * puis déclenche automatiquement la synchronisation vers Supabase.
 */
export async function createClientWithRacquets(
  clientData: ClientFormData,
  racquets: RacquetFormData[],
  existingClientId?: string
): Promise<string> {
  const now = new Date().toISOString();
  const clientId = existingClientId || crypto.randomUUID();

  // Enregistre le client et la nouvelle prise en charge atomiquement.
  await db.transaction('rw', db.clients, db.stringingJobs, async () => {
    const clientChanges: Omit<Client, 'id' | 'createdAt' | 'synced'> = {
      prenom: clientData.prenom.trim(),
      nom: clientData.nom.trim(),
      telephone: clientData.telephone.trim(),
      email: clientData.email.trim() || undefined,
      notes: clientData.notesClient?.trim() || undefined,
      updatedAt: now,
    };

    if (existingClientId) {
      const existingClient = await db.clients.get(existingClientId);
      if (!existingClient) throw new Error('Client introuvable.');
      await db.clients.update(existingClientId, { ...clientChanges, synced: 0 });
    } else {
      const newClient: Client = {
        id: clientId,
        ...clientChanges,
        createdAt: now,
        synced: 0,
      };
      await db.clients.add(newClient);
    }

    const newJobs: StringingJob[] = racquets.map((racquet) => ({
      id: crypto.randomUUID(),
      clientId,
      raquetteMarque: racquet.marque.trim(),
      raquetteModele: racquet.modele.trim(),
      cordageMarque: racquet.typeCordage,
      cordageNom: racquet.modeleCordage.trim() || undefined,
      tension: racquet.tension,
      noeuds: racquet.noeuds || 2,
      prixUnitaire: racquet.prixUnitaire,
      quantite: racquet.quantite,
      prixTotal: racquet.quantite * racquet.prixUnitaire,
      statut: 'recu',
      dateReception: now,
      notes: racquet.notesRaquette?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      synced: 0,
    }));

    await db.stringingJobs.bulkAdd(newJobs);
  });

  // 2. Déclenchement automatique de la synchro en arrière-plan
  scheduleSync();

  return clientId;
}

/**
 * Met à jour le statut d'un travail de cordage
 * et déclenche la synchronisation automatique.
 */
export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus
): Promise<void> {
  const now = new Date().toISOString();

  await db.stringingJobs.update(jobId, {
    statut: newStatus,
    updatedAt: now,
    synced: 0,
  });

  // Synchro automatique en arrière-plan
  scheduleSync();
}

export async function updateJob(
  jobId: string,
  changes: Partial<StringingJob>
): Promise<void> {
  await db.stringingJobs.update(jobId, {
    ...changes,
    updatedAt: new Date().toISOString(),
    synced: 0,
  });
  scheduleSync();
}

export async function updateClient(
  clientId: string,
  changes: Partial<Client>
): Promise<void> {
  await db.clients.update(clientId, {
    ...changes,
    updatedAt: new Date().toISOString(),
    synced: 0,
  });
  scheduleSync();
}

export async function deleteClient(clientId: string): Promise<void> {
  await db.transaction(
    'rw',
    db.clients,
    db.stringingJobs,
    db.pendingClientDeletions,
    async () => {
      const linkedJobs = await db.stringingJobs.where('clientId').equals(clientId).toArray();
      await Promise.all(
        linkedJobs.map((job) =>
          job.id
            ? db.stringingJobs.update(job.id, {
                clientId: null,
                updatedAt: new Date().toISOString(),
                synced: 0,
              })
            : Promise.resolve()
        )
      );
    await db.clients.delete(clientId);
    await db.pendingClientDeletions.put({ id: clientId });
    }
  );
  scheduleSync();
}

/**
 * Supprime un travail de cordage localement et sur Supabase.
 */
export async function deleteJob(jobId: string): Promise<void> {
  const job = await db.stringingJobs.get(jobId);
  if (!job) return;

  await db.transaction('rw', db.stringingJobs, db.pendingJobDeletions, async () => {
    await db.stringingJobs.delete(jobId);
    await db.pendingJobDeletions.put({ id: jobId });
  });

  scheduleSync();
}

function scheduleSync(): void {
  syncWithSupabase().catch((err) =>
    console.warn('Synchro différée (hors-ligne ou erreur réseau) :', err)
  );
}