import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const [settings, setSettings] = useSettings();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() =>
        setSettings((prev) => ({
          ...prev,
          theme: prev.theme === "light" ? "dark" : "light",
        }))
      }
    >
      {settings.theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
