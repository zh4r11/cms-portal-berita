"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import Field from "@/components/field";
import FormDialog from "@/components/form-dialog";
import PageHeader from "@/components/page-header";
import PasswordInput from "@/components/password-input";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { formatTanggalSingkat } from "@/lib/format";
import { hapusMember, tambahMember, ubahMember } from "./actions";

type Member = { id: number; nama: string; email: string; username: string; createdAt: Date };
type Form = { nama: string; email: string; username: string; password: string };

export function MemberTable({ member }: { member: Member[] }) {
  const { cari, setCari, hasil } = useClientSearch(member, (m) => [m.nama, m.email, m.username]);
  const crud = useCrudDialog<Member, Form>({
    empty: { nama: "", email: "", username: "", password: "" },
    toForm: (m) => ({ nama: m.nama, email: m.email, username: m.username, password: "" }),
    store: tambahMember,
    update: ubahMember,
  });

  return (
    <>
      <PageHeader
        title="Member"
        description="Data pembaca terdaftar, dibawa dari tabel member versi lama. Portal belum memakai login member."
      >
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah member
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari nama, email, atau username..." />

      <DataTableCard
        rows={hasil}
        rowKey={(m) => m.id}
        emptyText={cari ? `Tidak ada member yang cocok dengan "${cari}".` : "Belum ada member. Tabel member di data lama juga kosong."}
        columns={[
          { header: "Nama", cell: (m) => <span className="font-medium">{m.nama}</span> },
          { header: "Username", cell: (m) => m.username },
          { header: "Email", cell: (m) => m.email },
          { header: "Terdaftar", cell: (m) => formatTanggalSingkat(m.createdAt), className: "w-32" },
          {
            header: "Aksi",
            cell: (m) => <RowActions onEdit={() => crud.openEdit(m)} destroy={() => hapusMember(m.id)} deleteTitle={`Hapus member ${m.nama}?`} />,
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah member" : "Tambah member"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <Field id="nama" label="Nama" error={crud.form.errors.nama}>
          <Input id="nama" value={crud.form.data.nama} onChange={(e) => crud.form.setData("nama", e.target.value)} autoFocus />
        </Field>
        <Field id="email" label="Email" error={crud.form.errors.email}>
          <Input id="email" type="email" value={crud.form.data.email} onChange={(e) => crud.form.setData("email", e.target.value)} />
        </Field>
        <Field id="username" label="Username" error={crud.form.errors.username}>
          <Input id="username" value={crud.form.data.username} onChange={(e) => crud.form.setData("username", e.target.value)} />
        </Field>
        <Field
          id="password"
          label="Password"
          error={crud.form.errors.password}
          hint={crud.editing ? "Kosongkan bila tidak ingin mengganti password." : "Minimal 8 karakter."}
        >
          <PasswordInput
            id="password"
            value={crud.form.data.password}
            onChange={(e) => crud.form.setData("password", e.target.value)}
            autoComplete="new-password"
          />
        </Field>
      </FormDialog>
    </>
  );
}
