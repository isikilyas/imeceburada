export interface SubcontractorDirectoryEntryDto {
  id: string;
  companyName: string;
  city: string;
  district?: string | null;
  tradeCategories: string[];
  description?: string | null;
}

export interface SubcontractorDirectoryDetailDto extends SubcontractorDirectoryEntryDto {
  phone?: string | null;
}

export interface SubcontractorDirectorySearchQuery {
  tradeCategory?: string;
  city?: string;
  district?: string;
  page?: number;
  pageSize?: number;
}