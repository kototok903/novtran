import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type ReadableTextareaProps = {
  editing: boolean;
  value: string;
  rows?: number;
  onChange?: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  placeholderEdit?: string;
  placeholderRead?: string;
  markdown?: boolean;
  className?: string;
};

export function ReadableTextarea({
  editing,
  value,
  rows,
  onChange,
  onKeyDown,
  placeholderEdit,
  placeholderRead,
  markdown,
  className,
}: ReadableTextareaProps) {
  const frameClassName = cn(
    "flex h-full min-h-0 flex-col border-[1.5px] rounded-none",
    editing
      ? "border-accent-warm/20 focus-within:border-accent-warm/60"
      : "border-transparent"
  );

  if (editing) {
    return (
      <div className={frameClassName}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Textarea
            value={value}
            rows={rows}
            placeholder={placeholderEdit}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "min-h-full resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent",
              className
            )}
          />
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className={frameClassName}>
        <div className={cn("min-h-0 flex-1 overflow-y-auto", className)}>
          {markdown ? <ReactMarkdown>{value}</ReactMarkdown> : value}
        </div>
      </div>
    );
  }

  if (placeholderRead) {
    return (
      <div className={frameClassName}>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            className,
            "text-muted-foreground"
          )}
        >
          {placeholderRead}
        </div>
      </div>
    );
  }

  return null;
}
