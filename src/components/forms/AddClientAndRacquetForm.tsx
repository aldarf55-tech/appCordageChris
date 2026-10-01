import React, { useState } from 'react';
import type { ClientAndRacquetFormData } from '@/types/cordage';
import { createClientWithRacquet } from '@/services/clientService';
import { formStyles } from '@/styles/formStyles';

interface FormProps {
  onSuccess?: (clientId: number) => void;
}

const initialFormState: ClientAndRacquetFormData = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  notesClient: '',
  marque: '',
  modele: '',
  planDeCordage: '16x19',
  notesRaquette: '',
};

export const AddClientAndRacquetForm: React.FC<FormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<ClientAndRacquetFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setErrorMsg('Le nom et le prénom du client sont obligatoires.');
      return;
    }

    if (!formData.marque.trim() || !formData.modele.trim()) {
      setErrorMsg('La marque et le modèle de la raquette sont obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newClientId = await createClientWithRacquet(formData);
      setFormData(initialFormState);
      setSuccessMsg('Client et raquette enregistrés avec succès !');

      if (onSuccess) {
        onSuccess(newClientId);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      setErrorMsg("Impossible d'enregistrer les données.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.container}>
      <h2 className={formStyles.title}>Nouveau Client & Raquette</h2>

      {errorMsg && <div className={formStyles.errorAlert}>{errorMsg}</div>}
      {successMsg && <div className={formStyles.successAlert}>{successMsg}</div>}

      {/* SECTION 1 : CLIENT */}
      <section className={formStyles.section}>
        <h3 className={formStyles.subtitle}>1. Informations du client</h3>

        <div className={formStyles.gridTwoCols}>
          <div>
            <label className={formStyles.label}>Prénom *</label>
            <input
              type="text"
              name="prenom"
              required
              value={formData.prenom}
              onChange={handleChange}
              placeholder="ex: Lucas"
              className={formStyles.input}
            />
          </div>

          <div>
            <label className={formStyles.label}>Nom *</label>
            <input
              type="text"
              name="nom"
              required
              value={formData.nom}
              onChange={handleChange}
              placeholder="ex: Martin"
              className={formStyles.input}
            />
          </div>
        </div>

        <div>
          <label className={formStyles.label}>Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder="06 12 34 56 78"
            className={formStyles.input}
          />
        </div>

        <div>
          <label className={formStyles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="lucas.martin@example.com"
            className={formStyles.input}
          />
        </div>
      </section>

      {/* SECTION 2 : RAQUETTE */}
      <section className={formStyles.sectionBordered}>
        <h3 className={formStyles.subtitle}>2. Première Raquette</h3>

        <div className={formStyles.gridTwoCols}>
          <div>
            <label className={formStyles.label}>Marque *</label>
            <input
              type="text"
              name="marque"
              required
              value={formData.marque}
              onChange={handleChange}
              placeholder="ex: Babolat, Head"
              className={formStyles.input}
            />
          </div>

          <div>
            <label className={formStyles.label}>Modèle *</label>
            <input
              type="text"
              name="modele"
              required
              value={formData.modele}
              onChange={handleChange}
              placeholder="ex: Pure Drive"
              className={formStyles.input}
            />
          </div>
        </div>

        <div>
          <label className={formStyles.label}>Plan de cordage</label>
          <select
            name="planDeCordage"
            value={formData.planDeCordage}
            onChange={handleChange}
            className={formStyles.select}
          >
            <option value="16x19">16x19 (Standard)</option>
            <option value="18x20">18x20 (Contrôle)</option>
            <option value="16x18">16x18</option>
            <option value="14x18">14x18 (Squash/Badminton)</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label className={formStyles.label}>Notes / Remarques</label>
          <textarea
            rows={2}
            name="notesRaquette"
            value={formData.notesRaquette}
            onChange={handleChange}
            placeholder="Poids, équilibre, jonc..."
            className={formStyles.textarea}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className={formStyles.submitButton}
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer le client & la raquette'}
      </button>
    </form>
  );
};