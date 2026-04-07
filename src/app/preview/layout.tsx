import { NavSidebarPreview } from "@/components/nav-sidebar-preview";

// Preview layout — no Clerk auth, uses mock data
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <NavSidebarPreview />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
}
