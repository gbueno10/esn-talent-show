'use client'

import type { VoteCount } from '@/types/talent-show'

interface VoteBarProps {
  voteCounts: VoteCount
}

export default function VoteBar({ voteCounts }: VoteBarProps) {
  const { yes_count, no_count, total } = voteCounts
  const yesPercent = total > 0 ? Math.round((yes_count / total) * 100) : 50
  const noPercent = total > 0 ? 100 - yesPercent : 50

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Labels */}
      <div className="flex justify-between mb-3">
        <div className="text-green-400">
          <span className="text-5xl font-bold">{yesPercent}%</span>
          <span className="text-xl ml-2">YES</span>
        </div>
        <div className="text-red-400 text-right">
          <span className="text-xl mr-2">NO</span>
          <span className="text-5xl font-bold">{noPercent}%</span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-16 bg-gray-800 rounded-2xl overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700 ease-out flex items-center justify-center"
          style={{ width: `${yesPercent}%` }}
        >
          {yesPercent > 10 && (
            <span className="text-white font-bold text-xl">{yes_count}</span>
          )}
        </div>
        <div
          className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700 ease-out flex items-center justify-center"
          style={{ width: `${noPercent}%` }}
        >
          {noPercent > 10 && (
            <span className="text-white font-bold text-xl">{no_count}</span>
          )}
        </div>
      </div>
    </div>
  )
}
