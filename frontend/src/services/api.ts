export const api = {
  // Mock endpoint for farmer's crop data
  async getFarmerProfile(_farmerId: string) {
    return {
      name: "Ramesh Kumar",
      crops: [
        { name: "Wheat", riskLevel: "low", priceTrend: "up" },
        { name: "Potato", riskLevel: "high", priceTrend: "down" }
      ]
    };
  },
  
  // Real-time chatbot processing
  async processVoiceCommand(_audioBlob: Blob) {
    return {
      text: "Is it a good time to sell potatoes?",
      intent: "price_inquiry",
      response: "Current market trends show a sharp decline in potato prices locally, but neighboring mandis are offering better rates. Let me check the mandi map for you."
    };
  },
  
  // BigQuery pre-computed risk data
  async getRecommendation(_crop: string, _location: string) {
    return {
      verdict: "RELOCATE",
      confidence: 89,
      localPrice: 1200,
      relocatePrice: 1600,
      transportCost: 150,
      netGain: 250
    };
  },
  
  // Nearest Mandi Map real-time pricing
  async getMandiPrices(_crop: string) {
    return [
      { id: 1, name: "Azadpur Mandi", distance: 45, price: 1600, trend: "up" },
      { id: 2, name: "Ghazipur Mandi", distance: 55, price: 1550, trend: "stable" },
      { id: 3, name: "Local APMC", distance: 10, price: 1200, trend: "down" }
    ];
  },

  // Desktop: Distress-Risk Watch Alerts
  async getDistressAlerts() {
    return [
      { id: "ALT-992", mandi: "Azadpur Mandi", state: "Delhi", crop: "Onion", currentPrice: 1250, trend: -12, forecastPrice: 1100, riskScore: 85, status: "High Risk" },
      { id: "ALT-993", mandi: "Karnal Mandi", state: "Haryana", crop: "Wheat", currentPrice: 2125, trend: -4, forecastPrice: 2050, riskScore: 60, status: "Watch" },
      { id: "ALT-994", mandi: "Khanna Mandi", state: "Punjab", crop: "Rice", currentPrice: 3200, trend: 1.5, forecastPrice: 3250, riskScore: 25, status: "Stable" },
      { id: "ALT-995", mandi: "Lasalgaon", state: "Maharashtra", crop: "Onion", currentPrice: 900, trend: -18, forecastPrice: 750, riskScore: 92, status: "High Risk" }
    ];
  },

  // Desktop: Market Heatmap Data
  async getMarketHeatmap() {
    return [
      { region: "Maharashtra", status: "Critical", volume: "450k", trend: -12.5 },
      { region: "Karnataka", status: "Stable", volume: "210k", trend: 1.2 },
      { region: "Punjab", status: "Warning", volume: "890k", trend: -4.3 },
      { region: "Andhra Pradesh", status: "Stable", volume: "320k", trend: 2.4 }
    ];
  },

  // Real-time Dashboard Metrics
  async getDashboardMetrics() {
    const res = await fetch("http://localhost:8000/api/dashboard/metrics");
    if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
    return res.json();
  },

  // Real-time Dashboard AI Brief
  async getDashboardAIBrief() {
    const res = await fetch("http://localhost:8000/api/dashboard/ai-brief");
    if (!res.ok) throw new Error("Failed to fetch dashboard AI brief");
    return res.json();
  }
};
