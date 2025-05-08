import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface LoginData {
  username: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role: 'user' | 'admin';
  salon?: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  author: User;
  category: 'nail_art' | 'marketing' | 'business_advice' | 'trends' | 'product_reviews' | 'tutorials' | 'other';
  tags: string[];
  published: boolean;
  featured: boolean;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  comments: BlogComment[];
}

interface BlogComment {
  id: number;
  user: User;
  name?: string;
  email?: string;
  content: string;
  approved: boolean;
  created_at: string;
}

interface BlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: 'nail_art' | 'marketing' | 'business_advice' | 'trends' | 'product_reviews' | 'tutorials' | 'other';
  tags: string[];
  published?: boolean;
  featured?: boolean;
  published_at?: string;
}

interface Salon {
  id: number;
  name: string;
  location: string;
  address?: string;
  phone_number?: string;
  email?: string;
  description?: string;
  services: string[];
  opening_hours?: string;
  sample_url: string;
  owner: string;
  template?: Template;
  claimed: boolean;
  claimed_at?: string;
  contact_status: 'notContacted' | 'contacted' | 'interested' | 'notInterested' | 'subscribed';
  created_at: string;
  updated_at: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  preview_image?: string;
  features: any;
  is_mobile_optimized: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  display_price: string;
  currency: string;
  features: string[];
  stripe_price_id: string;
  trial_period_days: number;
  is_active: boolean;
  is_popular: boolean;
}

interface PaymentIntentRequest {
  amount_cents: number;
  description: string;
  currency?: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  intentId: string;
}

interface SubscriptionRequest {
  plan_id: number;
}

interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  message?: string;
}

