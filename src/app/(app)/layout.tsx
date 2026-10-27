import { cookies } from "next/headers";
import { AppSidebar, type NavGroup } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MODUL, isModulKey } from "@/lib/modul";
import { prisma } from "@/lib/prisma";
import { getAkses, requireUser } from "@/lib/session";
import { getIdentitas } from "@/lib/site";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const sidebarState = (await cookies()).get("sidebar_state")?.value;

  const [akses, modul, identitas, pesanBaru] = await Promise.all([
    getAkses(),
    prisma.modul.findMany({ orderBy: [{ urutan: "asc" }, { id: "asc" }] }),
    getIdentitas(),
    prisma.hubungi.count({ where: { dibaca: false } }),
  ]);

  // Grup mengikuti src/lib/modul.ts; nama dan urutan dari tabel modul.
  const groups: NavGroup[] = [];

  for (const row of modul) {
    if (!isModulKey(row.link) || !akses.has(row.link) || (!row.aktif && user.level !== "admin")) {
      continue;
    }

    const title = MODUL[row.link].grup;
    let group = groups.find((g) => g.title === title);

    if (!group) {
      group = { title, items: [] };
      groups.push(group);
    }

    group.items.push({ key: row.link, title: row.nama, badge: row.link === "hubungi" ? pesanBaru : undefined });
  }

  const urutanGrup = [...new Set(Object.values(MODUL).map((m) => m.grup))];
  groups.sort((a, b) => urutanGrup.indexOf(a.title as never) - urutanGrup.indexOf(b.title as never));

  return (
    <SidebarProvider defaultOpen={sidebarState !== "false"}>
      <AppSidebar
        user={{ id: user.id, name: user.name, username: user.username ?? "", email: user.email, image: user.image }}
        groups={groups}
        nama={identitas.namaWebsite}
      />
      <SidebarInset className="min-w-0 overflow-x-clip">{children}</SidebarInset>
    </SidebarProvider>
  );
}
