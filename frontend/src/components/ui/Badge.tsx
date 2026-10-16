import type { HttpMethod, ApiDocStatus, IssueStatus, IssuePriority } from '../../types';

interface MethodBadgeProps { method: HttpMethod; }
interface DocStatusBadgeProps { status: ApiDocStatus; }
interface IssueStatusBadgeProps { status: IssueStatus; }
interface PriorityBadgeProps { priority: IssuePriority; }

export function MethodBadge({ method }: MethodBadgeProps) {
  const cls: Record<HttpMethod, string> = {
    GET:    'badge badge-get',
    POST:   'badge badge-post',
    PUT:    'badge badge-put',
    PATCH:  'badge badge-patch',
    DELETE: 'badge badge-delete',
  };
  return <span className={cls[method]}>{method}</span>;
}

export function DocStatusBadge({ status }: DocStatusBadgeProps) {
  const cls: Record<ApiDocStatus, string> = {
    Draft:      'badge badge-draft',
    Active:     'badge badge-active',
    Deprecated: 'badge badge-deprecated',
  };
  return <span className={cls[status]}>{status}</span>;
}

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  const cls: Record<IssueStatus, string> = {
    'Open':        'badge badge-open',
    'In Progress': 'badge badge-in-progress',
    'Resolved':    'badge badge-resolved',
    'Closed':      'badge badge-closed',
    'Reopened':    'badge badge-reopened',
  };
  return <span className={cls[status] ?? 'badge badge-draft'}>{status}</span>;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const cls: Record<IssuePriority, string> = {
    Low:    'badge badge-low',
    Medium: 'badge badge-medium',
    High:   'badge badge-high',
  };
  return <span className={cls[priority]}>{priority}</span>;
}
