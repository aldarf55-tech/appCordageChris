export interface Client {
  id?: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  synced: number; // 0 = non synchronisé, 1 = synchronisé
}

export type SortOrder = 'desc' | 'asc';