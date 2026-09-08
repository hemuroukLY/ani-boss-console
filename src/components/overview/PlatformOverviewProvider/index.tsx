import { Message } from "@arco-design/web-react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { platformAlerts, type AlertItem, type AlertStatus } from "../model";

interface PlatformOverviewContextValue {
  alerts: AlertItem[];
  updateAlert: (id: number, status: AlertStatus) => void;
  resetDemo: () => void;
}

const PlatformOverviewContext =
  createContext<PlatformOverviewContextValue | null>(null);

export function PlatformOverviewProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [alerts, setAlerts] = useState(() =>
    platformAlerts.map((item) => ({ ...item })),
  );

  const value = useMemo<PlatformOverviewContextValue>(
    () => ({
      alerts,
      updateAlert: (id, status) => {
        setAlerts((items) =>
          items.map((item) => (item.id === id ? { ...item, status } : item)),
        );
        Message.success(status === "已处理" ? "告警已处理" : "告警已忽略");
      },
      resetDemo: () => {
        setAlerts(platformAlerts.map((item) => ({ ...item })));
        Message.success("运营态势演示已复位，可继续查看指标或告警");
      },
    }),
    [alerts],
  );

  return (
    <PlatformOverviewContext.Provider value={value}>
      {children}
    </PlatformOverviewContext.Provider>
  );
}

export function usePlatformOverview() {
  const context = useContext(PlatformOverviewContext);
  if (!context) {
    throw new Error(
      "usePlatformOverview 必须在 PlatformOverviewProvider 内使用",
    );
  }
  return context;
}
