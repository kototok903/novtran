import { useCallback, useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(getSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-transitions");
    root.classList.toggle("dark", settings.theme === "dark");
    void root.offsetHeight;
    root.classList.remove("no-transitions");
    saveSettings(settings);
  }, [settings]);

  const setSettings = useCallback(
    (updater: Partial<Settings> | ((prev: Settings) => Settings)) => {
      setSettingsState((prev) =>
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      );
    },
    []
  );

  return [settings, setSettings] as const;
}
