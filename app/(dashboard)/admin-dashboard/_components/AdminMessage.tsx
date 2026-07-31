export function AdminMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed p-12 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
