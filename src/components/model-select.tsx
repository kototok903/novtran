import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getModelLabel, MODEL_GROUPS } from "@/lib/models";

interface ModelSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
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
            <SelectLabel>{group.label}</SelectLabel>
            {group.models.map((model) => (
              <SelectItem key={model} value={model}>
                {getModelLabel(model)}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
