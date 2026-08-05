import { useRef, useState, type DragEvent, type ReactNode } from 'react'

type FileDropzoneProps = {
  busy?: boolean
  accept?: string
  className?: string
  onFile: (file: File) => void
  children: ReactNode
}

export function FileDropzone({
  busy = false,
  accept,
  className = 'upload-dropzone',
  onFile,
  children,
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)

  function acceptFile(file: File | undefined) {
    if (file) onFile(file)
  }

  function onDragEnter(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    dragDepth.current += 1
    setDragging(true)
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = busy ? 'none' : 'copy'
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragDepth.current = 0
    setDragging(false)
    if (busy) return
    acceptFile(e.dataTransfer.files?.[0])
  }

  return (
    <label
      className={className}
      data-busy={busy || undefined}
      data-dragging={dragging || undefined}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          acceptFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </label>
  )
}
