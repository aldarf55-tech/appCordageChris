export const clientStyles = {
  container: 'p-4 space-y-4 max-w-md mx-auto pb-28',
  headerContainer: 'flex items-center justify-between',
  title: 'text-lg font-bold text-gray-900',
  countBadge: 'text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full',

  // Controls (Search + Sort)
  controlsWrapper: 'space-y-2',
  searchWrapper: 'relative flex items-center',
  searchInput: 'w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  searchIcon: 'w-5 h-5 absolute left-3 text-gray-400 pointer-events-none',
  clearButton: 'absolute right-3 text-gray-400 hover:text-gray-600 text-sm font-bold',

  sortWrapper: 'flex items-center justify-between text-xs text-gray-500 px-1',
  sortButton: 'flex items-center space-x-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors',

  // List & Cards
  listContainer: 'space-y-2.5',
  card: 'p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all active:scale-[0.99] cursor-pointer flex justify-between items-start',
  clientAvatar: 'w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm mr-3 shrink-0',
  clientName: 'font-semibold text-gray-900 text-sm',
  clientMeta: 'text-xs text-gray-500 mt-0.5 flex items-center space-x-2',
  clientPhone: 'text-xs font-medium text-gray-700 mt-1 flex items-center',
  dateBadge: 'text-[10px] text-gray-400',

  // Empty state
  emptyState: 'p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2',
  emptyTitle: 'text-sm font-semibold text-gray-700',
  emptySub: 'text-xs text-gray-400',
};