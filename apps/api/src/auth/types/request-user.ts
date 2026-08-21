import { UserRole } from "@bau360/shared";

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}
