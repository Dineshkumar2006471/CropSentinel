// Centralized API service — all methods call the real backend (no mock data)

const API_TIMEOUT_MS = 10_000;

/** Centralized fetch wrapper with timeout and error handling */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    return await res.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Response Interfaces ─────────────────────────────────────────────

export interface MetricItem {
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardMetrics {
  total_farmers: MetricItem;
  crops_tracked: MetricItem;
  alerts_generated: MetricItem;
  distress_markets: MetricItem;
  prediction_accuracy: MetricItem;
  loss_prevented: MetricItem;
}

export interface AIBrief {
  date_week: string;
  anomaly_detected: string;
  recommendation: string;
  alert: string;
}

export interface TopMover {
  commodity: string;
  mandi: string;
  price: number;
  trend: number;
}

export interface MapMarket {
  market: string;
  district: string;
  commodity: string;
  price: number;
  risk_score: number;
}

export interface TrackerItem {
  commodity: string;
  avg_price: string;
  status: string;
}

export interface RecommendationResult {
  commodity: string;
  mandi: string;
  current_price: number;
  predicted_price_7d: number;
  trend_pct: number;
  risk_score: number;
  action: 'sell' | 'hold' | 'relocate';
  reason: string;
  data_freshness: string;
}

export interface AskResponse {
  intent: string;
  response: string;
}

// ─── API Methods ─────────────────────────────────────────────────────

export const api = {
  /** Real-time dashboard metrics from BigQuery */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return apiFetch<DashboardMetrics>('/api/dashboard/metrics');
  },

  /** AI-generated market brief from BigQuery risk data */
  async getDashboardAIBrief(): Promise<AIBrief> {
    return apiFetch<AIBrief>('/api/dashboard/ai-brief');
  },

  /** Top commodity price movements from forecast table */
  async getTopMovers(): Promise<TopMover[]> {
    return apiFetch<TopMover[]>('/api/forecast/top-movers');
  },

  /** Map data — top risk markets with coordinates */
  async getMapData(): Promise<{ markets: MapMarket[] }> {
    return apiFetch<{ markets: MapMarket[] }>('/api/map');
  },

  /** Get user commodity trackers */
  async getTrackers(): Promise<{ trackers: TrackerItem[] }> {
    return apiFetch<{ trackers: TrackerItem[] }>('/api/trackers');
  },

  /** Add a new commodity tracker */
  async addTracker(commodity: string): Promise<{ status: string; trackers: string[] }> {
    return apiFetch('/api/trackers', {
      method: 'POST',
      body: JSON.stringify({ commodity }),
    });
  },

  /** Remove a commodity tracker */
  async deleteTracker(commodity: string): Promise<{ status: string; trackers: string[] }> {
    return apiFetch(`/api/trackers/${encodeURIComponent(commodity)}`, {
      method: 'DELETE',
    });
  },

  /** Get sell/hold/relocate recommendation for a commodity */
  async getRecommendation(commodity: string, mandi?: string): Promise<RecommendationResult> {
    const params = new URLSearchParams({ commodity });
    if (mandi) params.set('mandi', mandi);
    return apiFetch<RecommendationResult>(`/api/recommend?${params.toString()}`);
  },

  /** Conversational AI query — grounded in BigQuery data via Gemini */
  async askCropSentinel(
    question: string,
    history: { role: string; parts: string[] }[] = []
  ): Promise<AskResponse> {
    return apiFetch<AskResponse>('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    });
  },
};
