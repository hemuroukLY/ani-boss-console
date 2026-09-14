import { createFileRoute } from "@tanstack/react-router";
import { PlatformAdministratorDetail } from "@/components/settings/PlatformAdministratorDetail";

export const Route = createFileRoute("/settings-platform-admins/$userId")({
  component: function PlatformAdministratorDetailRoute() {
    const { userId } = Route.useParams();
    return <PlatformAdministratorDetail userId={userId} />;
  },
});
