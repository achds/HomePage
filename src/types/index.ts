export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  order?: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface AppSettings {
  title: string;
  description: string;
  theme: 'light' | 'dark' | 'system';
}
