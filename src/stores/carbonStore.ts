import { create } from "zustand";

export type TabType = "landing" | "dashboard" | "assistant" | "timemachine" | "analytics" | "settings" | "rewards";

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Recommendation {
  option_name: string;
  co2_value: number;
  reasoning: string;
  savings_potential: number;
}

export interface Simulation {
  id: number;
  query: string;
  category: string;
  baseline_co2: number;
  recommendations: Recommendation[];
}

export interface TimeStep {
  label: string;
  current_path_value: number;
  alternative_path_value: number;
  impact: string;
  savings: number;
  regret: number;
  score_change: number;
}

export interface TimeMachineData {
  query: string;
  timeline: TimeStep[];
  overall_savings: number;
  overall_regret: number;
  score_delta: number;
}

export interface CopilotAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  action_label: string;
  default_query: string;
}

export interface ChatMessage {
  sender: "user" | "ai" | "system";
  text: string;
  agentName?: string;
  timestamp: string;
  data?: any;
}

interface CarbonState {
  // Auth & Navigation
  user: User | null;
  token: string | null;
  currentTab: TabType;
  isLoading: boolean;
  error: string | null;
  
  // App States
  simulations: Simulation[];
  activeSimulation: Simulation | null;
  timeMachineData: TimeMachineData | null;
  copilotAlerts: CopilotAlert[];
  chatHistory: ChatMessage[];
  
  // Dashboard & Analytics
  carbonScore: number;
  riskIndex: string;
  totalSaved: number;
  categorySplit: { name: string; value: number }[];
  forecastData: { month: string; baseline: number; actual: number }[];
  
  // Actions
  setTab: (tab: TabType) => void;
  setError: (err: string | null) => void;
  clearError: () => void;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  runSimulation: (query: string) => Promise<void>;
  makeDecision: (optionName: string, co2Saved: number) => Promise<void>;
  runTimeMachine: (query: string) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchCopilotAlerts: () => Promise<void>;
}

const API_BASE = "http://localhost:8000/api/v1";

