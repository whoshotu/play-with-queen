import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  canEditAnnouncements,
  canEditBoards,
  canManageRoles,
  canEditDice,
} from "@/lib/permissions";
import { useAppStore } from "@/store/useAppStore";
import { IndividualDiceCustomizer } from "@/components/dice/individual-dice-customizer";

export default function AdminPage() {
  const user = useAppStore((s) => s.user);

  const canBoards = user ? canEditBoards(user.role) : false;
  const canRoles = user ? canManageRoles(user.role) : false;
  const canAnn = user ? canEditAnnouncements(user.role) : false;
  const canDice = user ? canEditDice(user.role) : false;

  const menuItems = useAppStore((s) => s.menuItems);
  const mediaItems = useAppStore((s) => s.mediaItems);
  const announcements = useAppStore((s) => s.announcements);

  const updateMenuItem = useAppStore((s) => s.updateMenuItem);
  const removeMenuItem = useAppStore((s) => s.removeMenuItem);

  const updateMediaItem = useAppStore((s) => s.updateMediaItem);
  const removeMediaItem = useAppStore((s) => s.removeMediaItem);

  const updateAnnouncement = useAppStore((s) => s.updateAnnouncement);
  const removeAnnouncement = useAppStore((s) => s.removeAnnouncement);

  const call = useAppStore((s) => s.call);
  const setCall = useAppStore((s) => s.setCall);

  const setRole = useAppStore((s) => s.setRole);

  if (!user || user.role === "guest" || user.role === "visitor") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            This area is for creators and moderators only. Log in with creator access to manage content.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin dashboard</CardTitle>
          <CardDescription>Role-based controls for boards, dice, and the call overlay.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="boards">
        <TabsList>
          <TabsTrigger value="boards">Boards</TabsTrigger>
          <TabsTrigger value="dice">Dice</TabsTrigger>
          <TabsTrigger value="call">Call</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="boards">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Menu board items</CardTitle>
                <CardDescription>Edit existing items (mod/admin).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {menuItems.map((m) => (
                  <div key={m.id} className="grid gap-2 rounded-lg border p-3">
                    <Input
                      value={m.title}
                      disabled={!canBoards}
                      onChange={(e) => updateMenuItem(m.id, { title: e.target.value })}
                    />
                    <Input
                      value={m.description ?? ""}
                      disabled={!canBoards}
                      placeholder="Description"
                      onChange={(e) => updateMenuItem(m.id, { description: e.target.value })}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canBoards}
                        onClick={() => removeMenuItem(m.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media board items</CardTitle>
                <CardDescription>Edit existing items (mod/admin).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {mediaItems.map((m) => (
                  <div key={m.id} className="grid gap-2 rounded-lg border p-3">
                    <Input
                      value={m.title}
                      disabled={!canBoards}
                      onChange={(e) => updateMediaItem(m.id, { title: e.target.value })}
                    />
                    <Input
                      value={m.url ?? ""}
                      disabled={!canBoards}
                      placeholder="URL"
                      onChange={(e) => updateMediaItem(m.id, { url: e.target.value, mediaType: "link" })}
                    />
                    {m.mediaType === "image" && m.url ? (
                      <div className="overflow-hidden rounded-lg border bg-muted/30">
                        <img src={m.url} alt={m.title} className="aspect-video w-full object-cover" />
                      </div>
                    ) : null}
                    {m.mediaType === "video" && m.url ? (
                      <div className="overflow-hidden rounded-lg border bg-black">
                        <video src={m.url} controls className="aspect-video w-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canBoards}
                        onClick={() => removeMediaItem(m.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Edit or delete announcements (mod/admin).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="grid gap-2 rounded-lg border p-3">
                    <Input
                      value={a.title}
                      disabled={!canAnn}
                      onChange={(e) => updateAnnouncement(a.id, { title: e.target.value })}
                    />
                    <Input
                      value={a.body}
                      disabled={!canAnn}
                      onChange={(e) => updateAnnouncement(a.id, { body: e.target.value })}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canAnn}
                        onClick={() => removeAnnouncement(a.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dice">
          <IndividualDiceCustomizer />
        </TabsContent>

        <TabsContent value="call">
          <Card>
            <CardHeader>
              <CardTitle>Call overlay</CardTitle>
              <CardDescription>Controls what viewers see in the call view.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={call.showDiceOverlay}
                  onCheckedChange={(checked) => setCall({ showDiceOverlay: checked })}
                  id="call-dice-overlay"
                />
                <Label htmlFor="call-dice-overlay">Show dice overlay</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role management</CardTitle>
              <CardDescription>Prototype-only, no backend yet.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-sm">
                Current role: <span className="font-medium">{user.role}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={!canRoles} onClick={() => setRole("admin")}>
                  Make admin
                </Button>
                <Button variant="outline" disabled={!canRoles} onClick={() => setRole("mod")}>
                  Make mod
                </Button>
                <Button variant="outline" disabled={!canRoles} onClick={() => setRole("visitor")}>
                  Make visitor
                </Button>
              </div>

              {!canRoles ? (
                <div className="text-muted-foreground text-sm">Only admin can change roles.</div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
