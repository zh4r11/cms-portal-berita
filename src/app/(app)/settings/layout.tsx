import Heading from "@/components/heading";
import { PageContainer } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <PageContainer breadcrumbs={[{ title: "Pengaturan" }]}>
      <div>
        <Heading title="Pengaturan" description="Kelola profil, password, dan tema tampilan akun Anda" />

        <div className="flex flex-col lg:flex-row lg:space-x-12">
          <aside className="w-full max-w-xl lg:w-48">
            <SettingsNav />
          </aside>

          <Separator className="my-6 lg:hidden" />

          <div className="flex-1 md:max-w-2xl">
            <section className="max-w-xl space-y-12">{children}</section>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
