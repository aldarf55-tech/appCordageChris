export type JobStatus = 'recu' | 'en_cours' | 'prêt' | 'livre';

export interface StringingJob {
  id?: number;
  clientId: number;
  raquetteMarque?: string;
  raquetteModele?: string;
  cordageMontant?: string;
  tensionMontant?: number;
  cordageTravers?: string;
  tensionTravers?: number;
  prix: number;
  statut: JobStatus;
  dateReception?: string;
  dateRenduPrevue?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClientAndRacquetFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  notesClient?: string;
  marque: string;
  modele: string;
  planDeCordage: string;
  notesRaquette?: string;
}