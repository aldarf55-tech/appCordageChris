import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { ClientFormData, RacquetFormData } from '@/types/cordage';
import type { Client } from '@/types/client';
import { createClientWithRacquets } from '@/services/clientService';
import { formStyles } from '@/styles/formStyles';

interface FormProps {
  existingClient?: Client | null;
  onSuccess?: (clientId: string) => void;
}

type RacquetDraft = Omit<RacquetFormData, 'quantite' | 'prixUnitaire'> & {
  quantite: number | '';
  prixUnitaire: number | '';
};

const emptyClient: ClientFormData = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  notesClient: '',
};

function createEmptyRacquet(): RacquetFormData {
  return {
  marque: '',
  modele: '',
  quantite: 1,
  typeCordage: 'Garniture',
  modeleCordage: '',
  cordageMarque: '',
  cordageNom: '',
  tension: '',
  noeuds: 2,
  prixUnitaire: 20,
  notesRaquette: '',
  };
}

export const AddClientAndRacquetForm: React.FC<FormProps> = ({ existingClient, onSuccess }) => {
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const [selectedClientId, setSelectedClientId] = useState(existingClient?.id ?? '');
  const [clientData, setClientData] = useState<ClientFormData>(() => ({
    ...emptyClient,
    prenom: existingClient?.prenom ?? '',
    nom: existingClient?.nom ?? '',
    telephone: existingClient?.telephone ?? '',
    email: existingClient?.email ?? '',
    notesClient: existingClient?.notes ?? '',
  }));
  const [racquets, setRacquets] = useState<RacquetDraft[]>([createEmptyRacquet()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleClientChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setClientData((previous) => ({ ...previous, [name]: value }));
  };

  const handleRacquetChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const parsedValue = name === 'noeuds'
      ? Number.parseInt(value, 10) || 2
      : type === 'number'
        ? value === '' ? '' : Number(value)
        : value;
    setRacquets((current) => current.map((racquet, racquetIndex) =>
      racquetIndex === index ? { ...racquet, [name]: parsedValue } : racquet
    ));
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find((entry) => entry.id === clientId);
    setSelectedClientId(clientId);
    setClientData({
      prenom: client?.prenom ?? '',
      nom: client?.nom ?? '',
      telephone: client?.telephone ?? '',
      email: client?.email ?? '',
      notesClient: client?.notes ?? '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!clientData.nom.trim() || !clientData.prenom.trim()) {
      setErrorMsg('Le nom et le prénom du client sont obligatoires.');
      return;
    }

    const invalidRacquet = racquets.findIndex((racquet) =>
      !racquet.marque.trim() ||
      !racquet.modele.trim() ||
      racquet.quantite === '' ||
      racquet.quantite < 1 ||
      racquet.prixUnitaire === ''
    );
    if (invalidRacquet !== -1) {
      setErrorMsg(`Complète les informations obligatoires de la raquette ${invalidRacquet + 1}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const newClientId = await createClientWithRacquets(
        clientData,
        racquets.map((racquet) => ({
          ...racquet,
          quantite: Number(racquet.quantite),
          prixUnitaire: Number(racquet.prixUnitaire),
        })),
        selectedClientId || undefined
      );
      onSuccess?.(newClientId);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      setErrorMsg("Impossible d'enregistrer les données.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.container}>
      <h2 className={formStyles.title}>Nouvelle prise en charge</h2>

      {errorMsg && <div className={formStyles.errorAlert}>{errorMsg}</div>}
      {successMsg && <div className={formStyles.successAlert}>{successMsg}</div>}

      {/* SECTION 1 : CLIENT */}
      <section className={formStyles.section}>
        <h3 className={formStyles.subtitle}>
          1. {selectedClientId ? 'Vérifier ou modifier les informations client' : 'Informations client'}
        </h3>

        <div>
          <label htmlFor="existing-client" className={formStyles.label}>
            Reprendre un client existant
          </label>
          <select
            id="existing-client"
            value={selectedClientId}
            onChange={handleClientSelect}
            className={formStyles.select}
          >
            <option value="">Nouveau client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.prenom} {client.nom}{client.telephone ? ` · ${client.telephone}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={formStyles.gridTwoCols}>
          <div>
            <label htmlFor="client-prenom" className={formStyles.label}>Prénom *</label>
            <input
              id="client-prenom"
              type="text"
              name="prenom"
              required
              value={clientData.prenom}
              onChange={handleClientChange}
              placeholder="ex: Lucas"
              className={formStyles.input}
            />
          </div>

          <div>
            <label htmlFor="client-nom" className={formStyles.label}>Nom *</label>
            <input
              id="client-nom"
              type="text"
              name="nom"
              required
              value={clientData.nom}
              onChange={handleClientChange}
              placeholder="ex: Martin"
              className={formStyles.input}
            />
          </div>
        </div>

        <div className={formStyles.gridTwoCols}>
          <div>
            <label htmlFor="client-telephone" className={formStyles.label}>Téléphone</label>
            <input
              id="client-telephone"
              type="tel"
              name="telephone"
              value={clientData.telephone}
              onChange={handleClientChange}
              placeholder="06 12 34 56 78"
              className={formStyles.input}
            />
          </div>

          <div>
            <label htmlFor="client-email" className={formStyles.label}>Email</label>
            <input
              id="client-email"
              type="email"
              name="email"
              value={clientData.email}
              onChange={handleClientChange}
              placeholder="lucas@example.com"
              className={formStyles.input}
            />
          </div>
        </div>
      </section>

      <section className={formStyles.sectionBordered}>
        <h3 className={formStyles.subtitle}>2. Raquettes & cordages</h3>

        {racquets.map((racquet, index) => {
          const fieldId = `racquet-${index}`;
          const totalPrice = Number(racquet.quantite || 0) * Number(racquet.prixUnitaire || 0);
          return (
            <fieldset key={index} className="space-y-4 rounded-xl border border-gray-200 p-3">
              <legend className="px-1 text-sm font-semibold text-gray-700">Raquette {index + 1}</legend>
              {racquets.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRacquets((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label={`Retirer la raquette ${index + 1}`}
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Retirer cette raquette
                </button>
              )}

              <div className={formStyles.gridTwoCols}>
                <div>
                  <label htmlFor={`${fieldId}-brand`} className={formStyles.label}>Marque *</label>
                  <input id={`${fieldId}-brand`} type="text" name="marque" required value={racquet.marque} onChange={(event) => handleRacquetChange(index, event)} placeholder="ex: Babolat, Head" className={formStyles.input} />
                </div>
                <div>
                  <label htmlFor={`${fieldId}-model`} className={formStyles.label}>Modèle *</label>
                  <input id={`${fieldId}-model`} type="text" name="modele" required value={racquet.modele} onChange={(event) => handleRacquetChange(index, event)} placeholder="ex: Pure Drive" className={formStyles.input} />
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldId}-quantity`} className={formStyles.label}>Quantité *</label>
                <input id={`${fieldId}-quantity`} type="number" name="quantite" min="1" required value={racquet.quantite} onChange={(event) => handleRacquetChange(index, event)} className={formStyles.input} />
              </div>

              <div className={formStyles.gridTwoCols}>
                <div>
                  <label htmlFor={`${fieldId}-string-type`} className={formStyles.label}>Type de cordage</label>
                  <select id={`${fieldId}-string-type`} name="typeCordage" value={racquet.typeCordage} onChange={(event) => handleRacquetChange(index, event)} className={formStyles.select}>
                    <option value="Garniture">Garniture</option>
                    <option value="Bobine perso">Bobine perso</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${fieldId}-string-model`} className={formStyles.label}>Modèle du cordage</label>
                  <input id={`${fieldId}-string-model`} type="text" name="modeleCordage" value={racquet.modeleCordage} onChange={(event) => handleRacquetChange(index, event)} placeholder="ex: RPM BLAST" className={formStyles.input} />
                </div>
              </div>

              <div className={formStyles.gridTwoCols}>
                <div>
                  <label htmlFor={`${fieldId}-tension`} className={formStyles.label}>Tension (kg)</label>
                  <input id={`${fieldId}-tension`} type="text" name="tension" value={racquet.tension} onChange={(event) => handleRacquetChange(index, event)} placeholder="25/24" className={formStyles.input} />
                </div>
                <div>
                  <label htmlFor={`${fieldId}-knots`} className={formStyles.label}>Nœuds</label>
                  <select id={`${fieldId}-knots`} name="noeuds" value={racquet.noeuds} onChange={(event) => handleRacquetChange(index, event)} className={formStyles.select}>
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldId}-price`} className={formStyles.label}>Prix unitaire (€)</label>
                <input id={`${fieldId}-price`} type="number" name="prixUnitaire" step="1" min="0" required value={racquet.prixUnitaire} onChange={(event) => handleRacquetChange(index, event)} className={formStyles.input} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                <span className="font-semibold text-blue-900">Total raquette {index + 1}</span>
                <span className="text-lg font-bold text-blue-700">{totalPrice} €</span>
              </div>

              <div>
                <label htmlFor={`${fieldId}-notes`} className={formStyles.label}>Notes / Remarques</label>
                <textarea id={`${fieldId}-notes`} rows={2} name="notesRaquette" value={racquet.notesRaquette} onChange={(event) => handleRacquetChange(index, event)} placeholder="Poids, équilibre, demande spécifique client..." className={formStyles.textarea} />
              </div>

              <button
                type="button"
                onClick={() => setRacquets((current) => [...current, createEmptyRacquet()])}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                + Ajouter une raquette
              </button>
            </fieldset>
          );
        })}
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className={formStyles.submitButton}
      >
        {isSubmitting ? 'Enregistrement...' : `Enregistrer ${racquets.length > 1 ? 'les prises en charge' : 'la prise en charge'}`}
      </button>
    </form>
  );
};