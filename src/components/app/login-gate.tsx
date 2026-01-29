import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Shield, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function LoginGate() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [name, setName] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");

  const handleLogin = React.useCallback((role: "guest" | "creator" | "mod" | "admin") => {
    if (!name.trim()) return;

    const roleUsers = {
      guest: { name: name.trim(), role: "guest" as const },
      creator: { name: name.trim(), role: "creator" as const },
      mod: { name: name.trim(), role: "mod" as const },
      admin: { name: name.trim(), role: "admin" as const },
    };

    // Simple access codes (in production, use proper authentication)
    const validCodes = {
      creator: "creator123",
      mod: "mod123", 
      admin: "admin123"
    };

    if (role !== "guest" && accessCode !== validCodes[role]) {
      alert("Invalid access code for this role");
      return;
    }

    setUser({
      id: `user_${Date.now()}`,
      ...roleUsers[role]
    });
  }, [name, accessCode, setUser]);

  if (user && user.role !== "guest") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {user.role === "admin" && <Crown className="w-5 h-5 text-yellow-500" />}
            {user.role === "mod" && <Shield className="w-5 h-5 text-blue-500" />}
            {user.role === "creator" && <Crown className="w-5 h-5 text-purple-500" />}
            <span>Welcome, {user.name}!</span>
          </CardTitle>
          <CardDescription>
            You are logged in as <span className="font-medium capitalize">{user.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>• Guests can join stage and chat</p>
            <p>• Creators can manage boards and dice</p>
            <p>• Moderators can manage calls and permissions</p>
            <p>• Admins have full control</p>
          </div>
          <Button 
            onClick={() => setUser(null)} 
            variant="outline" 
            className="w-full"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <User className="w-5 h-5" />
          <span>Join the Stage</span>
        </CardTitle>
        <CardDescription>
          Enter your name to get started. Join as a guest or use access codes for elevated permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin("guest")}
          />
        </div>

        {/* Guest Access */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="font-medium">Guest Access</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Join stage to participate in chat and request permissions
          </p>
          <Button 
            onClick={() => handleLogin("guest")}
            disabled={!name.trim()}
            className="w-full"
            variant="outline"
          >
            Join as Guest
          </Button>
        </div>

        {/* Role-based Access */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="accessCode">Access Code (Optional)</Label>
            <Input
              id="accessCode"
              type="password"
              placeholder="Enter access code for elevated permissions"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={() => handleLogin("creator")}
              disabled={!name.trim() || !accessCode}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Crown className="w-4 h-4 text-purple-500" />
              <span>Login as Creator</span>
            </Button>

            <Button 
              onClick={() => handleLogin("mod")}
              disabled={!name.trim() || !accessCode}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Login as Moderator</span>
            </Button>

            <Button 
              onClick={() => handleLogin("admin")}
              disabled={!name.trim() || !accessCode}
              className="flex items-center space-x-2"
            >
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>Login as Admin</span>
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">Demo Access Codes:</p>
          <p>Creator: <code>creator123</code></p>
          <p>Moderator: <code>mod123</code></p>
          <p>Admin: <code>admin123</code></p>
        </div>
      </CardContent>
    </Card>
  );
}