import { useContext } from "react";
import { TenantManagementContext } from "./context";

export function useTenantManagement() {
  const context = useContext(TenantManagementContext);
  if (!context) {
    throw new Error("useTenantManagement 必须在 TenantManagementProvider 内使用");
  }
  return context;
}
