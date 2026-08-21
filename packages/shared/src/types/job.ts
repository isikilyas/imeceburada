import { EmploymentType, JobStatus, ListingIntent } from "./enums";

export interface JobPostingDto {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  listingType: ListingIntent;
  tradeCategory: string;
  city: string;
  district?: string | null;
  employmentType: EmploymentType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isUrgent: boolean;
  description: string;
  status: JobStatus;
  createdAt: string;
}

export interface CreateJobInput {
  title: string;
  listingType: ListingIntent;
  tradeCategory: string;
  city: string;
  district?: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  isUrgent?: boolean;
  description: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: JobStatus;
}

export interface JobSearchQuery {
  listingType?: ListingIntent;
  tradeCategory?: string;
  city?: string;
  district?: string;
  employmentType?: EmploymentType;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}