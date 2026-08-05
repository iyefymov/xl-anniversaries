type PrivacyNoteProps = {
  className?: string
}

export function PrivacyNote({
  className = 'privacy-note',
}: PrivacyNoteProps) {
  return (
    <p className={className}>
      Processed entirely in your browser; nothing is uploaded to a server.
    </p>
  )
}
