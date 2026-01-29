import type { Role } from "@/lib/types";

export function canEditBoards(role: Role) {
  return role === "admin" || role === "mod" || role === "creator";
}

export function canEditAnnouncements(role: Role) {
  return role === "admin" || role === "mod" || role === "creator";
}

export function canEditDice(role: Role) {
  return role === "admin" || role === "creator";
}

export function canManageRoles(role: Role) {
  return role === "admin";
}

export function canManageCall(role: Role) {
  return role === "admin" || role === "mod";
}

export function canJoinCall(role: Role) {
  return true; // Everyone can join the call
}

export function canUseCameraByDefault(role: Role) {
  return role === "admin" || role === "mod" || role === "creator";
}

export function canSpeakByDefault(role: Role) {
  return role === "admin" || role === "mod" || role === "creator";
}

export function isAdminOrMod(role: Role) {
  return role === "admin" || role === "mod";
}
