'use client'

export default function WaitingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-pulse mb-6">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Get Ready!
      </h2>
      <p className="text-slate-400 text-lg">
        The show is about to start...
      </p>

      <div className="mt-8 flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-white/30 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
