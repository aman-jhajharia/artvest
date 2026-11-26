/**
 * Helper to compute live deadline status, relative countdown, and formatted localized date.
 */
export interface DeadlineInfo {
  isExpired: boolean;
  label: string;
  formattedDate: string;
}

export function getDeadlineInfo(deadlineStr?: string | null): DeadlineInfo | null {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  const formattedDate = deadline.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffMs <= 0) {
    return {
      isExpired: true,
      label: 'Funding Deadline Expired',
      formattedDate,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeRemaining = '';
  if (days > 0) {
    timeRemaining = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    timeRemaining = `${hours}h ${minutes}m left`;
  } else {
    timeRemaining = `${Math.max(1, minutes)}m left`;
  }

  return {
    isExpired: false,
    label: timeRemaining,
    formattedDate,
  };
}
