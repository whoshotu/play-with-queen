import type { Role } from "@/lib/types";

export function canEditBoards(role: Role) {
  return role === "admin" || role === "mod";
}

export function canEditAnnouncements(role: Role) {
  return role === "admin" || role === "mod";
}

export function canEditDice(role: Role) {
  return role === "admin";
}

export function canManageRoles(role: Role) {
  return role === "admin";
}
