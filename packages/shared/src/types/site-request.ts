import { SiteRequestResponseStatus, SiteRequestStatus, SiteRequestType } from "./enums";

export interface SiteRequestDto {
  id: string;
  createdById: string;
  createdByName: string;
  requestType: SiteRequestType;
  tradeCategory?: string | null;
  equipmentType?: string | null;
  title: string;
  description: string;
  city: string;
  district?: string | null;
  latitude: number;
  longitude: number;
  neededCount: number;
  neededBy?: string | null;
  status: SiteRequestStatus;
  createdAt: string;
  responseCount: number;
}

export interface CreateSiteRequestInput {
  requestType: SiteRequestType;
  tradeCategory?: string;
  equipmentType?: string;
  title: string;
  description: string;
  city: string;
  district?: string;
  latitude: number;
  longitude: number;
  neededCount?: number;
  neededBy?: string;
}

export interface SiteRequestSearchQuery {
  city?: string;
  district?: string;
  requestType?: SiteRequestType;
}

export interface SiteRequestResponseDto {
  id: string;
  siteRequestId: string;
  responderId: string;
  responderName: string;
  message?: string | null;
  status: SiteRequestResponseStatus;
  createdAt: string;
}

export interface CreateSiteRequestResponseInput {
  message?: string;
}
