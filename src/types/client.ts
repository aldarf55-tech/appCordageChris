export interface Client {
  id?: number;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SortOrder = 'desc' | 'asc';