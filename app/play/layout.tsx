export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 to-slate-800">
      {children}
    </div>
  )
}
