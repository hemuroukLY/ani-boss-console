import { useContext } from "react";
import { PlatformOverviewContext } from "./context";

export function usePlatformOverview() {
  const context = useContext(PlatformOverviewContext);
  if (!context) {
    throw new Error("usePlatformOverview 必须在 PlatformOverviewProvider 内使用");
  }
  return context;
}
