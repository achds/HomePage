import { Service, AppSettings } from '@/types';

const API_BASE = '/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/services');
  }

  async createService(service: Omit<Service, 'id' | 'order'>): Promise<Service> {
    const id = Date.now().toString();
    const response = await this.request<{ success: boolean; id: string }>('/services', {
      method: 'POST',
      body: JSON.stringify({ ...service, id, order: 0 }),
    });
    
    return {
      id: response.id,
      ...service,
      order: 0
    };
  }

  async updateService(id: string, service: Partial<Service>): Promise<{ success: boolean }> {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  }

  async deleteService(id: string): Promise<{ success: boolean }> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getSettings(): Promise<AppSettings> {
    return this.request<AppSettings>('/settings');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async importData(data: { services: Service[]; settings: AppSettings }): Promise<{ success: boolean }> {
    return this.request('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportData(): Promise<{ services: Service[]; settings: AppSettings; exportDate: string }> {
    return this.request('/export');
  }

  async clearAll(): Promise<{ success: boolean }> {
    return this.request('/clear-all', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
