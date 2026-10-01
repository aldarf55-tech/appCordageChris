import { db } from '@/db/database';
import type { ClientAndRacquetFormData } from '@/types/cordage';

export async function createClientWithRacquet(data: ClientAndRacquetFormData): Promise<number> {
  const now = new Date().toISOString();

  // Enregistrement du client
  const clientId = await db.clients.add({
    nom: data.nom.trim(),
    prenom: data.prenom.trim(),
    telephone: data.telephone.trim(),
    email: data.email.trim() || undefined,
    notes: data.notesClient?.trim() || undefined,
    createdAt: now,
  });

  return clientId;
}