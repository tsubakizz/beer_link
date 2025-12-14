import React from "react";

interface BubblesProps {
  count?: number;
  variant?: "header" | "footer";
}

// 泡のパラメータを事前に生成（サーバーコンポーネントでも使えるように固定値）
const bubbleConfigs = [
  { size: 1.2, distance: 3.5, position: 8, time: 4.5, delay: 0.2 },
  { size: 2.1, distance: 4.2, position: 22, time: 5.1, delay: 1.3 },
  { size: 1.5, distance: 2.8, position: 35, time: 4.8, delay: 0.7 },
  { size: 2.8, distance: 5.1, position: 48, time: 5.5, delay: 2.1 },
  { size: 1.8, distance: 3.2, position: 62, time: 4.2, delay: 0.5 },
  { size: 2.4, distance: 4.8, position: 75, time: 5.8, delay: 1.8 },
  { size: 1.3, distance: 2.5, position: 88, time: 4.0, delay: 2.5 },
  { size: 2.0, distance: 3.8, position: 95, time: 5.3, delay: 0.9 },
  { size: 1.6, distance: 4.0, position: 15, time: 4.6, delay: 1.5 },
  { size: 2.2, distance: 3.0, position: 55, time: 5.0, delay: 2.8 },
  { size: 1.9, distance: 4.5, position: 70, time: 4.3, delay: 0.3 },
  { size: 2.6, distance: 5.5, position: 42, time: 5.6, delay: 1.1 },
];

export function Bubbles({ count = 8, variant = "footer" }: BubblesProps) {
  const containerClass =
    variant === "header" ? "bubbles-header" : "bubbles-footer";

  return (
    <div className={containerClass}>
      {bubbleConfigs.slice(0, count).map((config, i) => (
        <div
          key={i}
          className="bubble"
          style={
            {
              "--size": `${config.size}rem`,
              "--distance": `${config.distance}rem`,
              "--position": `${config.position}%`,
              "--time": `${config.time}s`,
              "--delay": `${config.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
