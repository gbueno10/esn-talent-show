'use client'

export default function ClosedScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">🎉</div>

      <h2 className="text-3xl font-bold text-white mb-3">
        Thank you!
      </h2>
      <p className="text-slate-400 text-lg max-w-sm">
        Thanks for voting! The results are being shown on screen.
      </p>
    </div>
  )
}
