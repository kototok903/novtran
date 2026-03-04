import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COMMON_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'ru', label: 'Russian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'pl', label: 'Polish' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
]

interface LanguageSelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
}

export function LanguageSelect({ id, value, onValueChange }: LanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMMON_LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label} ({lang.value.toUpperCase()})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
