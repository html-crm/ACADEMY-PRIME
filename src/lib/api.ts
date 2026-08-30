export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const ACCESS_KEY = "ap_access_token";
const REFRESH_KEY = "ap_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function saveTokens(access: string, refresh: string): void {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function rawRequest<T>(path: string, options: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    // Server components cache fetch() by default in Next 14; our data is
    // per-user and time-sensitive, so opt out of the data cache entirely.
    cache: "no-store",
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const detail = (body as { detail?: unknown })?.detail;
    const code =
      typeof detail === "object" && detail !== null
        ? String((detail as { code?: string }).code ?? "error")
        : "error";
    const message =
      typeof detail === "object" && detail !== null
        ? String((detail as { message?: string }).message ?? "Request failed")
        : typeof detail === "string"
          ? detail
          : "Request failed";
    throw new ApiError(response.status, code, message);
  }
  return body as T;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = typeof window !== "undefined" ? window.localStorage.getItem(REFRESH_KEY) : null;
  if (!refresh) return false;
  try {
    const pair = await rawRequest<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    });
    saveTokens(pair.access_token, pair.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !path.startsWith("/auth/")) {
      const refreshed = await tryRefresh();
      if (refreshed) return await rawRequest<T>(path, options);
    }
    throw err;
  }
}

export type TokenPair = { access_token: string; refresh_token: string };

export type Me = {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
};

export type DashboardSummary = {
  total_earned: string;
  available: string;
  pending: string;
  claimed: string;
  lessons_completed: number;
  courses_completed: number;
  wallet_address: string | null;
};

export type VideoPublic = {
  id: string;
  title: string;
  description: string | null;
  provider: string;
  provider_video_id: string | null;
  source_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  language: string;
  difficulty: string;
  format: string;
  documentary: boolean;
  effective_reward: string;
  required_watch_percentage: string;
};

export type CoursePublic = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  language: string;
  difficulty: string;
  video_count: number;
  total_duration: number;
};

export type PageOf<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type HeartbeatResult = {
  max_position_seconds: number;
  required_percentage: string;
  current_percentage: string;
  completed: boolean;
  reward_issued: boolean;
};

export type ProgressRow = {
  video_id: string;
  title: string;
  thumbnail_url: string | null;
  last_position_seconds: number;
  percentage: string;
  completed: boolean;
  updated_at: string;
};

export type AdminVideoRow = {
  id: string;
  title: string;
  provider: string;
  provider_video_id: string | null;
  duration_seconds: number | null;
  language: string;
  difficulty: string;
  format: string;
  status: string;
  expert_id: string | null;
  reward_amount: string | null;
  created_at: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  risk_score: number;
  created_at: string;
};

export type AdminExpertRow = {
  id: string;
  user_id: string;
  status: string;
  display_name: string;
  headline: string | null;
  review_note: string | null;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export type RewardSettingsData = {
  default_video_reward: string;
  course_bonus_reward: string;
  default_watch_percentage: string;
  daily_claim_limit: number;
  min_account_age_days: number;
  expert_model: string | null;
  expert_per_video_reward: string | null;
};

export type AdminStats = {
  users_total: number;
  users_active: number;
  experts_total: number;
  experts_pending: number;
  videos_total: number;
  videos_published: number;
  rewards_available: number;
  rewards_claimed: number;
  tokens_pending: string;
  tokens_claimed: string;
  tokens_issued: string;
};

export type ExpertProfile = {
  id: string;
  status: string;
  display_name: string;
  headline: string | null;
};

export type SubmittedVideo = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  provider: string;
  source_url: string;
  provider_video_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  difficulty: string;
  format: string;
  documentary: boolean;
  language: string;
  tags: string[];
  status: string;
};

export type RewardLedgerEntry = {
  id: string;
  entry_type: string;
  source_type: string;
  video_id: string | null;
  amount: string;
  token_mint: string;
  status: string;
  claimed_at: string | null;
  created_at: string;
};

export type ClaimRow = {
  id: string;
  wallet_address: string;
  amount: string;
  status: string;
  tx_signature: string | null;
  created_at: string;
};

export type ClaimRequestResult = {
  claims: ClaimRow[];
  total_amount: string;
  wallet_address: string;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_earned: string;
  earned_count: number;
  is_you: boolean;
};

export type LeaderboardOut = {
  items: LeaderboardEntry[];
  total_ranked: number;
  generated_at: string;
};

export type LeaderboardMeOut = {
  rank: number | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_earned: string;
  earned_count: number;
};

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  return new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  ).toString();
}

