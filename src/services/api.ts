import { 
  type DailySalesEntry, 
  type Scheme 
} from './mockData';

// Storage Keys
const USER_KEY = 'vsaathi_user';
const CHAT_KEY = 'vsaathi_chat';

// User Interface
export interface UserProfile {
  name: string;
  phone: string;
  businessType: string;
  location: string;
  token?: string;
}

// Check if we want to use backend API instead of mock
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// API Fetch Helper with logging and automatic 401 logout
async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${BACKEND_URL}${path}`;
  const method = options.method || 'GET';
  
  // Attach Authorization header if token exists in localStorage
  const userJson = localStorage.getItem(USER_KEY);
  const token = userJson ? JSON.parse(userJson)?.token : null;
  
  const headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, options.headers);
    }
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`[API REQUEST] ${method} ${url}`, options.body ? JSON.parse(options.body as string) : '');

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      console.warn('[API 401] Unauthorized or expired token. Logging out...');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(CHAT_KEY);
      window.location.reload();
      throw new Error('Session expired. Please login again.');
    }

    const contentType = response.headers.get('content-type');
    let res: any;

    if (contentType && contentType.includes('application/json')) {
      res = await response.json();
      console.log(`[API RESPONSE] ${method} ${url} Status: ${response.status}`, res);
    } else {
      const errorText = await response.text();
      console.error(`[API NON-JSON RESPONSE] ${method} ${url} Status: ${response.status}`, errorText);
      throw new Error(`Server returned error: ${response.statusText || response.status}`);
    }
    
    if (!response.ok || !res.success) {
      throw new Error(res.message || `API request failed with status ${response.status}`);
    }
    
    return res;
  } catch (error: any) {
    console.error(`[API ERROR] ${method} ${url}`, error);
    throw error;
  }
}

// Mappers for schemas
const mapFrontendToBackendBusinessType = (type: string): string => {
  switch (type) {
    case 'vegetable_vendor':
    case 'fruit_seller':
      return 'Fruit/Vegetable Vendor';
    case 'chai_stall':
      return 'Tea Stall';
    case 'fast_food':
      return 'Food Stall';
    case 'garments':
      return 'Clothing/Apparel';
    case 'handicrafts':
      return 'Handicrafts/Artisan';
    case 'grocery':
      return 'Grocery/Kirana';
    case 'electronics':
      return 'Electronics Repair';
    case 'cosmetics':
      return 'Cosmetics/Accessories';
    case 'footwear':
      return 'Footwear';
    case 'other':
      return 'Other';
    default:
      const validBackendTypes = [
        "Food Stall", "Tea Stall", "Fruit/Vegetable Vendor", 
        "Clothing/Apparel", "Handicrafts/Artisan", "Grocery/Kirana", 
        "Electronics Repair", "Cosmetics/Accessories", "Footwear", "Other"
      ];
      if (validBackendTypes.includes(type)) {
        return type;
      }
      return 'Other';
  }
};

const mapBackendToFrontendBusinessType = (type: string): string => {
  switch (type) {
    case 'Fruit/Vegetable Vendor':
      return 'vegetable_vendor';
    case 'Tea Stall':
      return 'chai_stall';
    case 'Food Stall':
      return 'fast_food';
    case 'Clothing/Apparel':
      return 'garments';
    case 'Handicrafts/Artisan':
      return 'handicrafts';
    case 'Grocery/Kirana':
      return 'grocery';
    case 'Electronics Repair':
      return 'electronics';
    case 'Cosmetics/Accessories':
      return 'cosmetics';
    case 'Footwear':
      return 'footwear';
    case 'Other':
      return 'other';
    default:
      const validFrontendTypes = [
        'vegetable_vendor', 'chai_stall', 'fruit_seller', 
        'fast_food', 'garments', 'handicrafts', 'grocery', 
        'electronics', 'cosmetics', 'footwear', 'other'
      ];
      if (validFrontendTypes.includes(type)) {
        return type;
      }
      return 'other'; // default fallback
  }
};

const mapBackendSalesEntry = (entry: any): DailySalesEntry => ({
  id: entry._id,
  date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : '',
  items: entry.items || [],
  totalExpense: entry.totalExpense || 0,
});

export const api = {
  // --- AUTH SERVICES ---
  async login(phone: string, passwordHash: string): Promise<UserProfile> {
    const res = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password: passwordHash })
    });
    
    const userProfile: UserProfile = {
      name: res.data.vendor.name,
      phone: res.data.vendor.phone,
      businessType: mapBackendToFrontendBusinessType(res.data.vendor.businessType),
      location: res.data.vendor.location,
      token: res.data.accessToken
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
    return userProfile;
  },

  async register(name: string, phone: string, businessType: string, location: string, passwordHash: string): Promise<UserProfile> {
    await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        phone, 
        businessType: mapFrontendToBackendBusinessType(businessType), 
        location, 
        password: passwordHash 
      })
    });
    // Since backend register endpoint does not return a token, log in automatically
    return this.login(phone, passwordHash);
  },

  getCurrentUser(): UserProfile | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  async logout(): Promise<void> {
    const token = this.getCurrentUser()?.token;
    if (token) {
      await apiFetch('/users/logout', {
        method: 'POST'
      });
    }
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CHAT_KEY);
  },

  // --- SALES TRACKER SERVICES ---
  async getSales(): Promise<DailySalesEntry[]> {
    const res = await apiFetch('/sales?limit=100');
    return (res.data || []).map(mapBackendSalesEntry);
  },

  async addSalesEntry(entry: Omit<DailySalesEntry, 'id'>): Promise<DailySalesEntry> {
    const res = await apiFetch('/sales', {
      method: 'POST',
      body: JSON.stringify({
        date: entry.date,
        items: entry.items,
        totalExpense: entry.totalExpense
      })
    });
    return mapBackendSalesEntry(res.data);
  },

  async deleteSalesEntry(id: string): Promise<boolean> {
    const res = await apiFetch(`/sales/${id}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // --- SCHEME SERVICES ---
  async getSchemes(): Promise<Scheme[]> {
    const res = await apiFetch('/schemes');
    const backendSchemes = res.data || [];
    return backendSchemes.map((bs: any) => ({
      id: bs._id,
      name: bs.name,
      description: bs.description,
      eligibility: bs.eligibility,
      applyLink: bs.applyLink || "",
      category: bs.category || "General"
    }));
  },

  // --- AI INSIGHTS SERVICE ---
  async getInsights(): Promise<any> {
    const res = await apiFetch('/insights');
    const data = res.data;
    let scoreColor = 'text-warning-500 bg-amber-50 border-amber-200';
    if (data.cashFlowScore === 'Good') {
      scoreColor = 'text-primary-600 bg-green-50 border-green-200';
    } else if (data.cashFlowScore === 'Needs Attention') {
      scoreColor = 'text-danger-500 bg-red-50 border-red-200';
    }

    return {
      cashFlowScore: data.cashFlowScore || 'Okay',
      scoreColor,
      savingsTip: data.savingsTip || '',
      demandPrediction: data.prediction || '',
      restockTips: data.restockTip ? [data.restockTip] : []
    };
  },

  // --- CHATBOT SERVICES ---
  async getChatHistory(): Promise<any[]> {
    const chatJson = localStorage.getItem(CHAT_KEY);
    if (!chatJson) {
      const welcomeMessage = [
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Namaste! Main VendorSaathi AI hoon. Main aapki kya madad kar sakta hoon? Aap mujhse PM SVANidhi ya bank loan ke baare me pooch sakte hain.',
          timestamp: new Date().toISOString()
        }
      ];
      localStorage.setItem(CHAT_KEY, JSON.stringify(welcomeMessage));
      return welcomeMessage;
    }
    return JSON.parse(chatJson);
  },

  async sendChatMessage(text: string): Promise<any[]> {
    const history = await this.getChatHistory();
    
    // User message
    const userMsg = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    history.push(userMsg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(history));

    // Map history messages into Groq-SDK expected system structure
    const backendHistory = history.slice(0, -1).map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text
    }));

    const res = await apiFetch('/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ question: text, history: backendHistory })
    });
    
    const botResponse = res.data;
    history.push({
      id: Math.random().toString(36).substring(2, 9),
      sender: 'bot',
      text: botResponse.answer,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(CHAT_KEY, JSON.stringify(history));
    return history;
  },

  async clearChatHistory(): Promise<void> {
    localStorage.removeItem(CHAT_KEY);
  },

  async updateSalesEntry(entryId: string, data: { items?: any[], totalExpense?: number }): Promise<DailySalesEntry> {
    const res = await apiFetch(`/sales/${entryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return mapBackendSalesEntry(res.data);
  },

  async getCurrentVendor(): Promise<UserProfile> {
    const res = await apiFetch('/users/me');
    const vendor = res.data;
    return {
      name: vendor.name,
      phone: vendor.phone,
      businessType: mapBackendToFrontendBusinessType(vendor.businessType),
      location: vendor.location,
      token: api.getCurrentUser()?.token
    };
  },

  async updateVendorDetails(data: { name?: string, businessType?: string, location?: string }): Promise<UserProfile> {
    const backendData = {
      ...data,
      ...(data.businessType && { businessType: mapFrontendToBackendBusinessType(data.businessType) })
    };
    const res = await apiFetch('/users/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(backendData)
    });
    const vendor = res.data;
    const updatedProfile: UserProfile = {
      name: vendor.name,
      phone: vendor.phone,
      businessType: mapBackendToFrontendBusinessType(vendor.businessType),
      location: vendor.location,
      token: api.getCurrentUser()?.token
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    const res = await apiFetch('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return res.success;
  }
};
