import { useState } from "react";
import { Message } from "@arco-design/web-react";
import { useTenantManagement } from "@/components/tenant/TenantManagementProvider/useTenantManagement";
import type { Tenant } from "@/components/tenant/model";
import { ArrearsPolicyModal } from "./ArrearsPolicyModal";
import { ConvertTrialModal } from "./ConvertTrialModal";
import { DisableTenantModal } from "./DisableTenantModal";
import { LifecycleSections } from "./LifecycleSections";
import { ResumeTenantModal } from "./ResumeTenantModal";
import { SuspendTenantModal } from "./SuspendTenantModal";

interface TenantLifecycleProps {
  tenant: Tenant;
}

export function TenantLifecycle({ tenant }: TenantLifecycleProps) {
  const { applyTenantLifecycleAction } = useTenantManagement();
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [forceResume, setForceResume] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableConfirmName, setDisableConfirmName] = useState("");
  const [disableReason, setDisableReason] = useState("");
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertPlanCode, setConvertPlanCode] = useState("std");
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [graceDays, setGraceDays] = useState(tenant.arrearsPolicy.graceDays);
  const [autoSuspend, setAutoSuspend] = useState(tenant.arrearsPolicy.autoSuspend);
  const [emailNotification, setEmailNotification] = useState(
    tenant.arrearsPolicy.emailNotification,
  );

  const showResult = (result: { ok: boolean; reason?: string; message?: string }) => {
    if (result.ok) {
      Message.success(result.message || "操作成功");
      return true;
    }
    Message.error(result.reason || "操作失败");
    return false;
  };

  const confirmSuspend = () => {
    if (
      showResult(
        applyTenantLifecycleAction(tenant.id, "suspend", {
          reason: suspendReason,
        }),
      )
    ) {
      setSuspendModalVisible(false);
      setSuspendReason("");
    }
  };

  const confirmResume = () => {
    if (showResult(applyTenantLifecycleAction(tenant.id, "resume", { force: forceResume }))) {
      setResumeModalVisible(false);
      setForceResume(false);
    }
  };

  const confirmDisable = () => {
    if (
      showResult(
        applyTenantLifecycleAction(tenant.id, "disable", {
          confirmName: disableConfirmName,
          reason: disableReason,
        }),
      )
    ) {
      setDisableModalVisible(false);
      setDisableConfirmName("");
      setDisableReason("");
    }
  };

  const confirmConvert = () => {
    if (
      showResult(
        applyTenantLifecycleAction(tenant.id, "convert_trial", {
          planCode: convertPlanCode,
        }),
      )
    ) {
      setConvertModalVisible(false);
    }
  };

  const confirmPolicy = () => {
    if (
      showResult(
        applyTenantLifecycleAction(tenant.id, "update_arrears_policy", {
          graceDays,
          autoSuspend,
          emailNotification,
        }),
      )
    ) {
      setPolicyModalVisible(false);
    }
  };

  return (
    <div className="space-y-7 pb-5">
      <LifecycleSections
        tenant={tenant}
        onOpenSuspend={() => {
          setSuspendReason("");
          setSuspendModalVisible(true);
        }}
        onOpenResume={() => {
          setForceResume(false);
          setResumeModalVisible(true);
        }}
        onOpenDisable={() => {
          setDisableConfirmName("");
          setDisableReason("");
          setDisableModalVisible(true);
        }}
        onExtendTrial={() => showResult(applyTenantLifecycleAction(tenant.id, "extend_trial"))}
        onOpenConvert={() => {
          setConvertPlanCode("std");
          setConvertModalVisible(true);
        }}
        onSimulateTrialExpiry={() =>
          showResult(applyTenantLifecycleAction(tenant.id, "simulate_trial_expiry"))
        }
        onOpenPolicy={() => {
          setGraceDays(tenant.arrearsPolicy.graceDays);
          setAutoSuspend(tenant.arrearsPolicy.autoSuspend);
          setEmailNotification(tenant.arrearsPolicy.emailNotification);
          setPolicyModalVisible(true);
        }}
        onSimulateOverdue={() =>
          showResult(applyTenantLifecycleAction(tenant.id, "simulate_overdue"))
        }
      />
      <SuspendTenantModal
        visible={suspendModalVisible}
        reason={suspendReason}
        onReasonChange={setSuspendReason}
        onCancel={() => setSuspendModalVisible(false)}
        onConfirm={confirmSuspend}
      />
      <ResumeTenantModal
        visible={resumeModalVisible}
        hasOutstandingBalance={tenant.balanceUsd < 0}
        forceResume={forceResume}
        onForceResumeChange={setForceResume}
        onCancel={() => setResumeModalVisible(false)}
        onConfirm={confirmResume}
      />
      <DisableTenantModal
        visible={disableModalVisible}
        tenantName={tenant.name}
        confirmName={disableConfirmName}
        reason={disableReason}
        onConfirmNameChange={setDisableConfirmName}
        onReasonChange={setDisableReason}
        onCancel={() => setDisableModalVisible(false)}
        onConfirm={confirmDisable}
      />
      <ConvertTrialModal
        visible={convertModalVisible}
        planCode={convertPlanCode}
        onPlanCodeChange={setConvertPlanCode}
        onCancel={() => setConvertModalVisible(false)}
        onConfirm={confirmConvert}
      />
      <ArrearsPolicyModal
        visible={policyModalVisible}
        graceDays={graceDays}
        autoSuspend={autoSuspend}
        emailNotification={emailNotification}
        onGraceDaysChange={setGraceDays}
        onAutoSuspendChange={setAutoSuspend}
        onEmailNotificationChange={setEmailNotification}
        onCancel={() => setPolicyModalVisible(false)}
        onConfirm={confirmPolicy}
      />
    </div>
  );
}
