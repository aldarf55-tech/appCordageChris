import { db } from '@/db/database';
import type { StringingJob } from '@/types/cordage';

// Récupère les cordages qui attendent encore le cordage.
export async function getJobsToDo(): Promise<StringingJob[]> {
  return await db.stringingJobs
    .where('statut')
    .equals('recu')
    .toArray();
}

// Récupère les cordages prêts mais non livrés / en attente de paiement
export async function getUnpaidJobs(): Promise<StringingJob[]> {
  return await db.stringingJobs
    .where('statut')
    .equals('pret')
    .toArray();
}

export async function getClosedJobs(): Promise<StringingJob[]> {
  return await db.stringingJobs
    .where('statut')
    .equals('livre')
    .reverse()
    .sortBy('dateReception');
}