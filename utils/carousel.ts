import { useCallback, useEffect, useState, type CSSProperties } from "react";

/** Track/slide widths so translateX moves exactly one viewport per slide. */
export function getCarouselTrackStyle(
  slide: number,
  groupCount: number
): CSSProperties {
  if (groupCount <= 0) return { display: "flex" };
  return {
    display: "flex",
    width: `${groupCount * 100}%`,
    transform: `translateX(-${(slide / groupCount) * 100}%)`,
    transition: "transform 500ms ease-in-out",
  };
}

export function getCarouselSlideStyle(groupCount: number): CSSProperties {
  if (groupCount <= 0) return { flexShrink: 0 };
  return {
    width: `${100 / groupCount}%`,
    flexShrink: 0,
  };
}

export function chunkIntoGroups<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

export function useAutoCarousel(
  groupCount: number,
  intervalMs = 4000,
  enabled = true
) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setSlide(0);
  }, [groupCount]);

  useEffect(() => {
    if (!enabled || groupCount <= 1 || paused) return;

    const intervalId = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % groupCount);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [groupCount, paused, intervalMs, enabled]);

  const onMouseEnter = useCallback(() => setPaused(true), []);
  const onMouseLeave = useCallback(() => setPaused(false), []);

  return { slide, setSlide, paused, onMouseEnter, onMouseLeave };
}
