
export interface SaleItem {
  id: string;
  title: string;
  originalDescription: string;
  enhancedDescription: string;
  price: number;
  category: string;
  condition: string;
  photos: string[]; // base64 strings
  facebookContent: string;
  craigslistContent: string;
  whatsappContent: string;
  createdAt: number;
  isSold: boolean;
}

export type ViewState = 'catalog' | 'admin' | 'add' | 'edit';

export interface AIAnalysisResult {
  title: string;
  category: string;
  condition: string;
  suggestedPrice: number;
  enhancedDescription: string;
  facebookContent: string;
  craigslistContent: string;
  whatsappContent: string;
}
