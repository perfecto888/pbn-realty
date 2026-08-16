// API Response Type Definitions

export interface PropertyData {
  id: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string | number | null;
  squareFeet: number | null;
  propertyType: string | null;
  currentNoi: string | number | null;
  currentCapRate: string | number | null;
  compositeScore: string | number | null;
  estimatedIrr: string | number | null;
  acquisitionStrategy: string | null;
  createdAt: Date | null;
}

export interface RecommendationData {
  id: number;
  date: Date;
  property: PropertyData;
  rank: number;
  compositeScore: string | number | null;
  irrEstimate: string | number | null;
}

export interface SavedPropertyData {
  id: number;
  propertyId: number;
  status: 'prospect' | 'reviewing' | 'offer' | 'contract' | 'closed' | 'pass';
  userEstimatedIrr: string | number | null;
  notes: any | null;
  createdAt: Date | null;
  property?: PropertyData;
}
