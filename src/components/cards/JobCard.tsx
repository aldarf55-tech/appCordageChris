import { useState } from 'react';
import type { StringingJob, JobStatus } from '@/types/cordage';
import { EditJobModal } from '@/components/modals/EditJobModal';
import { deleteJob, updateJobStatus } from '@/services/clientService';

interface JobCardProps {
  job: StringingJob;
  jobs?: StringingJob[];
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
  jobs = [job],
  clientName,
  clientPhone,
  defaultExpanded = false,
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [jobToEdit, setJobToEdit] = useState<StringingJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const isGroup = jobs.length > 1;
  const totalQuantity = jobs.reduce((sum, item) => sum + item.quantite, 0);
  const totalPrice = jobs.reduce((sum, item) => sum + item.prixTotal, 0);
  const currentStatus = STATUS_CONFIG[job.statut] || STATUS_CONFIG.recu;

  const handleUpdateStatus = async (
    event: React.MouseEvent,
    targetJob: StringingJob,
    newStatus: JobStatus
  ) => {
    event.stopPropagation();
    if (!targetJob.id) return;
    await updateJobStatus(targetJob.id, newStatus);
  };

  const handleSendSMS = (event: React.MouseEvent, targetJob: StringingJob) => {
    event.stopPropagation();
    if (!clientPhone) return;
    const cleanPhone = clientPhone.replace(/[\s.-]/g, '');
    const message = `Bonjour ${clientName || ''}, votre raquette (${targetJob.raquetteMarque} ${targetJob.raquetteModele}) est prête ! Total : ${targetJob.prixTotal} €.`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${cleanPhone}${separator}body=${encodeURIComponent(message)}`;
  };

  const handleDelete = async (targetJob: StringingJob) => {
    if (!targetJob.id || deletingJobId) return;
    const confirmed = window.confirm(
      `Supprimer cette prise en charge${isGroup ? ` (${targetJob.raquetteMarque} ${targetJob.raquetteModele})` : ''} ? Le client sera conservé.`
    );
    if (!confirmed) return;

    setDeletingJobId(targetJob.id);
    try {
      await deleteJob(targetJob.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la prise en charge :', error);
      window.alert('La prise en charge n’a pas pu être supprimée.');
      setDeletingJobId(null);
    }
  };

  const renderEditButton = (targetJob: StringingJob) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setJobToEdit(targetJob);
      }}
      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      title="Modifier la fiche"
      aria-label={`Modifier ${targetJob.raquetteMarque} ${targetJob.raquetteModele}`}
    >
      ✏️
    </button>
  );

  const renderDeleteButton = (targetJob: StringingJob) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void handleDelete(targetJob);
      }}
      disabled={deletingJobId === targetJob.id}
      aria-label="Supprimer cette prise en charge, sans supprimer le client"
      title="Supprimer cette prise en charge"
      className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
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
  );

  return (
    <>
      <div
        className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 bg-white shadow-sm transition-all ${currentStatus.cardBorder}`}
      >
        <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50/80">
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex min-w-0 cursor-pointer select-none items-center gap-3 text-left"
          >
            <span
              className={`text-xs text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-gray-900">
                {clientName || `Client #${job.clientId}`}
              </span>
              <span className="block truncate text-xs font-medium text-gray-500">
                {isGroup
                  ? `${totalQuantity} raquette${totalQuantity > 1 ? 's' : ''} · ${totalPrice} € au total`
                  : `${job.raquetteMarque} ${job.raquetteModele}${job.quantite > 1 ? ` (×${job.quantite})` : ''}`}
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${currentStatus.badge}`}
            >
              {currentStatus.label}
            </span>
            {!isGroup && (
              <>
                {renderEditButton(job)}
                {renderDeleteButton(job)}
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3">
            {clientPhone && (
              <a
                href={`tel:${clientPhone}`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-blue-600 hover:underline"
              >
                📞 {clientPhone}
              </a>
            )}

            {jobs.map((item, index) => {
              const itemStatus = STATUS_CONFIG[item.statut] || STATUS_CONFIG.recu;
              return (
                <section
                  key={item.id ?? `${item.raquetteMarque}-${item.raquetteModele}-${index}`}
                  className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  {isGroup && (
                    <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {item.raquetteMarque} {item.raquetteModele}
                        </p>
                        {item.quantite > 1 && (
                          <p className="text-xs text-gray-500">Quantité : {item.quantite}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${itemStatus.badge}`}>
                          {itemStatus.label}
                        </span>
                        {renderEditButton(item)}
                        {renderDeleteButton(item)}
                      </div>
                    </div>
                  )}

                  {!isGroup && clientPhone && (
                    <p className="text-sm font-semibold text-gray-800">
                      {item.raquetteMarque} {item.raquetteModele}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {!isGroup && (
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                        <span className="font-medium text-gray-500">Raquette</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-800">
                            {item.raquetteMarque} {item.raquetteModele}
                          </span>
                          {item.quantite > 1 && (
                            <span className="rounded-md border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-800">
                              ×{item.quantite}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <span className="font-medium text-gray-500">Cordage</span>
                      <span className="font-semibold text-gray-800">
                        {[item.cordageMarque, item.cordageNom].filter(Boolean).join(' ') ||
                          'Cordage client'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div className="flex items-center justify-between border-r border-gray-200 pr-2">
                        <span className="text-xs font-medium text-gray-500">Tension</span>
                        <span className="font-bold text-blue-600">
                          {item.tension ? `${item.tension} kg` : 'N/C'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-2">
                        <span className="text-xs font-medium text-gray-500">Nœuds</span>
                        <span className="font-bold text-gray-700">{item.noeuds || 2}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <div>
                      <span className="block text-xs text-gray-400">Tarif</span>
                      <span className="text-lg font-bold text-gray-900">{item.prixTotal} €</span>
                      {item.quantite > 1 && (
                        <span className="ml-1 text-xs font-medium text-gray-500">
                          ({item.quantite} × {item.prixUnitaire} €)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.statut === 'recu' && (
                        <button
                          type="button"
                          onClick={(event) => void handleUpdateStatus(event, item, 'pret')}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                        >
                          ✓ Marquer Prêt
                        </button>
                      )}
                      {item.statut === 'pret' && (
                        <>
                          {clientPhone && (
                            <button
                              type="button"
                              onClick={(event) => handleSendSMS(event, item)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
                            >
                              💬 SMS
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => void handleUpdateStatus(event, item, 'livre')}
                            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-gray-900 active:scale-95"
                          >
                            € Valider Paiement
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {jobToEdit && (
        <EditJobModal
          key={jobToEdit.id}
          job={jobToEdit}
          isOpen
          onClose={() => setJobToEdit(null)}
        />
      )}
    </>
  );
}
