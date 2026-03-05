import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type ReadableTextareaProps = {
  editing: boolean;
  value: string;
  onChange?: (value: string) => void;
  placeholderEdit?: string;
  placeholderRead?: string;
  markdown?: boolean;
  className?: string;
};

export function ReadableTextarea({
  editing,
  value,
  onChange,
  placeholderEdit,
  placeholderRead,
  markdown,
  className,
}: ReadableTextareaProps) {
  if (editing) {
    return (
      <Textarea
        value={value}
        placeholder={placeholderEdit}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "min-h-full resize-none border-none rounded-none",
          className
        )}
      />
    );
  }

  if (value) {
    return (
      <div className={className}>
        {markdown ? <ReactMarkdown>{value}</ReactMarkdown> : value}
      </div>
    );
  }

  if (placeholderRead) {
    return (
      <div className={cn(className, "text-muted-foreground")}>
        {placeholderRead}
      </div>
    );
  }

  return null;
}
