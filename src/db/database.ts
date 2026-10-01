import Dexie, { type Table } from 'dexie';
import type { Client } from '@/types/client';
import type { StringingJob } from '@/types/cordage';

export class CordageDatabase extends Dexie {
  // Déclaration des tables typées pour TypeScript
  clients!: Table<Client, number>;
  stringingJobs!: Table<StringingJob, number>;

  constructor() {
    super('CordageDatabase');

    this.version(1).stores({
      // Indexation Dexie.js pour les recherches et requêtes where()
      clients: '++id, prenom, nom, telephone, email, createdAt',
      stringingJobs: '++id, clientId, statut, dateReception, createdAt',
    });
  }
}

export const db = new CordageDatabase();