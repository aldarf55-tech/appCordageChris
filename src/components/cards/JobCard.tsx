import { useState } from 'react';
import type { StringingJob, JobStatus } from '@/types/cordage';
import { EditJobModal } from '@/components/modals/EditJobModal';
import { deleteJob, updateJobStatus } from '@/services/clientService';

interface JobCardProps {
  job: StringingJob;
  clientName?: string;
  clientPhone?: string;
  defaultExpanded?: boolean;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; badge: string; cardBorder: string }
> = {
  recu: {
    label: 'À corder',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    cardBorder: 'border-l-amber-500',
  },
  pret: {
    label: 'Prêt',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cardBorder: 'border-l-emerald-500',
  },
  livre: {
    label: 'Terminé / Payé',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    cardBorder: 'border-l-gray-400',
  },
};

export function JobCard({
  job,
  clientName,
  clientPhone,
  defaultExpanded = false,
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStatus = STATUS_CONFIG[job.statut] || STATUS_CONFIG.recu;

  const handleUpdateStatus = async (
    e: React.MouseEvent,
    newStatus: JobStatus
  ) => {
    e.stopPropagation();
    if (!job.id) return;
    await updateJobStatus(job.id, newStatus);
  };

  const handleSendSMS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!clientPhone) return;
    const cleanPhone = clientPhone.replace(/[\s.-]/g, '');
    const message = `Bonjour ${clientName || ''}, votre raquette (${job.raquetteMarque} ${job.raquetteModele}) est prête ! Total : ${job.prixTotal} €.`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${cleanPhone}${separator}body=${encodeURIComponent(message)}`;
  };

  const handleDelete = async () => {
    if (!job.id || isDeleting) return;
    const confirmed = window.confirm(
      'Supprimer cette prise en charge ? Le client sera conservé.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteJob(job.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la prise en charge :', error);
      window.alert('La prise en charge n’a pas pu être supprimée.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${currentStatus.cardBorder} transition-all overflow-hidden`}
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center hover:bg-gray-50/80 transition-colors">
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-left flex items-center gap-3 cursor-pointer select-none"
          >
            <span
              className={`text-gray-400 text-xs transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            <span>
              <span className="block font-bold text-gray-900 text-base">
                {clientName || `Client #${job.clientId}`}
              </span>
              <span className="block text-xs text-gray-500 font-medium">
                {job.raquetteMarque} {job.raquetteModele}
                {job.quantite > 1 && ` (×${job.quantite})`}
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${currentStatus.badge}`}
            >
              {currentStatus.label}
            </span>

            {/* BOUTON ÉDITION */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Modifier la fiche"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Supprimer cette prise en charge, sans supprimer le client"
              title="Supprimer cette prise en charge"
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENU DÉROULANT */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 pt-1 border-t border-gray-100">
            {clientPhone && (
              <div className="pt-1">
                <a
                  href={`tel:${clientPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  📞 {clientPhone}
                </a>
              </div>
            )}

            {/* DÉTAILS RAQUETTE & CORDAGE */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500 font-medium">Raquette</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-800">
                    {job.raquetteMarque} {job.raquetteModele}
                  </span>
                  {job.quantite > 1 && (
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-md border border-blue-200">
                      ×{job.quantite}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="text-gray-500 font-medium">Cordage</span>
                <span className="font-semibold text-gray-800">
                  {[job.cordageMarque, job.cordageNom].filter(Boolean).join(' ') ||
                    'Cordage client'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="flex justify-between items-center pr-2 border-r border-gray-200">
                  <span className="text-gray-500 font-medium text-xs">Tension</span>
                  <span className="font-bold text-blue-600">
                    {job.tension ? `${job.tension} kg` : 'N/C'}
                  </span>
                </div>

                <div className="flex justify-between items-center pl-2">
                  <span className="text-gray-500 font-medium text-xs">Nœuds</span>
                  <span className="font-bold text-gray-700">
                    {job.noeuds ? `${job.noeuds}` : '2'}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="text-xs text-gray-400 block">Tarif</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">
                    {job.prixTotal} €
                  </span>
                  {job.quantite > 1 && (
                    <span className="text-xs text-gray-500 font-medium">
                      ({job.quantite} × {job.prixUnitaire} €)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {job.statut === 'recu' && (
                  <button
                    type="button"
                    onClick={(e) => handleUpdateStatus(e, 'pret')}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                  >
                    ✓ Marquer Prêt
                  </button>
                )}

                {job.statut === 'pret' && (
                  <>
                    {clientPhone && (
                      <button
                        type="button"
                        onClick={handleSendSMS}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-all"
                      >
                        💬 SMS
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleUpdateStatus(e, 'livre')}
                      className="px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg hover:bg-gray-900 active:scale-95 transition-all shadow-sm"
                    >
                      € Valider Paiement
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE D'ÉDITION */}
      {isEditOpen && (
        <EditJobModal
          key={job.id}
        job={job}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}