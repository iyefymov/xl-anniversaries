type PersonGridHeaderProps = {
  className?: string
}

export function PersonGridHeader({ className }: PersonGridHeaderProps) {
  return (
    <div className={className ?? 'person-grid-header'}>
      <span>Employee</span>
      <span>Anniversary date</span>
      <span>Manager</span>
      <span className="text-right">Years</span>
    </div>
  )
}
