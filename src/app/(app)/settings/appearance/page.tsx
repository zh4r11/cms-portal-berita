import type { Metadata } from "next";
import Heading from "@/components/heading";
import { AppearanceTabs } from "./appearance-tabs";

export const metadata: Metadata = { title: "Pengaturan tampilan" };

export default function AppearancePage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Pengaturan tampilan</h1>
      <Heading variant="small" title="Tampilan" description="Atur tema tampilan akun Anda" />
      <AppearanceTabs />
    </div>
  );
}