interface Stats {
  total_salons: number;
  sample_sites: number;
  active_subscriptions: number;
  pending_contacts: number;
  last_updated: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ReportOverviewData {
    total_visits: number;
    unique_ips: number;
    unique_authenticated_users: number;
    estimated_unique_visitors: number;
    visits_by_day: { day: string; count: number }[];
    popular_pages: { path: string; count: number }[];
    date_range: { start_date: string | null; end_date: string | null };
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

apiClient.interceptors.request.use((config: axios.InternalAxiosRequestConfig) => {
  const isAuthUrl = config.url?.includes('/token/') || config.url?.includes('/auth/');
  const isLoginOrRegister = config.url === '/register/';

  if (!isAuthUrl && !isLoginOrRegister) {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/token/refresh/')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          }
          return apiClient(originalRequest);
        } else {
            clearAuthTokens();
            if (typeof window !== 'undefined') {
               window.location.href = '/login';
            }
            return Promise.reject(error);
        }
      } catch (refreshError: any) {
        clearAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};


export const API = {
  auth: {
    login: async (data: LoginData): Promise<AxiosResponse<TokenResponse>> => {
      return await axios.post(`${API_BASE_URL}/api/token/`, data);
    },
    register: async (data: RegisterData): Promise<AxiosResponse<User>> => {
      return await axios.post(`${API_BASE_URL}/api/auth/register/`, data); 
    },
    verifyToken: async (token: string): Promise<AxiosResponse<void>> => {
        return await axios.post(`${API_BASE_URL}/api/token/verify/`, { token });
    },
    changePassword: async (data: {
      current_password: string;
      new_password: string;
      new_password2: string;
    }): Promise<AxiosResponse<{ message: string }>> => {
      return await apiClient.put('/auth/change-password/', data); 
    },
    logout: async (): Promise<AxiosResponse<any>> => {
         return Promise.resolve({} as AxiosResponse<any>);
    },
  },

  user: {
    getProfile: async (): Promise<AxiosResponse<User>> => {
      return await apiClient.get('/auth/user/me/');
    },
    updateProfile: async (data: Partial<User>): Promise<AxiosResponse<User>> => {
      return await apiClient.patch('/auth/user/me/', data);
    },
    updateSalon: async (salonId: number | null): Promise<AxiosResponse<User>> => {
      return await apiClient.patch('/auth/users/me/salon/', { salon: salonId });
    },
  },

  blog: {
    listPosts: async (params?: {
      category?: string;
      featured?: boolean;
      limit?: number;
      offset?: number;
      published?: boolean;
      tag?: string;
    }): Promise<AxiosResponse<PaginatedResponse<BlogPost>>> => {
      return await apiClient.get('/blog/posts/', { params });
    },
    getPost: async (slug: string): Promise<AxiosResponse<BlogPost>> => {
      return await apiClient.get(`/blog/posts/${slug}/`);
    },
    createPost: async (data: BlogPostRequest): Promise<AxiosResponse<BlogPost>> => {
      return await apiClient.post('/blog/posts/', data);
    },
    updatePost: async (slug: string, data: Partial<BlogPostRequest>): Promise<AxiosResponse<BlogPost>> => {
      return await apiClient.patch(`/blog/posts/${slug}/`, data);
    },
    deletePost: async (slug: string): Promise<AxiosResponse<void>> => {
      return await apiClient.delete(`/blog/posts/${slug}/`);
    },
    listComments: async (
      slug: string,
      params?: { limit?: number; offset?: number }
    ): Promise<AxiosResponse<PaginatedResponse<BlogComment>>> => {
      return await apiClient.get(`/blog/posts/${slug}/comments/`, { params });
    },
    createComment: async (slug: string, data: {
      post?: number;
      name?: string;
      email?: string;
      content: string;
    }): Promise<AxiosResponse<BlogComment>> => {
      return await apiClient.post(`/blog/posts/${slug}/comments/`, data);
    },
    approveComment: async (id: number): Promise<AxiosResponse<BlogComment>> => {
      return await apiClient.post(`/blog/comments/${id}/approve/`);
    },
    deleteComment: async (id: number): Promise<AxiosResponse<void>> => {
      return await apiClient.delete(`/blog/comments/${id}/`);
    },
  },

  salons: {
    list: async (params?: {
      limit?: number;
      offset?: number;
      location?: string;
      claimed?: boolean;
    }): Promise<AxiosResponse<PaginatedResponse<Salon>>> => {
      return await apiClient.get('/salons/', { params });
    },
    get: async (id: number): Promise<AxiosResponse<Salon>> => {
      return await apiClient.get(`/salons/${id}/`);
    },
    getBySampleUrl: async (sampleUrl: string): Promise<AxiosResponse<Salon>> => {
      return await apiClient.get(`/salons/sample/${sampleUrl}/`);
    },
    create: async (data: {
      name: string;
      location: string;
      address?: string;
      phone_number?: string;
      email?: string;
      description?: string;
      services?: string[];
      opening_hours?: string;
      template_id?: number;
      contact_status?: 'notContacted' | 'contacted' | 'interested' | 'notInterested' | 'subscribed';
    }): Promise<AxiosResponse<Salon>> => {
      return await apiClient.post('/salons/', data);
    },
    update: async (id: number, data: Partial<Salon>): Promise<AxiosResponse<Salon>> => {
      return await apiClient.patch(`/salons/${id}/`, data);
    },
    delete: async (id: number): Promise<AxiosResponse<void>> => {
      return await apiClient.delete(`/salons/${id}/`);
    },
    claim: async (id: number): Promise<AxiosResponse<Salon>> => {
      return await apiClient.post(`/salons/${id}/claim/`);
    },
    markLeadsAsContacted: async (leadIds: number[]): Promise<AxiosResponse<{ message: string }>> => {
      return await apiClient.post('/salons/contact-leads/', { leadIds });
    },
  },

  templates: {
    list: async (params?: {
      limit?: number;
      offset?: number;
    }): Promise<AxiosResponse<PaginatedResponse<Template>>> => {
      return await apiClient.get('/templates/', { params });
    },
    get: async (id: number): Promise<AxiosResponse<Template>> => {
      return await apiClient.get(`/templates/${id}/`);
    },
  },

  payments: {
    createPaymentIntent: async (data: PaymentIntentRequest): Promise<AxiosResponse<PaymentIntentResponse>> => {
      return await apiClient.post('/payments/create-intent/', data);
    },
    createSubscription: async (data: SubscriptionRequest): Promise<AxiosResponse<SubscriptionResponse>> => {
      return await apiClient.post('/payments/create-subscription/', data);
    },
    listPlans: async (params?: {
      limit?: number;
      offset?: number;
    }): Promise<AxiosResponse<PaginatedResponse<SubscriptionPlan>>> => {
      return await apiClient.get('/payments/plans/', { params });
    },
    getPlan: async (id: number): Promise<AxiosResponse<SubscriptionPlan>> => {
      return await apiClient.get(`/payments/plans/${id}/`);
    },
  },

  core: {
    getStats: async (): Promise<AxiosResponse<Stats>> => {
      return await apiClient.get('/core/stats/');
    },
  },

  tracking: {
      getReportOverview: async (params?: {
          start_date?: string;
          end_date?: string;
      }): Promise<AxiosResponse<ReportOverviewData>> => {
          return await apiClient.get('/tracking/overview/', { params });
      },
  }
};

export { setAuthTokens, clearAuthTokens };