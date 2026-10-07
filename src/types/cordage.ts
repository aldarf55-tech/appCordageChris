export type JobStatus = 'recu' | 'pret' | 'livre';

export interface StringingJob {
  id?: string;
  clientId: string | null;

  // Raquette
  raquetteMarque: string;
  raquetteModele: string;

  // Cordage
  cordageMarque?: string;
  cordageNom?: string;
  tension?: string;
  noeuds?: number;

  // Tarification
  prixUnitaire: number;
  prixTotal: number;
  quantite: number;

  // Suivi
  statut: JobStatus;
  dateReception: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  synced: number;
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  notesClient?: string;
}

export interface RacquetFormData {
  marque: string;
  modele: string;
  quantite: number;
  typeCordage: string;
  modeleCordage: string;
  cordageMarque?: string;
  cordageNom?: string;
  tension: string;
  noeuds: number;
  prixUnitaire: number;
  notesRaquette: string;
}