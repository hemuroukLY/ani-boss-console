import { createFileRoute } from "@tanstack/react-router";
import { IdentityProviderPage } from "@/components/settings/IdentityProviderPage";

export const Route = createFileRoute("/settings-idp/")({
  component: IdentityProviderPage,
});
