import { useState } from 'react';
import { updateJob } from '@/services/clientService';
import type { StringingJob } from '@/types/cordage';

type EditableJobFormData = Omit<
  Partial<StringingJob>,
  'quantite' | 'noeuds' | 'prixUnitaire' | 'prixTotal'
> & {
  quantite?: number | '';
  noeuds?: number | '';
  prixUnitaire?: number | '';
  prixTotal?: number | '';
};

interface EditJobModalProps {
  job: StringingJob | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditJobModal({ job, isOpen, onClose }: EditJobModalProps) {
  const [formData, setFormData] = useState<EditableJobFormData>(() =>
    getInitialFormData(job)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isNumeric = type === 'number' || name === 'noeuds';
    const numericValue: number | '' = value === ''
      ? ''
      : name === 'quantite' || name === 'noeuds'
        ? Number.parseInt(value, 10)
        : Number.parseFloat(value);
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: isNumeric ? numericValue : value,
      };

      // Recalcul automatique du prix total si quantité ou prix unitaire change
      if (name === 'prixUnitaire' || name === 'quantite') {
        const pu = name === 'prixUnitaire' ? numericValue : prev.prixUnitaire ?? '';
        const qte = name === 'quantite' ? numericValue : prev.quantite ?? '';
        updated.prixTotal = pu === '' || qte === '' ? '' : pu * qte;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.id) return;
    if (
      formData.quantite === '' || !formData.quantite ||
      formData.prixUnitaire === '' || formData.prixUnitaire == null ||
      formData.prixTotal === '' || formData.prixTotal == null
    ) {
      window.alert('Renseigne une quantité et des prix valides avant de sauvegarder.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateJob(job.id, {
        ...formData,
        quantite: Number(formData.quantite),
        prixUnitaire: Number(formData.prixUnitaire),
        prixTotal: Number(formData.prixTotal),
        noeuds: Number(formData.noeuds ?? 2),
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification de la prestation :', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-gray-900 text-lg">✏️ Modifier la prestation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STATUT */}
          <div>
            <label htmlFor="edit-status" className="block text-xs font-semibold text-gray-700 mb-1">
              Statut actuel
            </label>
            <select
              id="edit-status"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="recu">📥 Reçu</option>
              <option value="pret">✅ Prêt</option>
              <option value="livre">🤝 Livré</option>
            </select>
          </div>

          {/* RAQUETTE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-racquet-brand" className="block text-xs font-semibold text-gray-700 mb-1">
                Marque raquette
              </label>
              <input
                id="edit-racquet-brand"
                type="text"
                name="raquetteMarque"
                value={formData.raquetteMarque ?? ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-racquet-model" className="block text-xs font-semibold text-gray-700 mb-1">
                Modèle raquette
              </label>
              <input
                id="edit-racquet-model"
                type="text"
                name="raquetteModele"
                value={formData.raquetteModele ?? ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* CORDAGE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-string-brand" className="block text-xs font-semibold text-gray-700 mb-1">
                Marque cordage
              </label>
              <input
                id="edit-string-brand"
                type="text"
                name="cordageMarque"
                value={formData.cordageMarque ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-string-model" className="block text-xs font-semibold text-gray-700 mb-1">
                Modèle cordage
              </label>
              <input
                id="edit-string-model"
                type="text"
                name="cordageNom"
                value={formData.cordageNom ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* TENSION & JAUGE & NOEUDS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-tension" className="block text-xs font-semibold text-gray-700 mb-1">
                Tension (kg)
              </label>
              <input
                id="edit-tension"
                type="text"
                name="tension"
                value={formData.tension ?? ''}
                onChange={handleChange}
                placeholder="24/23"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-knots" className="block text-xs font-semibold text-gray-700 mb-1">
                Nœuds
              </label>
              <select
                id="edit-knots"
                name="noeuds"
                value={formData.noeuds ?? '2'}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>

          {/* TARIFICATION */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div>
              <label htmlFor="edit-unit-price" className="block text-xs font-semibold text-gray-700 mb-1">
                Prix unit. (€)
              </label>
              <input
                id="edit-unit-price"
                type="number"
                step="0.5"
                min="0"
                required
                name="prixUnitaire"
                value={formData.prixUnitaire ?? ''}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label htmlFor="edit-quantity" className="block text-xs font-semibold text-gray-700 mb-1">
                Quantité
              </label>
              <input
                id="edit-quantity"
                type="number"
                min="1"
                required
                name="quantite"
                value={formData.quantite ?? ''}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label htmlFor="edit-total-price" className="block text-xs font-semibold text-gray-700 mb-1">
                Total (€)
              </label>
              <input
                id="edit-total-price"
                type="number"
                step="0.5"
                min="0"
                required
                name="prixTotal"
                value={formData.prixTotal ?? ''}
                onChange={handleChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-received-date" className="block text-xs font-semibold text-gray-700 mb-1">
                Date de réception
              </label>
              <input
                id="edit-received-date"
                type="date"
                name="dateReception"
                value={formData.dateReception ? formData.dateReception.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label htmlFor="edit-notes" className="block text-xs font-semibold text-gray-700 mb-1">
              Notes / Remarques
            </label>
            <textarea
              id="edit-notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              placeholder="Spécificités du cordage, état du cadre, etc."
            />
          </div>

          {/* BOUTONS */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitialFormData(job: StringingJob | null): EditableJobFormData {
  if (!job) return {};
  return {
    raquetteMarque: job.raquetteMarque || '',
    raquetteModele: job.raquetteModele || '',
    cordageMarque: job.cordageMarque || '',
    cordageNom: job.cordageNom || '',
    tension: job.tension || '',
    noeuds: job.noeuds || 2,
    prixUnitaire: job.prixUnitaire || 0,
    quantite: job.quantite || 1,
    prixTotal: job.prixTotal || 0,
    statut: job.statut || 'recu',
    dateReception: job.dateReception || '',
    notes: job.notes || '',
  };
}