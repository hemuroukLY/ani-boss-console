import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { streamPlatformComponentLogs, type PlatformComponentLog } from "@/api/platform";

export type LogConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "failed";

function getLogIdentity(log: PlatformComponentLog) {
  return [log.timestamp, log.pod, log.container, log.stream, log.message].join("\u0000");
}

export function usePlatformComponentLogs(component: string) {
  const [logState, setLogState] = useState<{
    component: string;
    logs: PlatformComponentLog[];
  }>({ component: "", logs: [] });
  const [connection, setConnection] = useState<{
    component: string;
    state: LogConnectionState;
  }>({ component: "", state: "idle" });
  const [errorState, setErrorState] = useState<{ component: string; error: unknown }>();
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (!component) return;

    const controller = new AbortController();
    const seen = new Set<string>();
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const connect = async (isReconnect: boolean) => {
      setConnection({ component, state: isReconnect ? "reconnecting" : "connecting" });
      try {
        await streamPlatformComponentLogs({
          component,
          limit: 100,
          intervalSeconds: 2,
          signal: controller.signal,
          onConnected: () => {
            if (cancelled) return;
            setConnection({ component, state: "connected" });
            setErrorState(undefined);
          },
          onLog: (log) => {
            if (cancelled) return;
            const identity = getLogIdentity(log);
            if (seen.has(identity)) return;
            seen.add(identity);
            setLogState((current) => ({
              component,
              logs: [...(current.component === component ? current.logs : []), log].slice(-500),
            }));
          },
        });
        if (cancelled) return;
        setConnection({ component, state: "reconnecting" });
        reconnectTimer = setTimeout(() => void connect(true), 1_000);
      } catch (streamError) {
        if (cancelled || controller.signal.aborted) return;
        setErrorState({ component, error: streamError });
        if (streamError instanceof ApiError && streamError.status === 404) {
          setConnection({ component, state: "failed" });
          return;
        }
        setConnection({ component, state: "reconnecting" });
        reconnectTimer = setTimeout(() => void connect(true), 2_000);
      }
    };

    void connect(false);
    return () => {
      cancelled = true;
      controller.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [component, restartKey]);

  const restart = useCallback(() => {
    setLogState({ component, logs: [] });
    setRestartKey((current) => current + 1);
  }, [component]);
  const clear = useCallback(() => setLogState({ component, logs: [] }), [component]);

  const logs = logState.component === component ? logState.logs : [];
  const connectionState = !component
    ? "idle"
    : connection.component === component
      ? connection.state
      : "connecting";
  const error = errorState?.component === component ? errorState.error : undefined;

  return { logs, connectionState, error, restart, clear };
}
