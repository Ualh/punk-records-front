import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { useApiHealth } from "@/hooks/useApiHealth";

export function Layout({ children }: { children: ReactNode }) {
  const apiOnline = useApiHealth();

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 ml-16 lg:ml-56 min-h-screen">
        {!apiOnline && (
          <div className="bg-secondary text-primary text-xs text-center py-1.5 font-medium">
            Backend offline — showing demo data
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
