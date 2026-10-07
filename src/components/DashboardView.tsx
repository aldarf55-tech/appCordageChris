import { useLiveQuery } from 'dexie-react-hooks';
import { dashboardStyles } from '@/styles/dashboardStyles';
import { getClosedJobs, getJobsToDo, getUnpaidJobs } from '@/services/dashboardServices';

interface DashboardViewProps {
  onNavigateToTodo: () => void;
  onNavigateToDone: () => void;
  onNavigateToClosed: () => void;
}

export function DashboardView({
  onNavigateToTodo,
  onNavigateToDone,
  onNavigateToClosed,
}: DashboardViewProps) {
  const jobsToDo = useLiveQuery(getJobsToDo) || [];
  const unpaidJobs = useLiveQuery(getUnpaidJobs) || [];
  const closedJobs = useLiveQuery(getClosedJobs) || [];

  return (
    <div className="flex w-full flex-1">
      <div className={dashboardStyles.topGrid}>
        <button
          type="button"
          onClick={onNavigateToTodo}
          className={dashboardStyles.kpiCard}
        >
          <span className={dashboardStyles.kpiLabel}>A FAIRE</span>
          <span className={dashboardStyles.kpiValue}>{jobsToDo.length}</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToDone}
          className={`${dashboardStyles.kpiCard} ${dashboardStyles.kpiCardDone}`}
        >
          <span className={`${dashboardStyles.kpiLabel} ${dashboardStyles.kpiLabelDone}`}>TERMINÉS</span>
          <span className={`${dashboardStyles.kpiValue} ${dashboardStyles.kpiValueDone}`}>{unpaidJobs.length}</span>
        </button>
        <button
          type="button"
          onClick={onNavigateToClosed}
          className={`${dashboardStyles.kpiCard} ${dashboardStyles.kpiCardClosed}`}
        >
          <span className={`${dashboardStyles.kpiLabel} ${dashboardStyles.kpiLabelClosed}`}>CLÔTURÉS</span>
          <span className={`${dashboardStyles.kpiValue} ${dashboardStyles.kpiValueClosed}`}>{closedJobs.length}</span>
        </button>
      </div>
    </div>
  );
}