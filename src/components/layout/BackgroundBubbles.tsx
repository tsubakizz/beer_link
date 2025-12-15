"use client";

import React, { useState, useEffect } from "react";

interface BubbleConfig {
  size: number;
  top: number;
  left: number;
}

interface BackgroundBubblesProps {
  count?: number;
  opacity?: number;
  minSize?: number;
  maxSize?: number;
}

function generateBubbles(
  count: number,
  minSize: number,
  maxSize: number
): BubbleConfig[] {
  return Array.from({ length: count }, () => ({
    size: Math.random() * (maxSize - minSize) + minSize,
    top: Math.random() * 100,
    left: Math.random() * 100,
  }));
}

export function BackgroundBubbles({
  count = 15,
  opacity = 0.35,
  minSize = 50,
  maxSize = 150,
}: BackgroundBubblesProps) {
  const [bubbles, setBubbles] = useState<BubbleConfig[]>([]);

  useEffect(() => {
    setBubbles(generateBubbles(count, minSize, maxSize));
  }, [count, minSize, maxSize]);

  // 初回レンダリング時は空（ハイドレーションエラー回避）
  if (bubbles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-200"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: `${bubble.top}%`,
            left: `${bubble.left}%`,
            opacity: opacity,
          }}
        />
      ))}
    </div>
  );
}
