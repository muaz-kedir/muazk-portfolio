import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export function EmptyState({
  icon = "FolderKanban",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface/40 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-accent">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="text-base font-medium text-content">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
