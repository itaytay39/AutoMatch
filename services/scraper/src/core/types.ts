export interface SearchCriteria {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  maxPrice?: number
  maxKm?: number
  city?: string
  page?: number
}

export interface Listing {
  externalId: string
  source: string
  url: string
  title: string
  make: string
  model: string
  year: number
  mileage?: number
  price: number
  city?: string
  description?: string
  images: string[]
  // enriched fields
  plate?: string
  hand?: number
  trim?: string
  engine?: string
  fuelType?: string
  seller?: string
  region?: string
  daysOnLot?: number
}

export interface CarConnector {
  name: string
  baseUrl: string
  search(criteria: SearchCriteria): Promise<Listing[]>
  fetchDetails(url: string): Promise<Partial<Listing>>
}
