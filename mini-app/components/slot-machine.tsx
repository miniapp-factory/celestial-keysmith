"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const fruits = ["apple", "banana", "cherry", "lemon"] as const;
type Fruit = typeof fruits[number];

function randomFruit(): Fruit {
  return fruits[Math.floor(Math.random() * fruits.length)];
}

export default function SlotMachine() {
  const [grid, setGrid] = useState<Fruit[][]>(Array.from({ length: 3 }, () => Array.from({ length: 3 }, randomFruit)));
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(false);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        // shift each column down
        for (let col = 0; col < 3; col++) {
          const newVal = randomFruit();
          newGrid[2][col] = newGrid[1][col];
          newGrid[1][col] = newGrid[0][col];
          newGrid[0][col] = newVal;
        }
        return newGrid;
      });
      if (Date.now() - start >= 2000) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSpinning(false);
      }
    }, 100);
  };

  // Check win condition directly in render
  const hasWin =
    // rows
    grid.some(row => row.every(f => f === row[0])) ||
    // columns
    [0, 1, 2].some(col =>
      grid.every(row => row[col] === grid[0][col])
    );

  useEffect(() => {
    if (hasWin) setWin(true);
  }, [hasWin]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flat().map((fruit, idx) => (
          <img
            key={idx}
            src={`/${fruit}.png`}
            alt={fruit}
            width={80}
            height={80}
            className="rounded-md"
          />
        ))}
      </div>
      <Button onClick={spin} disabled={spinning} variant="outline">
        {spinning ? "Spinning..." : "Spin"}
      </Button>
      {win && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-semibold text-green-600">You win!</span>
          <Share text={`I just won a fruit slot machine! ${url}`} />
        </div>
      )}
    </div>
  );
}
