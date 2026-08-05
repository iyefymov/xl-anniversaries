type PrivacyNoteProps = {
  className?: string
}

export function PrivacyNote({
  className = 'privacy-note',
}: PrivacyNoteProps) {
  return (
    <p className={className}>
      Processed in your browser and kept on this device until you replace the
      file. Nothing is uploaded to a server.
    </p>
  )
}
