import { createFileRoute } from "@tanstack/react-router";
import { RegistryQuotaPage } from "@/components/infrastructure/RegistryOperations/RegistryQuotaPage";

export const Route = createFileRoute("/ops-registry-quota/")({
  component: RegistryQuotaPage,
});
