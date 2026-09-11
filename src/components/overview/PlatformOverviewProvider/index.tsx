import { Message } from "@arco-design/web-react";
import { useMemo, useState, type ReactNode } from "react";
import { platformAlerts } from "../model";
import { PlatformOverviewContext, type PlatformOverviewContextValue } from "./context";

export function PlatformOverviewProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState(() => platformAlerts.map((item) => ({ ...item })));

  const value = useMemo<PlatformOverviewContextValue>(
    () => ({
      alerts,
      updateAlert: (id, status) => {
        setAlerts((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
        Message.success(status === "已处理" ? "告警已处理" : "告警已忽略");
      },
    }),
    [alerts],
  );

  return (
    <PlatformOverviewContext.Provider value={value}>{children}</PlatformOverviewContext.Provider>
  );
}
