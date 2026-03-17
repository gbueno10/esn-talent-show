'use client'

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
      {reactions.map(reaction => {
        // Random horizontal position
        const left = Math.random() * 90 + 5
        const duration = 2 + Math.random() * 1.5

        return (
          <div
            key={reaction.id}
            className="absolute bottom-0 animate-[floatUp_var(--duration)_ease-out_forwards]"
            style={{
              left: `${left}%`,
              '--duration': `${duration}s`,
            } as React.CSSProperties}
          >
            <span className="text-5xl">{reaction.emoji}</span>
          </div>
        )
      })}

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
