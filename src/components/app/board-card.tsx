import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BoardCard(props: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {props.icon}
              <CardTitle className="truncate">{props.title}</CardTitle>
            </div>
            {props.description ? <CardDescription>{props.description}</CardDescription> : null}
          </div>
          {props.action}
        </div>
      </CardHeader>
      <CardContent className="pt-6">{props.children}</CardContent>
    </Card>
  );
}
