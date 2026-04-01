"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link2,
  ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react"
import { useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

const MenuButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault()
      if (!disabled) onClick()
    }}
    disabled={disabled}
    title={title}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent disabled:opacity-50",
      active && "bg-muted text-foreground"
    )}
  >
    {children}
  </button>
)


function Toolbar({ editor }: { editor: Editor | null }) {
  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter URL:")
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter image URL:")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div
      className="flex flex-wrap gap-1 border-b border-border bg-muted/30 p-2"
      onMouseDown={(e) => e.preventDefault()}
    >
      <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo className="h-4 w-4" />
      </MenuButton>
      <span className="mx-1 w-px bg-border" />
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive("heading", { level: 4 })}
        title="Heading 4"
      >
        <Heading4 className="h-4 w-4" />
      </MenuButton>
      <span className="mx-1 w-px bg-border" />
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <Bold className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <Italic className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={addLink} active={editor.isActive("link")} title="Link">
        <Link2 className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={addImage} title="Image">
        <ImageIcon className="h-4 w-4" />
      </MenuButton>
      <span className="mx-1 w-px bg-border" />
      <MenuButton
        onClick={() => {
          const chain = editor.chain().focus("end")
          const ran = chain.toggleList("bulletList", "listItem").run()
          if (!ran && editor.isEmpty) {
            editor.chain().focus("end").insertContent("<ul><li><p></p></li></ul>").run()
          }
        }}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => {
          const chain = editor.chain().focus("end")
          const ran = chain.toggleList("orderedList", "listItem").run()
          if (!ran && editor.isEmpty) {
            editor.chain().focus("end").insertContent("<ol><li><p></p></li></ol>").run()
          }
        }}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Table"
      >
        <TableIcon className="h-4 w-4" />
      </MenuButton>
      <span className="mx-1 w-px bg-border" />
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </MenuButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
  minHeight = "200px",
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: "end",
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[120px]",
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  const handleContainerMouseDown = useCallback(() => {
    if (editor && !editor.isDestroyed && !editor.isFocused) {
      editor.commands.focus("end")
    }
  }, [editor])

  return (
    <div
      data-rich-editor
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
      onMouseDown={handleContainerMouseDown}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="[&>div]:min-h-full [&_.ProseMirror]:min-h-[120px]"
        style={{ minHeight }}
      />
    </div>
  )
}
