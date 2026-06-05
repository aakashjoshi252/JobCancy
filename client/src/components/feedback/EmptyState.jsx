import { Inbox } from "lucide-react";
import Button from "../ui/Button";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div className={`rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center ${className}`}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