export const useCarbonStore = create<CarbonState>((set, get) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  currentTab: "landing",
  isLoading: false,
  error: null,
  
  simulations: [],
  activeSimulation: null,
  timeMachineData: null,
  copilotAlerts: [],
  chatHistory: [
    {
      sender: "system",
      text: "Carbon Shadow Multi-Agent Graph Online. Standing by for intent analysis...",
      timestamp: new Date().toLocaleTimeString()
    }
  ],
  
  carbonScore: 85,
  riskIndex: "Medium",
  totalSaved: 120,
  categorySplit: [
    { name: "Travel", value: 45 },
    { name: "Shopping", value: 25 },
    { name: "Food", value: 20 },
    { name: "Lifestyle", value: 10 }
  ],
  forecastData: [
    { month: "Jan", baseline: 220, actual: 220 },
    { month: "Feb", baseline: 215, actual: 205 },
    { month: "Mar", baseline: 210, actual: 195 },
    { month: "Apr", baseline: 205, actual: 180 },
    { month: "May", baseline: 200, actual: 170 },
    { month: "Jun", baseline: 195, actual: 155 }
  ],

  setTab: (tab) => set({ currentTab: tab }),
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      set({ 
        token: data.access_token, 
        user: { id: 1, email, role: "user" },
        currentTab: "dashboard",
        isLoading: false 
      });
      get().fetchDashboardStats();
      get().fetchCopilotAlerts();
      return true;
    } catch (e: any) {
      // Mock Login on backend failure (useful for direct demo loads)
      console.warn("Backend unavailable, loading mock session.");
      const mockUser = { id: 1, email, role: "user" };
      set({ 
        token: "mock-jwt-token", 
        user: mockUser, 
        currentTab: "dashboard",
        isLoading: false 
      });
      return true;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Registration failed");
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      // Mock Registration on backend failure
      set({ isLoading: false });
      return true;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ 
      user: null, 
      token: null, 
      currentTab: "landing", 
      activeSimulation: null, 
      timeMachineData: null 
    });
  },

  runSimulation: async (query) => {
    set({ isLoading: true, error: null });
    
    // Add User Message
    const userMsg: ChatMessage = {
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };
    
    set(state => ({ chatHistory: [...state.chatHistory, userMsg] }));

    try {
      const res = await fetch(`${API_BASE}/simulations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${get().token}`
        },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error("Simulation failed");
      const data = await res.json();
      
      // Simulate multi-agent steps in Chat History
      const agentSteps = [
        "🔍 [Intent Detection Agent]: Analyzing request. Travel parameters extracted.",
        "📊 [Carbon Simulation Agent]: Baseline driving emissions estimated: " + data.baseline_co2 + " kg CO2.",
        "💡 [Alternative Generation Agent]: 3 eco-friendly alternatives generated.",
        "⚖️ [Debate Agent]: Weighing feasibility, cost, and adoption speed.",
        "🏛️ [Decision Judge Agent]: Balanced recommendation scores finalized.",
        "🔮 [Future Twin Agent]: Simulated lifetime habit savings calculations completed.",
        "⚠️ [Regret Engine Agent]: 100x recurrence regret generated.",
        "✉️ [Recommendation Agent]: Complete decision package finalized."
      ];

      for (let i = 0; i < agentSteps.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        set(state => ({
          chatHistory: [
            ...state.chatHistory,
            {
              sender: "ai",
              text: agentSteps[i],
              agentName: "Multi-Agent System",
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        }));
      }

      set({ activeSimulation: data, isLoading: false });
      
    } catch (e) {
      console.warn("Backend unavailable, generating mock multi-agent responses.");
      // Fallback details
      let category = "Lifestyle";
      let baseline = 120.0;
      let recs: Recommendation[] = [
        { option_name: "Eco Option", co2_value: 20.0, reasoning: "Switch to a refurbished device.", savings_potential: 100.0 },
        { option_name: "Balanced Option", co2_value: 60.0, reasoning: "Rent for the weekend.", savings_potential: 60.0 },
        { option_name: "Best Option", co2_value: 20.0, reasoning: "Avoid direct purchase.", savings_potential: 100.0 }
      ];

      const q = query.toLowerCase();
      if (q.includes("travel") || q.includes("mysore")) {
        category = "Travel";
        baseline = 45.0;
        recs = [
          { option_name: "Eco Option", co2_value: 4.5, reasoning: "Take the train instead of driving alone. Saves 40.5 kg CO2.", savings_potential: 40.5 },
          { option_name: "Balanced Option", co2_value: 10.2, reasoning: "Use an electric vehicle. High convenience, 34.8 kg CO2 savings.", savings_potential: 34.8 },
          { option_name: "Best Option", co2_value: 4.5, reasoning: "Train trip cuts carbon footprint by 90%. Over 100 rides, saving is 4,050 kg CO2.", savings_potential: 40.5 }
        ];
      } else if (q.includes("laptop")) {
        category = "Shopping";
        baseline = 350.0;
        recs = [
          { option_name: "Eco Option", co2_value: 80.0, reasoning: "Buy refurbished laptop. Saves 270 kg CO2.", savings_potential: 270.0 },
          { option_name: "Balanced Option", co2_value: 150.0, reasoning: "Purchase a smaller tablet hybrid.", savings_potential: 200.0 },
          { option_name: "Best Option", co2_value: 80.0, reasoning: "Refurbished laptop cuts carbon by 77%. Reusing 100 devices saves 27,000 kg CO2.", savings_potential: 270.0 }
        ];
      } else if (q.includes("dinner") || q.includes("order")) {
        category = "Food";
        baseline = 6.8;
        recs = [
          { option_name: "Eco Option", co2_value: 1.2, reasoning: "Order a local vegetarian meal. Saves 5.6 kg CO2.", savings_potential: 5.6 },
          { option_name: "Balanced Option", co2_value: 4.2, reasoning: "Combine order for group delivery.", savings_potential: 2.6 },
          { option_name: "Best Option", co2_value: 1.2, reasoning: "Local vegetarian meal avoids intensive beef farming. 100 orders saves 560 kg CO2.", savings_potential: 5.6 }
        ];
      } else if (q.includes("scooter") || q.includes("electric scooter")) {
        category = "Travel";
        baseline = 150.0;
        recs = [
          { option_name: "Eco Option", co2_value: 12.0, reasoning: "Buy electric scooter. Saves 138 kg CO2.", savings_potential: 138.0 },
          { option_name: "Balanced Option", co2_value: 20.0, reasoning: "Use public transit share.", savings_potential: 130.0 },
          { option_name: "Best Option", co2_value: 12.0, reasoning: "Electric scooter cuts transit emissions. 100 trips saves 13,800 kg CO2.", savings_potential: 138.0 }
        ];
      }

      const mockData: Simulation = {
        id: Math.floor(Math.random() * 1000),
        query,
        category,
        baseline_co2: baseline,
        recommendations: recs
      };

      const agentSteps = [
        "🔍 [Intent Detection Agent]: Analyzing request. Intent detected: " + category,
        "📊 [Carbon Simulation Agent]: Baseline estimated at " + baseline + " kg CO2.",
        "💡 [Alternative Generation Agent]: Formulated eco-alternatives.",
        "⚖️ [Debate Agent]: Discussing costs vs environmental returns.",
        "🏛️ [Decision Judge Agent]: Scores computed and ranked.",
        "🔮 [Future Twin Agent]: Forecast profiles updated.",
        "⚠️ [Regret Engine Agent]: Generated 100x Carbon Regret calculations.",
        "✉️ [Recommendation Agent]: Complete decision package ready."
      ];

      for (let i = 0; i < agentSteps.length; i++) {
        await new Promise(r => setTimeout(r, 300));
        set(state => ({
          chatHistory: [
            ...state.chatHistory,
            {
              sender: "ai",
              text: agentSteps[i],
              agentName: "Multi-Agent System",
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        }));
      }

      set({ activeSimulation: mockData, isLoading: false });
    }
  },

  makeDecision: async (optionName, co2Saved) => {
    const active = get().activeSimulation;
    if (!active) return;
    
    try {
      await fetch(`${API_BASE}/simulations/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${get().token}`
        },
        body: JSON.stringify({
          simulation_id: active.id,
          chosen_option: optionName,
          co2_saved: co2Saved
        })
      });
    } catch (e) {
      console.warn("Backend offline, updating local states.");
    }
    
    // Proactively modify store stats
    set(state => ({
      totalSaved: state.totalSaved + co2Saved,
      carbonScore: Math.min(100, state.carbonScore + Math.floor(co2Saved / 5) + 1),
      activeSimulation: null,
      chatHistory: [
        ...state.chatHistory,
        {
          sender: "system",
          text: `Success! Commited to "${optionName}". You saved ${co2Saved.toFixed(1)} kg CO2!`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  },

  runTimeMachine: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/simulations/time-machine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${get().token}`
        },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error("Time Machine simulation failed");
      const data = await res.json();
      set({ timeMachineData: data, isLoading: false });
    } catch (e) {
      console.warn("Backend offline, using mock Time Machine data.");
      
      const q = query.toLowerCase();
      let steps: TimeStep[] = [];
      let overall_savings = 240.0;
      let overall_regret = 240.0;
      let score_delta = 10;
      
      if (q.includes("scooter") || q.includes("electric scooter")) {
        steps = [
          { label: "Purchase & Week 1", current_path_value: 12.5, alternative_path_value: 1.0, impact: "Low Footprint Shift", savings: 11.5, regret: 11.5, score_change: 2 },
          { label: "Month 3: Habit form", current_path_value: 37.5, alternative_path_value: 3.0, impact: "Significant Saving", savings: 34.5, regret: 34.5, score_change: 5 },
          { label: "Month 6: High usage", current_path_value: 75.0, alternative_path_value: 6.0, impact: "Offsetting Production", savings: 69.0, regret: 69.0, score_change: 8 },
          { label: "Year 1: Full Cycle", current_path_value: 150.0, alternative_path_value: 12.0, impact: "Eco Champion Status", savings: 138.0, regret: 138.0, score_change: 15 }
        ];
        overall_savings = 138.0;
        overall_regret = 138.0;
        score_delta = 15;
      } else if (q.includes("solar") || q.includes("solar panel")) {
        steps = [
          { label: "Month 1: Install", current_path_value: 150.0, alternative_path_value: 40.0, impact: "Initial Offset", savings: 110.0, regret: 110.0, score_change: 4 },
          { label: "Month 3: Sunny season", current_path_value: 450.0, alternative_path_value: 100.0, impact: "Grid Independent", savings: 350.0, regret: 350.0, score_change: 9 },
          { label: "Month 6: Half-Year", current_path_value: 900.0, alternative_path_value: 180.0, impact: "Zero Carbon Excess", savings: 720.0, regret: 720.0, score_change: 14 },
          { label: "Year 1: Return", current_path_value: 1800.0, alternative_path_value: 300.0, impact: "Grid Contributor", savings: 1500.0, regret: 1500.0, score_change: 22 }
        ];
        overall_savings = 1500.0;
        overall_regret = 1500.0;
        score_delta = 22;
      } else {
        steps = [
          { label: "Month 1", current_path_value: 25.0, alternative_path_value: 5.0, impact: "Slight reduction", savings: 20.0, regret: 20.0, score_change: 1 },
          { label: "Month 3", current_path_value: 75.0, alternative_path_value: 15.0, impact: "Steady conservation", savings: 60.0, regret: 60.0, score_change: 3 },
          { label: "Month 6", current_path_value: 150.0, alternative_path_value: 30.0, impact: "Active reduction", savings: 120.0, regret: 120.0, score_change: 5 },
          { label: "Year 1", current_path_value: 300.0, alternative_path_value: 60.0, impact: "High Sustainability Impact", savings: 240.0, regret: 240.0, score_change: 10 }
        ];
        overall_savings = 240.0;
        overall_regret = 240.0;
        score_delta = 10;
      }

      set({
        timeMachineData: { query, timeline: steps, overall_savings, overall_regret, score_delta },
        isLoading: false
      });
    }
  },

  fetchDashboardStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/simulations/dashboard/stats`, {
        headers: { "Authorization": `Bearer ${get().token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({
          carbonScore: data.score,
          riskIndex: data.risk_index,
          totalSaved: data.total_saved,
          categorySplit: data.category_split,
          forecastData: data.forecast
        });
      }
    } catch (e) {
      console.warn("Backend offline, keeping store mock metrics.");
    }
  },

  fetchCopilotAlerts: async () => {
    try {
      const res = await fetch(`${API_BASE}/simulations/copilot/proactive`, {
        headers: { "Authorization": `Bearer ${get().token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ copilotAlerts: data });
      }
    } catch (e) {
      // Backend offline alerts
      set({
        copilotAlerts: [
          {
            id: "copilot_travel",
            type: "travel",
            title: "Upcoming Weekend Detected",
            message: "Planning a trip from Mysore to Bangalore this weekend? Simulate your travel plans to cut up to 80% CO2.",
            action_label: "Simulate Trip",
            default_query: "I want to travel from Mysore to Bangalore this weekend."
          },
          {
            id: "copilot_energy",
            type: "energy",
            title: "Electricity Usage Shift",
            message: "Your electricity bills show a 14% seasonal usage increase. Check if solar panels can optimize your carbon footprint.",
            action_label: "Run Solar Simulation",
            default_query: "What if I install solar panels?"
          },
          {
            id: "copilot_shopping",
            type: "shopping",
            title: "Hardware Renewal Alert",
            message: "Is your main work laptop hitting its 3-year refresh cycle? Consider Refurbished alternatives.",
            action_label: "Compare Laptops",
            default_query: "I want to buy a new laptop."
          }
        ]
      });
    }
  }
}));
