'use client'

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if(settingsApp){
      updateSettingsApp(settingsApp);
    }
    
  }, [settingsApp])
  
  // const getSettingsApp = () => {
  //   if(typeof window === 'undefined') return null;

  //   const settings = localStorage.getItem('settings-app');
  //   return settings ? JSON.parse(settings) : null;
  // }

  const updateSettingsApp = (newSettings: Partial<SettingsApp>) => {
    if(typeof window === 'undefined') return;

    const updatedSettings = { ...settingsApp, ...newSettings };
    localStorage.setItem('settings-app', JSON.stringify(updatedSettings));
  }

  return {settingsApp, setSettingsApp}
}
export default useSettingsApp;