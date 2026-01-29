import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <NavLink to="/">Go to hub</NavLink>
        </Button>
      </CardContent>
    </Card>
  );
}
