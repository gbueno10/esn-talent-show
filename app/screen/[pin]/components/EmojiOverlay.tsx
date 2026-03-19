'use client'

import { useMemo } from 'react'

interface Reaction {
  id: number
  emoji: string
  nickname: string
}

interface EmojiOverlayProps {
  reactions: Reaction[]
}

export default function EmojiOverlay({ reactions }: EmojiOverlayProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {reactions.map(reaction => (
        <FloatingEmoji key={reaction.id} reaction={reaction} />
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function FloatingEmoji({ reaction }: { reaction: Reaction }) {
  const style = useMemo(() => {
    const left = Math.random() * 90 + 5
    const duration = 2 + Math.random() * 1.5
    return {
      left: `${left}%`,
      '--duration': `${duration}s`,
    } as React.CSSProperties
  }, [])

  return (
    <div
      className="absolute bottom-0 animate-[floatUp_var(--duration)_ease-out_forwards]"
      style={style}
    >
      <span className="text-5xl">{reaction.emoji}</span>
    </div>
  )
}
