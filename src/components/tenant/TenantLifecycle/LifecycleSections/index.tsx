import type { Tenant } from "@/components/tenant/model";
import { ArrearsPolicySection } from "./ArrearsPolicySection";
import { LifecycleHistorySection } from "./LifecycleHistorySection";
import { LifecycleStatusSection } from "./LifecycleStatusSection";
import { TrialLifecycleSection } from "./TrialLifecycleSection";

interface LifecycleSectionsProps {
  tenant: Tenant;
  onOpenSuspend: () => void;
  onOpenResume: () => void;
  onOpenDisable: () => void;
  onExtendTrial: () => void;
  onOpenConvert: () => void;
  onSimulateTrialExpiry: () => void;
  onOpenPolicy: () => void;
  onSimulateOverdue: () => void;
}

export function LifecycleSections({
  tenant,
  onOpenSuspend,
  onOpenResume,
  onOpenDisable,
  onExtendTrial,
  onOpenConvert,
  onSimulateTrialExpiry,
  onOpenPolicy,
  onSimulateOverdue,
}: LifecycleSectionsProps) {
  return (
    <>
      <LifecycleStatusSection
        tenant={tenant}
        onOpenSuspend={onOpenSuspend}
        onOpenResume={onOpenResume}
        onOpenDisable={onOpenDisable}
      />
      <TrialLifecycleSection
        tenant={tenant}
        onExtendTrial={onExtendTrial}
        onOpenConvert={onOpenConvert}
        onSimulateTrialExpiry={onSimulateTrialExpiry}
      />
      <ArrearsPolicySection
        tenant={tenant}
        onOpenPolicy={onOpenPolicy}
        onSimulateOverdue={onSimulateOverdue}
      />
      <LifecycleHistorySection events={tenant.lifecycle} />
    </>
  );
}
