import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useSettings } from '../hooks/useSettings';
import { API_KEYS, PROVIDERS } from '../types';

export default function Settings() {
  const { settings, loading, saving, error, saveSettings } = useSettings();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(settings.selectedProvider);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);

  // Initialize form data from settings
  useEffect(() => {
    if (!loading) {
      setFormData({
        openai: settings.openaiApiKey || '',
        anthropic: settings.anthropicApiKey || '',
        google: settings.googleApiKey || '',
        financialDatasets: settings.financialDatasetsApiKey || '',
        tavily: settings.tavilyApiKey || '',
        ollamaBaseUrl: settings.ollamaBaseUrl || 'http://127.0.0.1:11434',
      });
      setSelectedProvider(settings.selectedProvider);
      setSelectedModel(settings.selectedModel);
    }
  }, [settings, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await saveSettings({
      openaiApiKey: formData.openai || undefined,
      anthropicApiKey: formData.anthropic || undefined,
      googleApiKey: formData.google || undefined,
      financialDatasetsApiKey: formData.financialDatasets || undefined,
      tavilyApiKey: formData.tavily || undefined,
      ollamaBaseUrl: formData.ollamaBaseUrl || undefined,
      selectedProvider,
      selectedModel,
    });

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentProvider = PROVIDERS.find((p) => p.id === selectedProvider);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-dexter-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400 mb-8">
            Configure your API keys and model preferences.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Model Selection */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                Model Selection
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      const provider = PROVIDERS.find((p) => p.id === e.target.value);
                      if (provider) {
                        setSelectedModel(provider.models[0]);
                      }
                    }}
                    className="input-field"
                  >
                    {PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="input-field"
                  >
                    {currentProvider?.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* API Keys */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4">
                API Keys
              </h2>

              <div className="space-y-4">
                {API_KEYS.map((apiKey) => (
                  <div key={apiKey.id}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300">
                        {apiKey.name}
                        {apiKey.required && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      <span className="text-xs text-gray-500">
                        {apiKey.description}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showKeys[apiKey.id] ? 'text' : 'password'}
                        value={formData[apiKey.id] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [apiKey.id]: e.target.value,
                          }))
                        }
                        placeholder={apiKey.placeholder}
                        className="input-field pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(apiKey.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Ollama Settings */}
            {selectedProvider === 'ollama' && (
              <section className="card">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Ollama Configuration
                </h2>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.ollamaBaseUrl || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ollamaBaseUrl: e.target.value,
                      }))
                    }
                    placeholder="http://127.0.0.1:11434"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The URL where your Ollama server is running.
                  </p>
                </div>
              </section>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {saved && (
              <div className="flex items-center gap-2 text-dexter-400 bg-dexter-900/20 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
