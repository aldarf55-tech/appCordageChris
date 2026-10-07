import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { getClosedJobs } from '@/services/dashboardServices';

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export function ClosedView() {
  const jobs = useLiveQuery(getClosedJobs) || [];
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const clientsMap = new Map(clients.map((client) => [client.id, client]));
  const total = jobs.reduce((sum, job) => sum + job.prixTotal, 0);

  return (
    <div className="w-full min-w-0 flex-1 p-4 space-y-4 pb-20">
      <div className="flex items-end justify-between border-b border-gray-200 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Prises en charge clôturées</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-gray-500">Total réglé</p>
          <p className="text-lg font-bold text-emerald-700">{euroFormatter.format(total)}</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500">
          Aucun travail clôturé pour le moment.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => {
            const client = job.clientId ? clientsMap.get(job.clientId) : undefined;
            const receivedAt = new Date(job.dateReception);
            return (
              <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {client ? `${client.prenom} ${client.nom}` : 'Client supprimé'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {job.raquetteMarque} {job.raquetteModele}
                    {job.quantite > 1 && ` · ×${job.quantite}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {Number.isNaN(receivedAt.getTime()) ? '' : receivedAt.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="font-bold text-sm text-gray-900 whitespace-nowrap">
                  {euroFormatter.format(job.prixTotal)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}