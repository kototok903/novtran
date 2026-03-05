import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={!canGoBack}
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="size-4" />
    </Button>
  );
}
