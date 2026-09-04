import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function IdentityProviderPage() {
  return <PagePlaceholder title="登录与 IdP（预留）" priority="P1" />;
}

export const Route = createFileRoute("/settings-idp/")({
  component: IdentityProviderPage,
});
