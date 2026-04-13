import { useSettings } from '../context/SettingsContext'
import { Button } from '../components/ui/Button'

export function SettingsPage() {
  const { apiToken, modelId, theme, setApiToken, setModelId, setTheme } = useSettings()

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Settings</h1>

      <div className="space-y-6">
        {/* API Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hugging Face API Token
          </label>
          <input
            type="password"
            value={apiToken ?? ''}
            onChange={(e) => setApiToken(e.target.value || null)}
            placeholder="hf_..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Get your free token at{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              huggingface.co/settings/tokens
            </a>
          </p>
        </div>

        {/* Model ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model ID
          </label>
          <input
            type="text"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            placeholder="mistralai/Mistral-7B-Instruct-v0.3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Default: mistralai/Mistral-7B-Instruct-v0.3
          </p>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? 'primary' : 'secondary'}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
