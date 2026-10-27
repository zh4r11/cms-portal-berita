"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { unggahGambarEditor } from "@/app/(app)/admin/editor-actions";

/**
 * Editor isi berita/halaman/agenda (pengganti TinyMCE di versi lama).
 * Menghasilkan HTML; HTML dibersihkan lagi di server sebelum dirender.
 */
export default function RichTextEditor({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        class: "isi-artikel min-h-72 px-3 py-2 outline-none",
        "aria-multiline": "true",
        role: "textbox",
        ...(invalid && { "aria-invalid": "true" }),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        invalid && "border-destructive ring-destructive/20",
      )}
    >
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b" />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div role="toolbar" aria-label="Format teks" className="flex flex-wrap items-center gap-0.5 border-b p-1">
      <Tombol icon={Bold} label="Tebal" active={state.bold} onClick={() => chain().toggleBold().run()} />
      <Tombol icon={Italic} label="Miring" active={state.italic} onClick={() => chain().toggleItalic().run()} />
      <Tombol icon={Underline} label="Garis bawah" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
      <Pemisah />
      <Tombol icon={Heading2} label="Subjudul" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <Tombol icon={Heading3} label="Subjudul kecil" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <Tombol icon={List} label="Daftar berpoin" active={state.bullet} onClick={() => chain().toggleBulletList().run()} />
      <Tombol icon={ListOrdered} label="Daftar bernomor" active={state.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <Tombol icon={Quote} label="Kutipan" active={state.quote} onClick={() => chain().toggleBlockquote().run()} />
      <Pemisah />
      <TautanPopover editor={editor} active={state.link} />
      <UnggahGambar editor={editor} />
      <Pemisah />
      <Button type="button" variant="ghost" size="icon-sm" onClick={() => chain().undo().run()} disabled={!state.canUndo} aria-label="Urungkan">
        <Undo2 />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={() => chain().redo().run()} disabled={!state.canRedo} aria-label="Ulangi">
        <Redo2 />
      </Button>
    </div>
  );
}

function Tombol({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <Toggle size="sm" pressed={active} onPressedChange={onClick} aria-label={label} title={label}>
      <Icon />
    </Toggle>
  );
}

function Pemisah() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

function TautanPopover({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) {
          setUrl(editor.getAttributes("link").href ?? "");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Toggle size="sm" pressed={active} aria-label="Tautan" title="Tautan">
          <Link2 />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const href = url.trim();

            if (href) {
              editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            } else {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
            }

            setOpen(false);
          }}
        >
          <label htmlFor="editor-url" className="text-sm font-medium">
            Alamat tautan
          </label>
          <Input id="editor-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" autoFocus />
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
              >
                Hapus tautan
              </Button>
            )}
            <Button type="submit" size="sm">
              Pasang
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function UnggahGambar({ editor }: { editor: Editor }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => input.current?.click()}
        disabled={pending}
        aria-label="Sisipkan gambar"
        title="Sisipkan gambar"
      >
        {pending ? <Spinner /> : <ImagePlus />}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (!file) {
            return;
          }

          startTransition(async () => {
            const result = await unggahGambarEditor(file);

            if ("url" in result) {
              editor.chain().focus().setImage({ src: result.url, alt: "" }).run();
            } else {
              toast.error(result.error);
            }
          });
        }}
      />
    </>
  );
}
