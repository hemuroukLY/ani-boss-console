import type { AlertItem } from "@/components/overview/model";
import { AlertSummaryPanel } from "./AlertSummaryPanel";
import { PendingItemsPanel } from "./PendingItemsPanel";
import { RecentEventsPanel } from "./RecentEventsPanel";

interface OperationsPanelsProps {
  pendingAlerts: AlertItem[];
  onUpdateAlert: (id: number, status: AlertItem["status"]) => void;
  onOpenFeature: (name: string) => void;
}

export function OperationsPanels({
  pendingAlerts,
  onUpdateAlert,
  onOpenFeature,
}: OperationsPanelsProps) {
  return (
    <>
      <div className="mb-3.5 grid grid-cols-2 gap-3.5">
        <AlertSummaryPanel alerts={pendingAlerts} onUpdate={onUpdateAlert} />
        <PendingItemsPanel onOpenFeature={onOpenFeature} />
      </div>
      <RecentEventsPanel onOpenFeature={onOpenFeature} />
    </>
  );
}
