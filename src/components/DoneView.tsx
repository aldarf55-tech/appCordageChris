import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { JobCard } from '@/components/cards/JobCard';
import { getUnpaidJobs } from '@/services/dashboardServices';

export function DoneView() {
  const jobs = useLiveQuery(getUnpaidJobs) || [];
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const clientsMap = new Map(clients.map((client) => [client.id, client]));

  return (
    <div className="w-full min-w-0 flex-1 p-4 space-y-4 pb-20">
      {jobs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-2">
          <p className="text-sm font-medium text-gray-600">Aucun travail terminé en attente de paiement.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {jobs.map((job) => {
            const client = job.clientId ? clientsMap.get(job.clientId) : undefined;
            return (
              <JobCard
                key={job.id}
                job={job}
                clientName={client ? `${client.prenom} ${client.nom}` : undefined}
                clientPhone={client?.telephone}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}