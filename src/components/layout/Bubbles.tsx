"use client";

import React, { useState, useEffect } from "react";

interface BubblesProps {
  count?: number;
  variant?: "header" | "footer";
}

interface BubbleConfig {
  size: number;
  distance: number;
  position: number;
  time: number;
  delay: number;
}

function generateBubbles(count: number): BubbleConfig[] {
  return Array.from({ length: count }, () => ({
    size: Math.random() * 1.0 + 0.8, // 0.8〜1.8rem
    distance: Math.random() * 3.0 + 2.5, // 2.5〜5.5rem
    position: Math.random() * 100, // 0〜100%
    time: Math.random() * 2.0 + 4.0, // 4〜6秒
    delay: Math.random() * 3.0, // 0〜3秒
  }));
}

export function Bubbles({ count = 8, variant = "footer" }: BubblesProps) {
  const [bubbles, setBubbles] = useState<BubbleConfig[]>([]);

  useEffect(() => {
    setBubbles(generateBubbles(count));
  }, [count]);

  const containerClass =
    variant === "header" ? "bubbles-header" : "bubbles-footer";

  // 初回レンダリング時は空（ハイドレーションエラー回避）
  if (bubbles.length === 0) {
    return <div className={containerClass} />;
  }

  return (
    <div className={containerClass}>
      {bubbles.map((config, i) => (
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
