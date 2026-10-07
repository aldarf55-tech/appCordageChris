import { useState } from 'react';
import type { ActiveTab } from '@/types/navigation';
import type { Client } from '@/types/client';
import { BottomNav } from '@/components/navigation/BottomNav';
import { AddClientAndRacquetForm } from '@/components/forms/AddClientAndRacquetForm';
import { dashboardStyles } from '@/styles/dashboardStyles';

import { DashboardView } from '@/components/DashboardView';
import { TodoView } from '@/components/TodoView';
import { DoneView } from '@/components/DoneView';
import { ClosedView } from '@/components/ClosedView';
import { HistoryView } from '@/components/HistoryView';
import { ClientsView } from '@/components/ClientsView';
import { StatsView } from '@/components/StatsView';

import { useAutoSync } from '@/hooks/useAutoSync';

const TAB_TITLES: Record<ActiveTab, string> = {
  dashboard: 'Tableau de bord',
  todo: 'À faire',
  done: 'Terminés',
  closed: 'Clôturés',
  clients: 'Répertoire clients',
  history: 'Historique',
  stats: 'Statistiques & Meilleurs Clients',
};

export default function App() {
  // Synchronisation automatique Supabase
  useAutoSync();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientForNewJob, setClientForNewJob] = useState<Client | null>(null);

  return (
    <div className={dashboardStyles.pageContainer}>
      {/* HEADER FIXE AVEC TITRE DYNAMIQUE */}
      <header className={dashboardStyles.header}>
        <h1 className={dashboardStyles.title}>
          {TAB_TITLES[activeTab] || 'Tableau de bord'}
        </h1>
      </header>

      {/* CONTENU DE LA VUE ACTIVE */}
      <main className="flex min-w-0 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateToTodo={() => setActiveTab('todo')}
            onNavigateToDone={() => setActiveTab('done')}
            onNavigateToClosed={() => setActiveTab('closed')}
          />
        )}
        {activeTab === 'todo' && <TodoView />}
        {activeTab === 'done' && <DoneView />}
        {activeTab === 'closed' && <ClosedView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'clients' && (
          <ClientsView
            onAddJobForClient={(client) => {
              setClientForNewJob(client);
              setShowAddModal(true);
            }}
          />
        )}
        {activeTab === 'stats' && <StatsView />}
      </main>

      {/* MODALE D'AJOUT DE NOUVEAU CORDAGE (+) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setClientForNewJob(null);
                }}
                className="text-gray-400 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <AddClientAndRacquetForm
              key={clientForNewJob?.id ?? 'new-client'}
              existingClient={clientForNewJob}
              onSuccess={() => {
                setShowAddModal(false);
                setClientForNewJob(null);
              }}
            />
          </div>
        </div>
      )}

      {/* BARRE DE NAVIGATION PERMANENTE */}
      <BottomNav
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddClick={() => setShowAddModal(true)}
      />
    </div>
  );
}