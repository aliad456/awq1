const EMOJIS = ["⚔️", "🛡️", "🔥", "🏹", "👑", "🪙", "🗡️", "✨", "🐉", "🏰"];

const PIECES = Array.from({ length: 26 }, (_, i) => {
  const seed = (i * 97) % 100;
  return {
    emoji: EMOJIS[i % EMOJIS.length],
    left: (seed * 3.7) % 100,
    delay: (i * 0.73) % 12,
    duration: 11 + ((i * 5) % 14),
    size: 14 + ((i * 7) % 22),
    drift: ((i % 5) - 2) * 40,
    opacity: 0.18 + ((i % 4) * 0.08),
  };
});

export function FallingEmojis() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="falling-emoji"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export default FallingEmojis;
