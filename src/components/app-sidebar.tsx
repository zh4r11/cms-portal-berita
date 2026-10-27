"use client";

import {
  AppWindow,
  BookOpen,
  CalendarDays,
  ChevronsUpDown,
  Clapperboard,
  Contact,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Hash,
  Image,
  Images,
  ListVideo,
  LayoutGrid,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  Palette,
  PanelTop,
  Settings,
  ShieldCheck,
  Tags,
  Type,
  UserCog,
  Users,
  Vote,
  Wallpaper,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AppLogo from "@/components/app-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserInfo, type UserSummary } from "@/components/user-info";
import { authClient } from "@/lib/auth-client";
import type { ModulKey } from "@/lib/modul";

const ICON: Record<ModulKey, LucideIcon> = {
  berita: Newspaper,
  kategori: Folder,
  tag: Hash,
  komentar: MessageSquare,
  katajelek: Type,
  halaman: FileText,
  agenda: CalendarDays,
  sekilasinfo: Megaphone,
  album: FolderOpen,
  galeri: Images,
  playlist: ListVideo,
  video: Clapperboard,
  tagvideo: Tags,
  komentarvideo: MessagesSquare,
  download: Download,
  poling: Vote,
  hubungi: Mail,
  member: Users,
  banner: AppWindow,
  iklanatas: PanelTop,
  iklantengah: AppWindow,
  pasangiklan: AppWindow,
  identitas: BookOpen,
  menu: Menu,
  templates: Palette,
  logo: Image,
  header: PanelTop,
  background: Wallpaper,
  alamat: MapPin,
  ym: Contact,
  users: UserCog,
  modul: ShieldCheck,
};

export type NavGroup = {
  title: string;
  items: { key: ModulKey; title: string; badge?: number }[];
};

export function AppSidebar({ user, groups, nama }: { user: UserSummary; groups: NavGroup[]; nama: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <AppLogo nama={nama} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip={{ children: "Dashboard" }}>
                <Link href="/dashboard">
                  <LayoutGrid />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {groups.map((group) => (
          <SidebarGroup key={group.title} className="px-2 py-0">
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const href = `/admin/${item.key}`;
                const Icon = ICON[item.key];

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href || pathname.startsWith(`${href}/`)}
                      tooltip={{ children: item.title }}
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {!!item.badge && (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-[active=true]/menu-button:text-primary-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Lihat portal" }}>
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <Globe />
                    <span>Lihat portal</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavUser({ user }: { user: UserSummary }) {
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const logout = async () => {
    setOpenMobile(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
              <UserInfo user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            side={isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom"}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfo user={user} showEmail />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link className="block w-full cursor-pointer" href="/settings/profile" onClick={() => setOpenMobile(false)}>
                  <Settings className="mr-2" />
                  Pengaturan akun
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={logout}>
              <LogOut className="mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