export const api = {
  register: (data: { email: string; username: string; password: string }) =>
    request<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<Me>("/auth/me"),
  dashboard: () => request<DashboardSummary>("/users/me/dashboard"),

  listVideos: (params: {
    q?: string;
    difficulty?: string;
    language?: string;
    format?: string;
    documentary?: boolean;
    sort?: string;
    page?: number;
    page_size?: number;
    exclude_in_course?: boolean;
  }) => request<PageOf<VideoPublic>>(`/content/videos?${qs({ ...params, exclude_in_course: params.exclude_in_course ? "true" : undefined, documentary: params.documentary === undefined ? undefined : (params.documentary ? "true" : "false") })}`),
  getVideo: (id: string) => request<VideoPublic>(`/content/videos/${id}`),
  listCategories: () => request<{ id: string; name: string; slug: string }[]>("/content/categories"),
  listCourses: (params: {
    q?: string;
    difficulty?: string;
    sort?: string;
    page?: number;
    page_size?: number;
  } = {  }) => request<PageOf<CoursePublic>>(`/content/courses?${qs(params)}`),

  listPartners: () => request<Partner[]>("/content/partners"),

  heartbeat: (data: {
    video_id: string;
    position_seconds: number;
    state?: string;
    ended?: boolean;
  }) => request<HeartbeatResult>("/progress/heartbeat", { method: "POST", body: JSON.stringify(data) }),
  myProgress: () => request<PageOf<ProgressRow>>("/progress/my?page_size=50"),

  linkWallet: (address: string) =>
    request<{ id: string; address: string; is_primary: boolean }>("/users/me/wallets", {
      method: "POST",
      body: JSON.stringify({ address, is_primary: true }),
    }),
  myRewards: () => request<PageOf<RewardLedgerEntry>>("/users/me/rewards?page_size=20"),
  myClaims: () => request<ClaimRow[]>("/users/me/rewards/claims"),
  claimRewards: () => request<ClaimRequestResult>("/users/me/rewards/claims", { method: "POST" }),

  leaderboard: (limit = 50) => request<LeaderboardOut>(`/leaderboard?limit=${limit}`),
  myLeaderboardStanding: () => request<LeaderboardMeOut>("/leaderboard/me"),

  applyExpert: (data: {
    display_name: string;
    headline?: string;
    bio?: string;
    links?: string[];
  }) => request<ExpertProfile>("/experts/apply", { method: "POST", body: JSON.stringify(data) }),
  myExpertProfile: () => request<ExpertProfile>("/experts/me"),
  submitVideo: (data: {
    title: string;
    description?: string;
    source_url: string;
    duration_seconds: number;
    difficulty: string;
    format: string;
    documentary?: boolean;
    language?: string;
    tags?: string[];
    course_id?: string;
  }) => request<SubmittedVideo>("/experts/videos", { method: "POST", body: JSON.stringify(data) }),
  mySubmittedVideos: () => request<SubmittedVideo[]>("/experts/me/videos"),
  updateSubmittedVideo: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      source_url: string;
      duration_seconds: number;
      difficulty: string;
      format: string;
      documentary?: boolean;
      language: string;
      tags: string[];
    }>,
  ) => request<SubmittedVideo>(`/experts/videos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubmittedVideo: (id: string) =>
    request<void>(`/experts/videos/${id}`, { method: "DELETE" }),
  myExpertEarnings: () =>
    request<{
      videos_total: number;
      videos_published: number;
      completions: number;
      learner_rewards_issued: string;
      earnings_pending: string;
      earnings_paid: string;
    }>("/experts/me/earnings"),

  adminStats: () => request<AdminStats>("/admin/stats"),
  adminVideos: (status?: string) =>
    request<AdminVideoRow[]>(`/admin/videos?${qs({ status_filter: status })}`),
  adminReviewVideo: (id: string, action: string, note?: string) =>
    request<{ id: string; status: string }>(`/admin/videos/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ action, note }),
    }),
  adminSetVideoReward: (id: string, reward_amount: string | null) =>
    request<{ id: string; reward_amount: string | null }>(`/admin/videos/${id}/reward`, {
      method: "PATCH",
      body: JSON.stringify({ reward_amount }),
    }),
  adminUsers: () => request<AdminUserRow[]>("/admin/users?page_size=100"),
  adminSetUserStatus: (id: string, status: string) =>
    request<AdminUserRow>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminExperts: (status?: string) =>
    request<AdminExpertRow[]>(`/admin/experts?${qs({ status_filter: status })}`),
  adminReviewExpert: (id: string, status: string, note?: string) =>
    request<AdminExpertRow>(`/admin/experts/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),
  adminPartners: () => request<Partner[]>("/admin/partners"),
  adminCreatePartner: (data: {
    name: string;
    logo_url?: string;
    website_url?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
  }) => request<Partner>("/admin/partners", { method: "POST", body: JSON.stringify(data) }),
  adminUpdatePartner: (
    id: string,
    data: Partial<{
      name: string;
      logo_url: string | null;
      website_url: string | null;
      description: string | null;
      is_active: boolean;
      sort_order: number;
    }>,
  ) => request<Partner>(`/admin/partners/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  adminDeletePartner: (id: string) =>
    request<void>(`/admin/partners/${id}`, { method: "DELETE" }),
  adminRewardSettings: () => request<RewardSettingsData>("/admin/settings/rewards"),
  adminUpdateRewardSettings: (data: Partial<RewardSettingsData>) =>
    request<RewardSettingsData>("/admin/settings/rewards", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),

  adminCreateVideo: (data: {
    title: string;
    description?: string;
    source_url: string;
    duration_seconds: number;
    difficulty: string;
    format: string;
    documentary?: boolean;
    language?: string;
    tags?: string[];
    course_id?: string;
    reward_amount?: string;
  }) => request<{ id: string; title: string; status: string }>("/admin/videos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};
