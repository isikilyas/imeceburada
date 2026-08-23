import { UserRole } from "@imeceburada/shared";

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}
