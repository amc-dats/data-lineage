import type { Status, EdgeStatus } from '../types';

export function statusFill(status: Status): string {
  switch (status) {
    case 'green':
      return 'var(--status-green)';
    case 'amber':
      return 'var(--status-amber)';
    case 'red':
      return 'var(--status-red)';
  }
}

export function statusInk(status: Status): string {
  switch (status) {
    case 'green':
      return 'var(--status-green-ink)';
    case 'amber':
      return 'var(--status-amber-ink)';
    case 'red':
      return 'var(--status-red-ink)';
  }
}

export function statusLabel(status: Status): string {
  switch (status) {
    case 'green':
      return 'Fully built & usable';
    case 'amber':
      return 'Actively being worked on';
    case 'red':
      return "Pipeline doesn't exist";
  }
}

export function edgeColor(status: EdgeStatus): string {
  return status === 'green' ? 'var(--status-green)' : 'var(--status-red)';
}

export function edgeStatusLabel(status: EdgeStatus): string {
  return status === 'green' ? 'Automated & connected' : 'Not automated / absent';
}
