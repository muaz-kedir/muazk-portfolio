import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface/70 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </Comp>
  );
}
