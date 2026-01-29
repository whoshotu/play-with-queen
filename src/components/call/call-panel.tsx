import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Video, VideoOff, UserPlus, Monitor, MonitorOff } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";
import { IndividualDicePreview } from "@/components/dice/individual-dice-preview";
import { DraggableVideoBox } from "./draggable-video-box";
import { EmojiReactions } from "./emoji-reactions";
import { WebRTCManager } from "@/lib/webrtc";

type CameraStatus = "idle" | "requesting" | "granted" | "denied";

function useLocalCamera() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = React.useState<CameraStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (status === "granted" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  const stop = React.useCallback(() => {
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("idle");
  }, []);

  const request = React.useCallback(async (deviceId?: string) => {
    setError(null);
    setStatus("requesting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API missing. Secure context (HTTPS) required?");
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true, // Enable audio for real calling
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setStatus("granted");
      return stream;
    } catch (err: unknown) {
      console.error("Camera access failed:", err);
      const error = err as Error;
      setStatus("denied");

      let msg = "Camera access error.";
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        msg = "Permission denied. Check browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        msg = "No camera found on device.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        msg = "Camera may be in use by another app.";
      } else if (error.message) {
        msg = `${error.message}`;
      }

      setError(msg);
      throw err;
    }
  }, []);

  React.useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, status, error, request, stop, stream: streamRef.current };
}

