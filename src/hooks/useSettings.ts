import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", SETTINGS_ID)
        .single();

      if (data) setSettings(data);
      setLoading(false);
    }

    fetchSettings();
  }, []);

  const saveSettings = async (updates: Partial<typeof settings>) => {
    const { data, error } = await supabase
      .from("settings")
      .upsert([{ id: SETTINGS_ID, ...updates }])
      .select();
    if (!error) setSettings(data?.[0]);
    return { data, error };
  };

  return { settings, saveSettings, loading };
}
