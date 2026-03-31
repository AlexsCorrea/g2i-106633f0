import { ReactNode } from "react";
import TopNav from "./TopNav";
import { useAuth } from "@/contexts/AuthContext";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