export function CallPanel(props: { title?: string; description?: string }) {
  const user = useAppStore((s) => s.user);
  const call = useAppStore((s) => s.call);
  const setCall = useAppStore((s) => s.setCall);

  const individualDice = useAppStore((s) => s.individualDice);
  const lastRoll = useAppStore((s) => s.lastRoll);
  const rollDice = useAppStore((s) => s.rollDice);
  const heldDice = useAppStore((s) => s.heldDice);
  const toggleHold = useAppStore((s) => s.toggleHold);

  const selectedCameraId = useAppStore((s) => s.selectedCameraId);
  const setSelectedCameraId = useAppStore((s) => s.setSelectedCameraId);

  // WebRTC state from store
  const signalingServerUrl = useAppStore((s) => s.signalingServerUrl);
  const roomId = useAppStore((s) => s.roomId);
  const webrtcManager = useAppStore((s) => s.webrtcManager);
  const setWebRTCManager = useAppStore((s) => s.setWebRTCManager);
  const setWebRTCConnected = useAppStore((s) => s.setWebRTCConnected);
  const addRemoteStream = useAppStore((s) => s.addRemoteStream);
  const removeRemoteStream = useAppStore((s) => s.removeRemoteStream);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const addSystemMessage = useAppStore((s) => s.addSystemMessage);
  const screenSharing = useAppStore((s) => s.screenSharing);
  const setScreenSharing = useAppStore((s) => s.setScreenSharing);

  const [participantName, setParticipantName] = React.useState("");
  const addParticipant = useAppStore((s) => s.addParticipant);
  const removeParticipant = useAppStore((s) => s.removeParticipant);
  const updateParticipant = useAppStore((s) => s.updateParticipant);

  const { videoRef, status, error, request, stop } = useLocalCamera();
  const [rolling, setRolling] = React.useState(false);

  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  React.useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      });
    }
  }, []);

  // Initialize WebRTC
  const joinCall = React.useCallback(async () => {
    if (!user) return;

    try {
      const stream = await request(selectedCameraId || undefined);

      const manager = new WebRTCManager({
        signalingServerUrl,
        roomId,
        userId: user.id,
        userName: user.name,
      });

      manager.onStateChange((state) => {
        setWebRTCConnected(state === "connected");
      });

      manager.onParticipantJoined((userId, userName) => {
        addSystemMessage(`${userName} joined the call`);
        addParticipant(userName, userId);
      });

      manager.onParticipantLeft((userId) => {
        removeRemoteStream(userId);
      });

      manager.onRemoteStreamAdded((userId, stream) => {
        addRemoteStream(userId, stream);
      });

      manager.setLocalStream(stream);
      await manager.connect();

      setWebRTCManager(manager);
      setCall({ joined: true });
    } catch (err) {
      console.error("Failed to join call:", err);
    }
  }, [user, roomId, signalingServerUrl, selectedCameraId, request, setWebRTCManager, setWebRTCConnected, addSystemMessage, addParticipant, addRemoteStream, removeRemoteStream, setCall]);

  const leaveCall = React.useCallback(() => {
    webrtcManager?.disconnect();
    setWebRTCManager(null);
    setWebRTCConnected(false);
    stop();
    setCall({ joined: false });
    setScreenSharing(false);
  }, [webrtcManager, setWebRTCManager, setWebRTCConnected, stop, setCall, setScreenSharing]);

  const toggleScreenShare = React.useCallback(async () => {
    if (!webrtcManager) return;

    if (screenSharing) {
      // Switch back to camera
      try {
        const stream = await request(selectedCameraId || undefined);
        webrtcManager.setLocalStream(stream);
        setScreenSharing(false);
      } catch (err) {
        console.error("Failed to restart camera:", err);
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Handle when user clicks "Stop sharing" in browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare(); // recursive call to switch back to camera
        };

        webrtcManager.setLocalStream(screenStream);

        // Update local preview
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }

        setScreenSharing(true);
      } catch (err) {
        console.error("Failed to share screen:", err);
      }
    }
  }, [webrtcManager, screenSharing, selectedCameraId, request, setScreenSharing, videoRef]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title ?? "Multi-Camera Call"}</CardTitle>
        <CardDescription>
          {props.description ??
            "Add multiple participants with individual cameras. Drag and resize video boxes as needed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (call.joined) {
                  leaveCall();
                  return;
                }
                void joinCall();
              }}
              variant={call.joined ? "outline" : "default"}
            >
              {call.joined ? (
                <>
                  <VideoOff className="mr-2 h-4 w-4" />
                  Leave
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Join
                </>
              )}
            </Button>

            {call.joined && (
              <Button
                variant="outline"
                onClick={() => void toggleScreenShare()}
              >
                {screenSharing ? (
                  <>
                    <MonitorOff className="mr-2 h-4 w-4" />
                    Stop Sharing
                  </>
                ) : (
                  <>
                    <Monitor className="mr-2 h-4 w-4" />
                    Share Screen
                  </>
                )}
              </Button>
            )}

            {call.joined && (
              <div className="flex items-center gap-1 border-l pl-3">
                {["❤️", "🔥", "😂", "😮", "👏"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-muted"
                    onClick={() => addChatMessage(emoji, "emoji")}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}

            <div className="text-muted-foreground text-sm">
              You: <span className="font-medium text-foreground">{user?.name ?? "Guest"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={call.showDiceOverlay}
              onCheckedChange={(checked) => setCall({ showDiceOverlay: checked })}
              id="dice-overlay"
            />
            <Label htmlFor="dice-overlay">Show dice on screen</Label>
          </div>
        </div>

        {/* Main video canvas area */}
        <div className="relative min-h-[500px] rounded-xl border bg-muted/30 p-3">
          {/* Your camera (fixed position) */}
          <div className="relative mb-4 overflow-hidden rounded-lg border bg-black">
            <EmojiReactions />
            {call.joined ? (
              status === "granted" ? (
                <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
              ) : (
                <div className="grid aspect-video place-items-center gap-3 px-4 py-6 text-center text-sm text-white/80">
                  <div className="max-w-sm">
                    {status === "requesting" ? "Requesting camera permission…" : "Camera is off."}
                  </div>
                  {error && (
                    <div className="mb-2 max-w-xs rounded bg-destructive/10 p-2 text-xs text-destructive">
                      {error}
                      <div className="mt-2 border-t border-destructive/20 pt-1 font-mono text-[10px] opacity-75">
                        Debug: {videoDevices.length} devices found.
                      </div>
                    </div>
                  )}

                  {videoDevices.length > 0 && (
                    <div className="mb-2 w-full max-w-[200px]">
                      <select
                        className="w-full rounded border bg-background px-2 py-1 text-xs text-foreground"
                        value={selectedCameraId || ""}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedCameraId(id);
                          void request(id);
                        }}
                      >
                        <option value="">Default Camera</option>
                        {videoDevices.map((d, i) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Camera ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    disabled={status === "requesting"}
                    onClick={() => void request(selectedCameraId || undefined)}
                  >
                    Enable camera
                  </Button>
                  <div className="text-xs text-white/60">
                    Your browser will ask permission to access your camera.
                  </div>
                </div>
              )
            ) : (
              <div className="grid aspect-video place-items-center text-sm text-white/80">Not joined</div>
            )}

            {call.joined && call.showDiceOverlay ? (
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="rounded-lg bg-black/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-xs font-medium tracking-wide text-white/80">Dice overlay</div>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={rolling}
                      onClick={() => {
                        if (rolling) return;
                        setRolling(true);
                        window.setTimeout(() => {
                          rollDice();
                          setRolling(false);
                        }, 650);
                      }}
                    >
                      Roll
                    </Button>
                  </div>
                  <IndividualDicePreview
                    dice={individualDice}
                    values={lastRoll}
                    rolling={rolling}
                    held={heldDice}
                    onToggleHold={toggleHold}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Draggable participant videos */}
          <div className="relative min-h-[300px]">
            {call.participants.map((participant) => (
              <DraggableVideoBox
                key={participant.id}
                participant={participant}
                userId={participant.id}
                onPositionChange={(x, y) => updateParticipant(participant.id, { position: { x, y } })}
                onSizeChange={(width, height) => updateParticipant(participant.id, { size: { width, height } })}
                onCameraToggle={(enabled) => updateParticipant(participant.id, { cameraEnabled: enabled })}
                isRemote={participant.id !== user?.id}
              />
            ))}
            {call.participants.length === 0 && (
              <div className="text-muted-foreground grid h-[300px] place-items-center text-center text-sm">
                No participants yet. Add participants below.
              </div>
            )}
          </div>
        </div>

        {/* Add participant */}
        <div className="rounded-xl border bg-background p-3">
          <div className="mb-2 text-sm font-medium">Manage Participants</div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Add a participant</Label>
              <div className="flex gap-2">
                <Input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter name..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const safe = participantName.trim();
                      if (!safe) return;
                      addParticipant(safe);
                      setParticipantName("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const safe = participantName.trim();
                    if (!safe) return;
                    addParticipant(safe);
                    setParticipantName("");
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {call.participants.length > 0 && (
              <div className="grid gap-2">
                <Label>Active Participants ({call.participants.length})</Label>
                {call.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-muted-foreground text-xs">
                        Camera: {p.cameraEnabled ? "On" : "Off"}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => removeParticipant(p.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
