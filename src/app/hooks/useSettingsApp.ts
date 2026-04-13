'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SettingsApp {
  theme : "light" | "dark";
  currency?: string;
  confirmDelete?: boolean;
}

const initialSettings: SettingsApp = {
  theme: "light",
  currency: "BRL",
  confirmDelete: true,
}

const useSettingsApp = () => {

  const [settingsApp, setSettingsApp] = useState<SettingsApp>(initialSettings);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in fetch:', authError);
        setLoading(false);
        return;
      }
      if (user) {
        console.log('Fetching settings for user:', user.id);
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme, currency, confirm_delete')
          .eq('user_id', user.id)
          .single();

        console.log('Fetch response data:', data, 'error:', error);

        if (data && !error) {
          setSettingsApp({
            theme: data.theme,
            currency: data.currency,
            confirmDelete: data.confirm_delete,
          });
        } else if (error) {
          console.error('Error fetching settings:', error);
        }
      } else {
        console.log('No user for fetch');
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettingsApp = async (newSettings: Partial<SettingsApp>) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    const updatedSettings = { ...settingsApp, ...newSettings };
    setSettingsApp(updatedSettings);

    const upsertData = {
      user_id: user.id,
      theme: updatedSettings.theme,
      currency: updatedSettings.currency,
      confirm_delete: updatedSettings.confirmDelete ?? true,
    };
    console.log('Upserting data:', upsertData);

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(upsertData, { onConflict: 'user_id' });

    console.log('Upsert response data:', data, 'error:', error);

    if (error) {
      console.error('Error updating settings:', error);
    } else {
      console.log('Settings updated successfully');
    }
  };

  return { settingsApp, setSettingsApp: updateSettingsApp, loading };
}
export default useSettingsApp;