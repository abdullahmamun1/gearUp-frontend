"use client"

import { useEffect, useId, useRef, useState } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, ImagePlus, Link2, Loader2, X } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { getUploadSignature } from "@/api/uploads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFormat } from "@/i18n/useFormat"
import {
  cloudinaryThumb,
  imageFileProblem,
  UPLOAD_ERROR,
  uploadToCloudinary,
} from "@/utils/cloudinary"

type Pending = { id: string; name: string; progress: number }

/**
 * Photos for a listing: drop or pick files (uploaded straight to
 * Cloudinary), paste a URL, drag to reorder. The first photo is the cover.
 */
export function ImageGalleryEditor({
  value,
  onChange,
  max,
}: {
  value: string[]
  onChange: (urls: string[]) => void
  max: number
}) {
  const t = useTranslations("common")
  const format = useFormat()
  const inputId = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [urlDraft, setUrlDraft] = useState("")
  // The latest list, for uploads that finish after other changes.
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const room = max - value.length - pending.length

  async function addFiles(files: FileList | File[]) {
    const list = [...files]
    const problems = list
      .map(imageFileProblem)
      .filter((problem) => problem !== null)
    problems.forEach((problem) =>
      toast.error(t(`upload.${problem.key}`, { name: problem.name }))
    )
    const ok = list.filter((file) => !imageFileProblem(file)).slice(0, room)
    if (list.length - problems.length > room) {
      toast.error(t("gallery.tooMany", { max: format.number(max) }))
    }
    if (ok.length === 0) return

    const signature = await getUploadSignature("gear")
    if (!signature.success) {
      toast.error(signature.message)
      return
    }

    const batch = ok.map((file) => ({
      file,
      id: `${file.name}-${crypto.randomUUID()}`,
    }))
    setPending((current) => [
      ...current,
      ...batch.map(({ id, file }) => ({ id, name: file.name, progress: 0 })),
    ])

    await Promise.all(
      batch.map(async ({ id, file }) => {
        try {
          const url = await uploadToCloudinary(
            file,
            signature.data,
            (progress) =>
              setPending((current) =>
                current.map((item) =>
                  item.id === id ? { ...item, progress } : item
                )
              )
          )
          latest.current = [...latest.current, url]
          onChange(latest.current)
        } catch (error) {
          const message = (error as Error).message
          toast.error(
            `${file.name}: ${
              message === UPLOAD_ERROR.network
                ? t("upload.network")
                : message === UPLOAD_ERROR.failed
                  ? t("upload.failed")
                  : message
            }`
          )
        } finally {
          setPending((current) => current.filter((item) => item.id !== id))
        }
      })
    )
  }

  function addUrl() {
    const url = urlDraft.trim()
    if (!url) return
    if (!/^https:\/\/\S+$/.test(url)) {
      toast.error(t("gallery.needHttps"))
      return
    }
    if (room <= 0) {
      toast.error(t("gallery.tooMany", { max: format.number(max) }))
      return
    }
    onChange([...value, url])
    setUrlDraft("")
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = value.indexOf(String(active.id))
    const to = value.indexOf(String(over.id))
    if (from >= 0 && to >= 0) onChange(arrayMove(value, from, to))
  }

  return (
    <div className="grid gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          if (event.dataTransfer.files.length)
            addFiles(event.dataTransfer.files)
        }}
        className={cn(
          "grid place-items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "bg-muted/30",
          room <= 0 && "opacity-60"
        )}
      >
        <ImagePlus className="size-7 text-muted-foreground" aria-hidden />
        <p className="text-sm">
          {t.rich("gallery.drop", {
            strong: (chunks) => <span className="font-medium">{chunks}</span>,
            choose: (chunks) => (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={room <= 0}
                className="cursor-pointer font-semibold text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed"
              >
                {chunks}
              </button>
            ),
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("gallery.formats", {
            count: format.number(value.length),
            max: format.number(max),
          })}
        </p>
        <input
          ref={fileInput}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files)
            event.target.value = ""
          }}
        />
      </div>

      {(value.length > 0 || pending.length > 0) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {value.map((url, index) => (
                <SortableThumb
                  key={url}
                  url={url}
                  cover={index === 0}
                  onRemove={() =>
                    onChange(value.filter((item) => item !== url))
                  }
                />
              ))}
              {pending.map((item) => (
                <li
                  key={item.id}
                  className="relative grid aspect-square place-items-center overflow-hidden rounded-lg border bg-muted"
                >
                  <Loader2
                    className="size-5 animate-spin text-muted-foreground"
                    aria-hidden
                  />
                  <span className="sr-only">
                    {t("gallery.uploading", { name: item.name })}
                  </span>
                  <span className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-background/80">
                    <span
                      className="block h-full bg-primary transition-[width]"
                      style={{ width: `${Math.round(item.progress * 100)}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addUrl()
              }
            }}
            placeholder={t("gallery.urlPlaceholder")}
            aria-label={t("gallery.urlLabel")}
            className="pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={addUrl}>
          {t("gallery.add")}
        </Button>
      </div>
      {value.length > 1 && (
        <p className="text-xs text-muted-foreground">
          {t("gallery.reorderHint")}
        </p>
      )}
    </div>
  )
}

function SortableThumb({
  url,
  cover,
  onRemove,
}: {
  url: string
  cover: boolean
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url })
  const t = useTranslations("common.gallery")

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
        isDragging && "z-10 shadow-lg ring-2 ring-primary"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- any host the provider pastes */}
      <img
        src={cloudinaryThumb(url, 240)}
        alt=""
        className="size-full object-cover"
        draggable={false}
      />
      {cover && (
        <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {t("cover")}
        </span>
      )}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t("dragHandle")}
        className="absolute bottom-1.5 left-1.5 grid size-7 cursor-grab place-items-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("remove")}
        className="absolute top-1.5 right-1.5 grid size-7 cursor-pointer place-items-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-4" aria-hidden />
      </button>
    </li>
  )
}
