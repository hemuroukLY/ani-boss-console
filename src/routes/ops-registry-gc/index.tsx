import { createFileRoute } from "@tanstack/react-router";
import { RegistryGarbageCollectionPage } from "@/components/infrastructure/RegistryOperations/RegistryGarbageCollectionPage";

export const Route = createFileRoute("/ops-registry-gc/")({
  component: RegistryGarbageCollectionPage,
});
