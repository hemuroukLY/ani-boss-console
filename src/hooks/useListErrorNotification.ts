import { useEffect } from "react";
import { getApiErrorMessage } from "@/lib/api-error";
import { showErrorNotification } from "@/lib/notifications";

interface UseListErrorNotificationOptions {
  id: string;
  title: string;
  error?: unknown;
}

export function useListErrorNotification({ id, title, error }: UseListErrorNotificationOptions) {
  useEffect(() => {
    if (!error) return;
    showErrorNotification({
      id,
      title,
      content: getApiErrorMessage(error),
    });
  }, [error, id, title]);
}
