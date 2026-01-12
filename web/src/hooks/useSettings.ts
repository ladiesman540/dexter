import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  selectedModel: 'gpt-5.2',
  selectedProvider: 'openai',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, loading, saving, error, saveSettings, setSettings };
}
