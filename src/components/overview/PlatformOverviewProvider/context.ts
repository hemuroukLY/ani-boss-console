import { createContext } from "react";
import type { AlertItem, AlertStatus } from "../model";

export interface PlatformOverviewContextValue {
  alerts: AlertItem[];
  updateAlert: (id: number, status: AlertStatus) => void;
}

export const PlatformOverviewContext = createContext<PlatformOverviewContextValue | null>(null);
