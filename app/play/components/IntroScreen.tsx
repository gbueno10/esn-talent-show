'use client'

import type { Performer } from '@/types/talent-show'

interface IntroScreenProps {
  performer: Performer | null
}

export default function IntroScreen({ performer }: IntroScreenProps) {
  if (!performer) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-slate-400 text-lg">Waiting for the next performer...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4">
        <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
          Now on stage
        </span>
      </div>

      <h1 className="text-4xl font-bold text-white mb-4 animate-[fadeInUp_0.5s_ease-out]">
        {performer.name}
      </h1>

      {performer.act_description && (
        <p className="text-xl text-slate-300 max-w-md animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
          {performer.act_description}
        </p>
      )}

      <div className="mt-12 text-slate-500 text-sm animate-pulse">
        Voting will open soon...
      </div>
    </div>
  )
}
