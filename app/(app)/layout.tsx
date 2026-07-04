import { Sidebar } from "@/components/Sidebar";
import { HStack } from "@astryxdesign/core/Layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HStack style={{ height: "100dvh" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, height: "100%" }}>{children}</div>
    </HStack>
  );
}
