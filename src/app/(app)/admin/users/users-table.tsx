"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import PasswordInput from "@/components/password-input";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import { SimpleSelect } from "@/components/select-field";
import ToggleAktif from "@/components/toggle-aktif";
import { UserInfo } from "@/components/user-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { isSuperAdmin } from "@/lib/cms";
import { blokirUser, hapusUser, tambahUser, ubahUser } from "./actions";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  noTelp: string | null;
  image: string | null;
  level: "admin" | "user";
  blokir: boolean;
  modul: number[];
  _count: { berita: number };
};
type Form = { name: string; username: string; email: string; noTelp: string; level: string; password: string; modul: number[] };

export function UsersTable({ sayaId, users, modul }: { sayaId: string; users: User[]; modul: { id: number; nama: string; aktif: boolean }[] }) {
  const { cari, setCari, hasil } = useClientSearch(users, (u) => [u.name, u.username, u.email]);
  const crud = useCrudDialog<User, Form>({
    empty: { name: "", username: "", email: "", noTelp: "", level: "user", password: "", modul: [] },
    toForm: (u) => ({ name: u.name, username: u.username, email: u.email, noTelp: u.noTelp ?? "", level: u.level, password: "", modul: u.modul }),
    store: tambahUser,
    update: ubahUser,
  });
  const { data, setData, errors } = crud.form;

  return (
    <>
      <PageHeader
        title="Manajemen User"
        description="Akun redaksi. Level admin membuka semua modul; level user hanya modul yang dicentang."
      >
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah akun
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari nama, username, atau email..." />

      <DataTableCard
        rows={hasil}
        rowKey={(u) => u.id}
        emptyText={cari ? `Tidak ada akun yang cocok dengan "${cari}".` : "Belum ada akun."}
        columns={[
          {
            header: "Akun",
            cell: (u) => (
              <div className="flex min-w-52 items-center gap-2">
                <UserInfo user={u} showEmail />
              </div>
            ),
          },
          { header: "Username", cell: (u) => u.username },
          {
            header: "Level",
            cell: (u) => (
              <div className="space-y-1">
                <Badge variant={u.level === "admin" ? "default" : "outline"}>{u.level === "admin" ? "Admin" : "User"}</Badge>
                {u.level === "user" && <p className="text-xs text-muted-foreground">{u.modul.length} modul</p>}
              </div>
            ),
            className: "w-28",
          },
          { header: "Berita", cell: (u) => u._count.berita, className: "w-20 tabular-nums" },
          {
            header: "Boleh login",
            cell: (u) =>
              isSuperAdmin(u.username) || u.id === sayaId ? (
                <span className="text-xs text-muted-foreground">{u.id === sayaId ? "Akun Anda" : "Admin utama"}</span>
              ) : (
                <ToggleAktif checked={!u.blokir} action={(v) => blokirUser(u.id, !v)} label={`Izinkan ${u.name} login`} />
              ),
            className: "w-28",
          },
          {
            header: "Aksi",
            cell: (u) => (
              <RowActions
                onEdit={() => crud.openEdit(u)}
                destroy={isSuperAdmin(u.username) || u.id === sayaId ? undefined : () => hapusUser(u.id)}
                deleteTitle={`Hapus akun ${u.name}?`}
                deleteDescription={`${u._count.berita} berita tulisannya tetap ada tanpa nama penulis.`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? `Ubah akun ${crud.editing.name}` : "Tambah akun"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nama lengkap" error={errors.name}>
            <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} autoFocus />
          </Field>
          <Field id="username" label="Username" error={errors.username}>
            <Input id="username" value={data.username} onChange={(e) => setData("username", e.target.value)} autoComplete="off" />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <Input id="email" type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
          </Field>
          <Field id="noTelp" label="No. telepon" error={errors.noTelp}>
            <Input id="noTelp" type="tel" value={data.noTelp} onChange={(e) => setData("noTelp", e.target.value)} />
          </Field>
          <Field id="level" label="Level" error={errors.level}>
            <SimpleSelect
              id="level"
              value={data.level}
              onChange={(v) => setData("level", v)}
              options={[
                { value: "user", label: "User (modul terpilih)" },
                { value: "admin", label: "Admin (semua modul)" },
              ]}
            />
          </Field>
          <Field
            id="password"
            label="Password"
            error={errors.password}
            hint={crud.editing ? "Kosongkan bila tidak diganti." : undefined}
          >
            <PasswordInput id="password" value={data.password} onChange={(e) => setData("password", e.target.value)} autoComplete="new-password" />
          </Field>
        </div>

        {data.level === "user" && (
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-medium">Modul yang boleh dibuka</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {modul.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`modul-${m.id}`}
                    checked={data.modul.includes(m.id)}
                    onCheckedChange={(v) => setData("modul", v === true ? [...data.modul, m.id] : data.modul.filter((id) => id !== m.id))}
                  />
                  <Label htmlFor={`modul-${m.id}`} className="font-normal">
                    {m.nama}
                    {!m.aktif && <span className="text-xs text-muted-foreground">(nonaktif)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>
        )}
      </FormDialog>
    </>
  );
}
