import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANG_NAMES,
  LANGUAGES,
  isLanguage,
  type Language,
} from "@/lib/languages";

interface LanguageSelectProps {
  id?: string;
  value: Language;
  onValueChange: (value: Language) => void;
}

export function LanguageSelect({
  id,
  value,
  onValueChange,
}: LanguageSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isLanguage(nextValue)) onValueChange(nextValue);
      }}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {LANG_NAMES[lang]} ({lang.toUpperCase()})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
