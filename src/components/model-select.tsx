import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MODEL_GROUPS = [
  {
    provider: 'Google',
    models: [
      'gemini-3.1-pro-preview',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ],
  },
  {
    provider: 'Anthropic',
    models: [
      'claude-opus-4-6',
      'claude-sonnet-4-6',
      'claude-sonnet-4-5-20250929',
      'claude-sonnet-4-20250514',
      'claude-haiku-3-5-20241022',
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      'gpt-5.3-instant',
      'gpt-5.3-codex',
      'gpt-5.2',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
    ],
  },
]

const MODEL_LABELS: Record<string, string> = {
  'gemini-3.1-pro-preview': 'Gemini 3.1 Pro',
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'gemini-3.1-flash-lite-preview': 'Gemini 3.1 Flash Lite',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'claude-opus-4-6': 'Claude Opus 4.6',
  'claude-sonnet-4-6': 'Claude Sonnet 4.6',
  'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-haiku-3-5-20241022': 'Claude 3.5 Haiku',
  'gpt-5.3-instant': 'GPT-5.3 Instant',
  'gpt-5.3-codex': 'GPT-5.3 Codex',
  'gpt-5.2': 'GPT-5.2',
  'gpt-4.1': 'GPT-4.1',
  'gpt-4.1-mini': 'GPT-4.1 Mini',
  'gpt-4.1-nano': 'GPT-4.1 Nano',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
}

interface ModelSelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
}

export function ModelSelect({ id, value, onValueChange }: ModelSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {MODEL_GROUPS.map((group) => (
          <SelectGroup key={group.provider}>
            <SelectLabel>{group.provider}</SelectLabel>
            {group.models.map((model) => (
              <SelectItem key={model} value={model}>
                {MODEL_LABELS[model] || 'Unknown'}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
