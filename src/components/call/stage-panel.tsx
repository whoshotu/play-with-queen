import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Video, Mic, MicOff, VideoOff, Hand, Crown, Shield } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useCameraStream } from "@/components/call/call-panel";
import { canUseCameraByDefault, canSpeakByDefault, isAdminOrMod } from "@/lib/permissions";

export function StagePanel() {
  const user = useAppStore((s) => s.user);
  const { participants } = useAppStore((s) => s.call);
  const addSystemMessage = useAppStore((s) => s.addSystemMessage);
  const updateParticipant = useAppStore((s) => s.updateParticipant);
  const webrtcConnected = useAppStore((s) => s.webrtcConnected);
  const localStream = useAppStore((s) => s.localStream);
  
  const { request, stop, error } = useCameraStream();
  const [isJoined, setIsJoined] = React.useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Update local video preview
  React.useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const canManage = user ? isAdminOrMod(user.role) : false;
  const canUseCamera = user ? canUseCameraByDefault(user.role) : false;
  const canSpeak = user ? canSpeakByDefault(user.role) : false;

  const joinStage = React.useCallback(async () => {
    if (!user) return;

    setIsJoined(true);
    addSystemMessage(`${user.name} joined the stage`);

    // Request camera permission if allowed by role
    if (canUseCamera) {
      try {
        await request();
      } catch {
        console.log("Camera not available, joining without video");
      }
    }
  }, [user, canUseCamera, request, addSystemMessage]);

  const leaveStage = React.useCallback(() => {
    setIsJoined(false);
    stop();
    addSystemMessage(`${user?.name} left the stage`);
  }, [user, stop, addSystemMessage]);

  const requestCameraPermission = React.useCallback(async () => {
    if (!user || !canManage) return;
    setIsRequestingPermission(true);
    
    // In a real app, this would send a request to admin/mod
    // For now, simulate approval
    setTimeout(() => {
      addSystemMessage(`Camera permission granted to ${user.name}`);
      updateParticipant(user.id, { canShowCamera: true });
      setIsRequestingPermission(false);
    }, 2000);
  }, [user, canManage, addSystemMessage, updateParticipant]);

  const requestSpeakPermission = React.useCallback(async () => {
    if (!user || !canManage) return;
    
    addSystemMessage(`${user.name} is requesting to speak`);
    // Admin/mod would approve this in real implementation
  }, [user, canManage, addSystemMessage]);

  const grantCameraPermission = React.useCallback((participantId: string) => {
    if (!canManage) return;
    updateParticipant(participantId, { canShowCamera: true });
    const participant = participants.find(p => p.id === participantId);
    addSystemMessage(`Camera permission granted to ${participant?.name}`);
  }, [canManage, updateParticipant, participants, addSystemMessage]);

  const grantSpeakPermission = React.useCallback((participantId: string) => {
    if (!canManage) return;
    updateParticipant(participantId, { canSpeak: true });
    const participant = participants.find(p => p.id === participantId);
    addSystemMessage(`Speaking permission granted to ${participant?.name}`);
  }, [canManage, updateParticipant, participants, addSystemMessage]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "mod": return <Shield className="w-4 h-4 text-blue-500" />;
      case "creator": return <Crown className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-yellow-500",
      mod: "bg-blue-500", 
      creator: "bg-purple-500",
      guest: "bg-gray-500",
      visitor: "bg-gray-400"
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Live Stage</h2>
                <p className="text-muted-foreground">
                  {isJoined ? "You're on stage" : "Join the stage to participate"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={webrtcConnected ? "default" : "destructive"}>
                {webrtcConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">
                {participants.length + 1} people
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local User */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {/* Video Preview */}
            <div className="relative">
              <div className="w-32 h-24 bg-gray-900 rounded-lg flex items-center justify-center">
                {isJoined && localStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <VideoOff className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {isJoined && (
                <div className="absolute -top-2 -right-2">
                  <Badge className={getRoleBadge(user?.role || "guest")}>
                    {getRoleIcon(user?.role || "guest")}
                    <span className="ml-1 text-xs">
                      {user?.role || "Guest"}
                    </span>
                  </Badge>
                </div>
              )}
            </div>

            {/* User Info and Controls */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg">{user?.name || "Guest User"}</h3>
                {getRoleIcon(user?.role || "guest")}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <span>Camera: {localStream ? <Video className="w-4 h-4 inline" /> : <VideoOff className="w-4 h-4 inline" />}</span>
                <span>Mic: <Mic className="w-4 h-4 inline" /></span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {!isJoined ? (
                  <Button onClick={joinStage} className="bg-green-600 hover:bg-green-700">
                    <Users className="w-4 h-4 mr-2" />
                    Join Stage
                  </Button>
                ) : (
                  <>
                    <Button onClick={leaveStage} variant="destructive">
                      Leave Stage
                    </Button>
                    
                    {!canUseCamera && !isRequestingPermission && (
                      <Button onClick={requestCameraPermission} variant="outline">
                        <Video className="w-4 h-4 mr-2" />
                        Request Camera
                      </Button>
                    )}
                    
                    {!canSpeak && (
                      <Button onClick={requestSpeakPermission} variant="outline">
                        <Hand className="w-4 h-4 mr-2" />
                        Request to Speak
                      </Button>
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      {participants.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">On Stage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div key={participant.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{participant.name}</h4>
                      <Badge className={getRoleBadge(participant.role)}>
                        {getRoleIcon(participant.role)}
                        <span className="ml-1 text-xs">
                          {participant.role}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                    <span>Camera: {participant.canShowCamera ? <Video className="w-4 h-4 inline" /> : <VideoOff className="w-4 h-4 inline" />}</span>
                    <span>Speak: {participant.canSpeak ? <Mic className="w-4 h-4 inline" /> : <MicOff className="w-4 h-4 inline" />}</span>
                  </div>

                  {/* Admin Controls */}
                  {canManage && (
                    <div className="flex gap-2">
                      {!participant.canShowCamera && (
                        <Button
                          size="sm"
                          onClick={() => grantCameraPermission(participant.id)}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Allow Camera
                        </Button>
                      )}
                      {!participant.canSpeak && (
                        <Button
                          size="sm"
                          onClick={() => grantSpeakPermission(participant.id)}
                        >
                          <Mic className="w-3 h-3 mr-1" />
                          Allow Speak
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3">Stage Rules</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Anyone can join the stage as a guest</li>
            <li>• Camera and microphone permissions are controlled by moderators</li>
            <li>• Admins and moderators have automatic camera/speak access</li>
            <li>• Guests can request permissions to participate fully</li>
            <li>• Stage permissions are managed in real-time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}