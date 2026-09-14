const EMOJIS = ["⚔️", "🛡️", "🏹", "🔥"];

const PIECES = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 97) % 100;
  return {
    emoji: EMOJIS[i % EMOJIS.length],
    left: (seed * 3.7) % 100,
    delay: (i * 1.4) % 18,
    duration: 20 + ((i * 5) % 16),
    size: 12 + ((i * 5) % 10),
    drift: ((i % 5) - 2) * 30,
    opacity: 0.05 + (i % 3) * 0.025,
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
