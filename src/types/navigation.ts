export type ActiveTab = 'dashboard' | 'todo' | 'unpaid' | 'history' | 'clients' | 'stats';

export interface DashboardStats {
  jobsToDoCount: number;
  unpaidCount: number;
}