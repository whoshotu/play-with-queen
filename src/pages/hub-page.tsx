import { format } from "date-fns";

import { BoardCard } from "@/components/app/board-card";
import { CallPanel } from "@/components/call/call-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { canEditBoards } from "@/lib/permissions";
import { compressImage, formatFileSize, validateImageFile, validateVideoFile } from "@/lib/image-utils";
import { useAppStore } from "@/store/useAppStore";

import { Heart, Star } from "lucide-react";
import * as React from "react";

function inferMediaTypeFromUrl(url: string | undefined): "link" | "image" | "video" {
  if (!url) return "link";
  if (url.startsWith("data:image")) return "image";
  if (url.startsWith("data:video")) return "video";
  return "link";
}

async function fileToDataUrl(file: File): Promise<string> {
  const validation = file.type.startsWith('image/')
    ? validateImageFile(file)
    : validateVideoFile(file);

  if (!validation.valid) {
    alert(validation.error);
    throw new Error(validation.error);
  }

  const compressed = file.type.startsWith('image/')
    ? await compressImage(file, 0.8)
    : file;

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(compressed);
  });
}

export default function HubPage() {
  const user = useAppStore((s) => s.user);

  const menuItems = useAppStore((s) => s.menuItems);
  const mediaItems = useAppStore((s) => s.mediaItems);
  const announcements = useAppStore((s) => s.announcements);

  const addMenuItem = useAppStore((s) => s.addMenuItem);
  const addMediaItem = useAppStore((s) => s.addMediaItem);
  const addAnnouncement = useAppStore((s) => s.addAnnouncement);

  const canEdit = user ? canEditBoards(user.role) : false;

  const [newMenuTitle, setNewMenuTitle] = React.useState("");
  const [newMenuDescription, setNewMenuDescription] = React.useState("");

  const [newMediaTitle, setNewMediaTitle] = React.useState("");
  const [newMediaUrl, setNewMediaUrl] = React.useState("");
  const [newMediaFile, setNewMediaFile] = React.useState<File | null>(null);
  const [addingMedia, setAddingMedia] = React.useState(false);

  const [newAnnTitle, setNewAnnTitle] = React.useState("");
  const [newAnnBody, setNewAnnBody] = React.useState("");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <BoardCard
          title="Menu board"
          description="No menu items yet"
          icon={
            <div className="flex items-center gap-1">
              <Heart className="fill-primary text-primary h-5 w-5" />
              <Star className="fill-secondary text-secondary h-4 w-4" />
            </div>
          }
          action={
            canEdit ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const safe = newMenuTitle.trim();
                  if (!safe) return;
                  addMenuItem({ title: safe, description: newMenuDescription.trim() || undefined });
                  setNewMenuTitle("");
                  setNewMenuDescription("");
                }}
              >
                Add
              </Button>
            ) : null
          }
        >
          {canEdit ? (
            <div className="mb-4 grid gap-2">
              <Input
                placeholder="New menu item title"
                value={newMenuTitle}
                onChange={(e) => setNewMenuTitle(e.target.value)}
              />
              <Input
                placeholder="Optional description"
                value={newMenuDescription}
                onChange={(e) => setNewMenuDescription(e.target.value)}
              />
            </div>
          ) : null}

          <div className="grid gap-3">
            {menuItems.map((m) => (
              <div key={m.id} className="rounded-lg border bg-background p-3">
                <div className="text-sm font-semibold">{m.title}</div>
                {m.description ? <div className="text-muted-foreground mt-1 text-sm">{m.description}</div> : null}
              </div>
            ))}
          </div>
        </BoardCard>

        <BoardCard
          title="Media board"
          description="No media uploaded yet"
          icon={
            <div className="flex items-center gap-1">
              <Star className="fill-secondary text-secondary h-5 w-5" />
              <Heart className="fill-primary text-primary h-4 w-4" />
            </div>
          }
          action={
            canEdit ? (
              <Button
                size="sm"
                variant="outline"
                disabled={addingMedia}
                onClick={async () => {
                  const safe = newMediaTitle.trim();
                  if (!safe) return;

                  setAddingMedia(true);
                  try {
                    if (newMediaFile) {
                      const url = await fileToDataUrl(newMediaFile);
                      const mediaType = newMediaFile.type.startsWith("video/") ? "video" : "image";
                      addMediaItem({
                        title: safe,
                        url,
                        mediaType,
                        fileName: newMediaFile.name,
                      });
                    } else {
                      addMediaItem({
                        title: safe,
                        url: newMediaUrl.trim() || undefined,
                        mediaType: inferMediaTypeFromUrl(newMediaUrl.trim() || undefined),
                      });
                    }

                    setNewMediaTitle("");
                    setNewMediaUrl("");
                    setNewMediaFile(null);
                  } finally {
                    setAddingMedia(false);
                  }
                }}
              >
                Add
              </Button>
            ) : null
          }
        >
          {canEdit ? (
            <div className="mb-4 grid gap-2">
              <Input
                placeholder="New media title"
                value={newMediaTitle}
                onChange={(e) => setNewMediaTitle(e.target.value)}
              />
              <Input
                placeholder="Optional URL (if not uploading)"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
              />
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f) {
                    const validation = f.type.startsWith('image/')
                      ? validateImageFile(f)
                      : validateVideoFile(f);
                    if (!validation.valid) {
                      alert(validation.error);
                      return;
                    }
                  }
                  setNewMediaFile(f);
                }}
              />
              <div className="text-muted-foreground text-xs">
                Upload uses your device gallery picker. Images: max 5MB. Videos: max 50MB. Compressed automatically.
              </div>
            </div>
          ) : null}

          <div className="grid gap-3">
            {mediaItems.map((m) => {
              const mediaType = m.mediaType ?? inferMediaTypeFromUrl(m.url);
              return (
                <div key={m.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.title}</div>
                      {m.url ? (
                        <div className="text-muted-foreground mt-1 truncate text-xs">
                          {m.fileName ? m.fileName : m.url}
                        </div>
                      ) : (
                        <div className="text-muted-foreground mt-1 text-xs">No media yet</div>
                      )}
                    </div>
                  </div>

                  {m.url && mediaType === "image" ? (
                    <div className="mt-3 overflow-hidden rounded-lg border bg-muted/30">
                      <img src={m.url} alt={m.title} className="aspect-video w-full object-cover" />
                    </div>
                  ) : null}

                  {m.url && mediaType === "video" ? (
                    <div className="mt-3 overflow-hidden rounded-lg border bg-black">
                      <video src={m.url} controls className="aspect-video w-full object-cover" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </BoardCard>

        <BoardCard
          title="Announcement board"
          description="No announcements yet"
          icon={
            <div className="flex items-center gap-1">
              <Heart className="fill-primary text-primary h-5 w-5" />
              <Heart className="fill-secondary text-secondary h-3 w-3" />
              <Star className="fill-primary text-primary h-4 w-4" />
            </div>
          }
          action={
            canEdit ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const safe = newAnnTitle.trim();
                  const safeBody = newAnnBody.trim();
                  if (!safe || !safeBody) return;
                  addAnnouncement({ title: safe, body: safeBody });
                  setNewAnnTitle("");
                  setNewAnnBody("");
                }}
              >
                Post
              </Button>
            ) : null
          }
        >
          {canEdit ? (
            <div className="mb-4 grid gap-2">
              <Input
                placeholder="Announcement title"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
              />
              <Textarea
                placeholder="Announcement body"
                value={newAnnBody}
                onChange={(e) => setNewAnnBody(e.target.value)}
              />
            </div>
          ) : null}

          <div className="grid gap-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.title}</div>
                    <div className="text-muted-foreground mt-1 whitespace-pre-wrap text-sm">{a.body}</div>
                  </div>
                </div>
                <div className="text-muted-foreground mt-2 text-xs">{format(new Date(a.createdAtIso), "PPpp")}</div>
              </div>
            ))}
          </div>
        </BoardCard>
      </div>

      <CallPanel title="On-screen call" description="Keep this open while you use the dice page, or show it during a stream." />
    </div>
  );
}
