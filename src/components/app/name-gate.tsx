import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Role } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

function roleFromCode(codeRaw: string): Role {
  const code = codeRaw.trim().toLowerCase();
  if (code === "spunfun") return "admin";
  if (code === "mod") return "mod";
  return "visitor";
}

export function NameGate() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");

  const open = !user;

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Join the creator hub</DialogTitle>
          <DialogDescription>
            Enter the name you want to use. If you have an access code, enter it below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              placeholder="e.g. Jay, Kayla, PandaKing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code">Access code (optional)</Label>
            <Input
              id="code"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="password"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              const safeName = name.trim();
              if (!safeName) return;
              setUser({ 
                id: crypto.randomUUID(), 
                name: safeName, 
                role: roleFromCode(code) 
              });
            }}
          >
            Enter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
