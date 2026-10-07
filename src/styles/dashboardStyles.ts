export const dashboardStyles = {
  // Page container (centré sur desktop avec max-w-md)
  pageContainer: 'flex flex-col min-h-screen bg-gray-50 text-gray-800 pb-24 select-none w-full max-w-none sm:max-w-md mx-auto',
  header: 'p-4 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-10',
  title: 'text-lg font-bold text-gray-900',
  
  // Grille du haut & cartes centrées
  topGrid: 'p-4 flex flex-1 flex-col sm:flex-row gap-3',
  kpiCard: 'w-full flex-1 p-3 bg-blue-50 border-2 border-blue-200 border-b-4 border-b-blue-300 rounded-xl cursor-pointer active:border-b-2 active:translate-y-1 transition-all duration-75 ease-out flex flex-col justify-center items-center text-center min-h-24 select-none touch-manipulation hover:bg-blue-100/60',
  kpiCardDone: 'bg-emerald-50 border-emerald-200 border-b-emerald-300 hover:bg-emerald-100/60',
  kpiCardClosed: 'bg-gray-100 border-gray-200 border-b-gray-300 hover:bg-gray-200/60',
  kpiValue: 'text-2xl font-black text-blue-600 my-1',
  kpiValueDone: 'text-emerald-700',
  kpiValueClosed: 'text-gray-700',
  kpiLabel: 'text-[10px] font-semibold text-blue-900 uppercase',
  kpiLabelDone: 'text-emerald-900',
  kpiLabelClosed: 'text-gray-800',

  // Section du milieu (Attente de paiement)
  middleSection: 'px-4 py-2 space-y-3',
  sectionTitle: 'text-sm font-bold text-gray-700 flex items-center justify-between',
  unpaidList: 'space-y-2',
  unpaidCard: 'p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm flex items-center justify-between active:bg-amber-100 transition-colors',
  unpaidClient: 'font-semibold text-sm text-amber-950',
  unpaidRacquet: 'text-xs text-amber-800',
  unpaidPrice: 'text-sm font-bold text-amber-900',

  // Barre de navigation du bas
  bottomNavWrapper: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-between shadow-lg z-40 w-full max-w-none sm:max-w-md mx-auto',
  navButtonsContainer: 'w-3/4 flex items-center justify-around pr-2 border-r border-gray-100',
  navButton: 'flex flex-col items-center justify-center p-1 text-gray-400 hover:text-blue-600 transition-colors text-[10px] font-medium',
  navButtonActive: 'flex flex-col items-center justify-center p-1 text-blue-600 font-bold text-[10px]',
  navIcon: 'w-6 h-6 mb-0.5',

  // Bouton flottant +
fabButton: 'fixed bottom-4 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center select-none active:scale-95 transition-all duration-150 z-50 touch-manipulation',};