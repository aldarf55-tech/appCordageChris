import React from 'react';
import type { ActiveTab } from '@/types/navigation';
import { dashboardStyles } from '@/styles/dashboardStyles';

interface BottomNavProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onAddClick,
}) => {
  return (
    <>
      <nav className={dashboardStyles.bottomNavWrapper}>
        <div className={dashboardStyles.navButtonsContainer}>
          {/* 1. ACCUEIL */}
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={currentTab === 'dashboard' ? dashboardStyles.navButtonActive : dashboardStyles.navButton}
          >
            <svg className={dashboardStyles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Accueil</span>
          </button>

          {/* 2. HISTORIQUE */}
          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={currentTab === 'history' ? dashboardStyles.navButtonActive : dashboardStyles.navButton}
          >
            <svg className={dashboardStyles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Historique</span>
          </button>

          {/* 3. CLIENTS */}
          <button
            type="button"
            onClick={() => onTabChange('clients')}
            className={currentTab === 'clients' ? dashboardStyles.navButtonActive : dashboardStyles.navButton}
          >
            <svg className={dashboardStyles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Clients</span>
          </button>

          {/* 4. STATS */}
          <button
            type="button"
            onClick={() => onTabChange('stats')}
            className={currentTab === 'stats' ? dashboardStyles.navButtonActive : dashboardStyles.navButton}
          >
            <svg className={dashboardStyles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Stats</span>
          </button>
        </div>

        {/* ESPACE RESERVE POUR L'ALIGNEMENT DU BOUTON FLOTTANT */}
        <div className="w-1/4" />
      </nav>

      {/* BOUTON FLOTTANT "+" EN BAS A DROITE */}
      <button
        type="button"
        onClick={onAddClick}
        aria-label="Ajouter un cordage"
        className={dashboardStyles.fabButton}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </>
  );
};