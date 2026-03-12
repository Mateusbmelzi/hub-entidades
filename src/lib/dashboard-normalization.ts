export type ActivityItemType =
  | 'user_registration'
  | 'entity_creation'
  | 'event_creation'
  | 'project_creation'
  | 'interest_demonstration'
  | 'page_visit'
  | 'search'
  | 'user_login'
  | 'profile_update';

export interface ActivityItem {
  id: string;
  type: ActivityItemType;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  entity?: string;
  user?: string;
  pageUrl?: string;
  sessionId?: string;
}

export interface ActivityLogRowInput {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  status: string;
  entity_id?: number | null;
  user_id?: string | null;
  page_url?: string | null;
  session_id?: string | null;
}

const VALID_ACTIVITY_TYPES: ActivityItemType[] = [
  'user_registration',
  'entity_creation',
  'event_creation',
  'project_creation',
  'interest_demonstration',
  'page_visit',
  'search',
  'user_login',
  'profile_update',
];

export function mapActivityLogToItem(row: ActivityLogRowInput): ActivityItem {
  const type = VALID_ACTIVITY_TYPES.includes(row.activity_type as ActivityItemType)
    ? (row.activity_type as ActivityItemType)
    : 'page_visit';

  const status =
    row.status === 'completed' || row.status === 'pending' || row.status === 'failed'
      ? row.status
      : 'completed';

  return {
    id: row.id,
    type,
    title: row.title,
    description: row.description ?? '',
    timestamp: row.created_at,
    status,
    entity: row.entity_id?.toString(),
    user: row.user_id ?? undefined,
    pageUrl: row.page_url ?? undefined,
    sessionId: row.session_id ?? undefined,
  };
}
