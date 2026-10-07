import Dexie, { type Table } from 'dexie';
import type { Client } from '@/types/client';
import type { StringingJob } from '@/types/cordage';

export class AppDatabase extends Dexie {
  clients!: Table<Client, string>;
  stringingJobs!: Table<StringingJob, string>;
  pendingJobDeletions!: Table<{ id: string }, string>;
  pendingClientDeletions!: Table<{ id: string }, string>;

  constructor() {
    super('CordageDB');
    this.version(1).stores({
      clients: 'id, prenom, nom, telephone, synced',
      stringingJobs: 'id, clientId, statut, dateReception, synced',
    });
    this.version(2).stores({
      clients: 'id, prenom, nom, telephone, synced',
      stringingJobs: 'id, clientId, statut, dateReception, synced',
      pendingJobDeletions: 'id',
    });
    this.version(3).stores({
      clients: 'id, prenom, nom, telephone, synced',
      stringingJobs: 'id, clientId, statut, dateReception, synced',
      pendingJobDeletions: 'id',
      pendingClientDeletions: 'id',
    });
  }
}

export const db = new AppDatabase();