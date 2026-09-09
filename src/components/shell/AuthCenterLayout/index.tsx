import type { ReactNode } from "react";

export function AuthCenterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">{children}</div>
  );
}
