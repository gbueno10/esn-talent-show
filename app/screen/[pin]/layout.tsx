export default function ScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black overflow-hidden cursor-none">
      {children}
    </div>
  )
}
