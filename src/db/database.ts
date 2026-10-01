import Dexie, { Table } from 'dexie';

// 1. Interfaces TypeScript
export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  notes?: string;
  createdAt: Date;
}

export interface Raquette {
  id?: number;
  clientId: number; // Clé étrangère vers Client
  marque: string; // ex: Babolat, Head, Wilson
  modele: string; // ex: Pure Drive, Speed MP
  planDeCordage?: string; // ex: 16x19, 18x20
  notes?: string;
}

export interface StringingJob {
  id?: number;
  clientId: number;
  racquetId: number;
  date: Date;
  // Spécifications techniques cordage
  cordageMontant: string; // ex: RPM Blast
  cordageTravers: string; // ex: VS Touch (si hybride)
  tensionMontant: number; // kg (ex: 24)
  tensionTravers: number; // kg (ex: 23)
  jauge?: string; // ex: 1.25mm
  noeuds?: number; // 2 ou 4 nœuds
  preEtirement?: number; // % (ex: 10%)
  // Suivi de prestation
  prix: number;
  statut: 'recu' | 'en_cours' | 'prêt' | 'livre';
  notesPrestation?: string;
}

// 2. Définition de la Base de Données
export class CordageDatabase extends Dexie {
  clients!: Table<Client>;
  raquettes!: Table<Raquette>;
  stringingJobs!: Table<StringingJob>;

  constructor() {
    super('CordageAppDB');

    // Indexation pour des recherches rapides
    this.version(1).stores({
      clients: '++id, nom, prenom, telephone',
      raquettes: '++id, clientId, marque, modele',
      stringingJobs: '++id, clientId, racquetId, date, statut'
    });
  }
}

export const db = new CordageDatabase();