import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import type { ActiveTab } from '@/types/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';
import { AddClientAndRacquetForm } from '@/components/forms/AddClientAndRacquetForm';
import { dashboardStyles } from '@/styles/dashboardStyles';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  // Requêtes réactives Dexie en temps réel
  const jobsToDo = useLiveQuery(() => 
    db.stringingJobs.where('statut').equals('recu').or('statut').equals('en_cours').toArray()
  ) || [];

  const unpaidJobs = useLiveQuery(() => 
    db.stringingJobs.where('statut').equals('prêt').toArray()
  ) || [];

  return (
    <div className={dashboardStyles.pageContainer}>
      {/* HEADER FIXE */}
      <header className={dashboardStyles.header}>
        <h1 className={dashboardStyles.title}>Atelier Cordage</h1>
        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
          En ligne
        </span>
      </header>

      {/* CONTENU SELON L'ONGLET ACTIF */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* HAUT A GAUCHE : DIV CLICABLE "A FAIRE" */}
            <div className={dashboardStyles.topGrid}>
              <div
                onClick={() => setActiveTab('todo')}
                className={dashboardStyles.kpiCard}
              >
                <span className={dashboardStyles.kpiLabel}>Cordages à faire</span>
                <span className={dashboardStyles.kpiValue}>{jobsToDo.length}</span>
                <span className="text-[10px] text-blue-700 font-medium">Voir le détail →</span>
              </div>

              {/* CARTE INDICATIVE STATUT */}
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-2xl flex flex-col justify-between opacity-75">
                <span className="text-xs font-semibold text-gray-500 uppercase">En cours</span>
                <span className="text-2xl font-bold text-gray-700">
                  {jobsToDo.filter((j) => j.statut === 'en_cours').length}
                </span>
                <span className="text-[10px] text-gray-500">Sur la machine</span>
              </div>
            </div>

            {/* AU MILIEU : EN ATTENTE DE PAIEMENT */}
            <section className={dashboardStyles.middleSection}>
              <div className={dashboardStyles.sectionTitle}>
                <span>Terminés - Attente de paiement</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {unpaidJobs.length}
                </span>
              </div>

              {unpaidJobs.length === 0 ? (
                <div className="p-4 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
                  Aucun cordage en attente de paiement.
                </div>
              ) : (
                <div className={dashboardStyles.unpaidList}>
                  {unpaidJobs.map((job) => (
                    <div key={job.id} className={dashboardStyles.unpaidCard}>
                      <div>
                        <p className={dashboardStyles.unpaidClient}>Client #{job.clientId}</p>
                        <p className={dashboardStyles.unpaidRacquet}>
                          {job.cordageMontant} - {job.tensionMontant}kg
                        </p>
                      </div>
                      <span className={dashboardStyles.unpaidPrice}>{job.prix} €</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VUES SECONDAIRES */}
        {activeTab === 'todo' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-3">Liste des cordages à faire ({jobsToDo.length})</h2>
            <p className="text-sm text-gray-500">Détail des travaux en attente de réalisation...</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-3">Historique chronologique</h2>
            <p className="text-sm text-gray-500">Tous les cordages réalisés...</p>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-3">Répertoire Clients</h2>
            <p className="text-sm text-gray-500">Liste de vos clients par ordre chronologique...</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-3">Statistiques & Meilleurs Clients</h2>
            <p className="text-sm text-gray-500">Chiffre d'affaires, meilleures marques...</p>
          </div>
        )}
      </main>

      {/* MODALE D'AJOUT DE NOUVEAU CORDAGE (+) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800">Ajouter un Cordage</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>
            
            <AddClientAndRacquetForm
              onSuccess={() => {
                setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* BARRE DE NAVIGATION ET BOUTON (+) PERMANENTS */}
      <BottomNav
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddClick={() => setShowAddModal(true)}
      />
    </div>
  );
}