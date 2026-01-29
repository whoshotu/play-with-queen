import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { Dice3, LayoutDashboard, LogOut, MessageSquareText, Video } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";

const navLinkClass = "flex items-center gap-2";

export function AppShell() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Creator hub</div>
              <div className="text-muted-foreground truncate text-xs">boards, dice, and live space</div>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Spaces</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Hub">
                    <NavLink to="/" className={navLinkClass}>
                      <MessageSquareText />
                      <span>Boards</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dice">
                    <NavLink to="/dice" className={navLinkClass}>
                      <Dice3 />
                      <span>Dice game</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {(user?.role === "admin" || user?.role === "creator") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Admin">
                      <NavLink to="/admin" className={navLinkClass}>
                        <LayoutDashboard />
                        <span>Admin</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Call view">
                    <NavLink to="/call" className={navLinkClass}>
                      <Video />
                      <span>Call view</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between gap-2 rounded-md border bg-background p-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name ?? "Guest User"}</div>
              <div className="text-muted-foreground truncate text-xs">{user?.role ?? "guest"}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => setUser(null)} title="Change name">
                <span className="sr-only">Change name</span>
                <LogOut />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <div className="border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">Interactive creator space</div>
                <div className="text-muted-foreground truncate text-xs">
                  Boards + live dice overlay, designed for streaming and visitors
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                {/* Space for status indicators or roles if needed */}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
