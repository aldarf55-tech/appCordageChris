import { db } from '@/db/database';
import type { StringingJob } from '@/types/cordage';

// Récupère les cordages non terminés ('recu' ou 'en_cours')
export async function getJobsToDo(): Promise<StringingJob[]> {
  return await db.stringingJobs
    .where('statut')
    .equals('recu')
    .or('statut')
    .equals('en_cours')
    .toArray();
}

// Récupère les cordages prêts mais non livrés / en attente de paiement
export async function getUnpaidJobs(): Promise<StringingJob[]> {
  return await db.stringingJobs
    .where('statut')
    .equals('prêt')
    .toArray();
}