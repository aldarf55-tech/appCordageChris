export const dashboardStyles = {
  // Page container
  pageContainer: 'flex flex-col min-h-screen bg-gray-50 text-gray-800 pb-24 select-none',
  header: 'p-4 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-10',
  title: 'text-lg font-bold text-gray-900',
  
  // Grille du haut
  topGrid: 'p-4 grid grid-cols-2 gap-3',
  kpiCard: 'p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform flex flex-col justify-between min-h-[110px]',
  kpiValue: 'text-3xl font-black text-blue-600 my-1',
  kpiLabel: 'text-xs font-semibold text-blue-900 uppercase tracking-wider',

  // Section du milieu (Attente de paiement)
  middleSection: 'px-4 py-2 space-y-3',
  sectionTitle: 'text-sm font-bold text-gray-700 flex items-center justify-between',
  unpaidList: 'space-y-2',
  unpaidCard: 'p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm flex items-center justify-between active:bg-amber-100 transition-colors',
  unpaidClient: 'font-semibold text-sm text-amber-950',
  unpaidRacquet: 'text-xs text-amber-800',
  unpaidPrice: 'text-sm font-bold text-amber-900',

  // Barre de navigation du bas (3/4 gauche + 1/4 droite)
  bottomNavWrapper: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-between shadow-lg z-40 max-w-md mx-auto',
  navButtonsContainer: 'w-3/4 flex items-center justify-around pr-2 border-r border-gray-100',
  navButton: 'flex flex-col items-center justify-center p-1 text-gray-400 hover:text-blue-600 transition-colors text-[10px] font-medium',
  navButtonActive: 'flex flex-col items-center justify-center p-1 text-blue-600 font-bold text-[10px]',
  navIcon: 'w-6 h-6 mb-0.5',

  // Bouton flottant + (En bas à droite)
  fabButton: 'fixed bottom-4 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-xl flex items-center justify-center text-3xl font-light active:scale-90 transition-transform z-50 touch-manipulation',
};