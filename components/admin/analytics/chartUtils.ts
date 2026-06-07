type ChartPoint = { x: number; y: number };

type CubicSegment = {
  x1: number;
  y1: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  x2: number;
  y2: number;
};

function peakPlateauEnd(pts: ChartPoint[], start: number): number {
  const y = pts[start].y;
  let end = start;
  while (end + 1 < pts.length && pts[end + 1].y === y) end++;
  return end;
}

function plateauStartIndex(pts: ChartPoint[], index: number): number {
  const y = pts[index].y;
  let start = index;
  while (start > 0 && pts[start - 1].y === y) start--;
  return start;
}

function isPeakPlateauStart(pts: ChartPoint[], index: number): boolean {
  if (index >= pts.length - 1) return false;
  if (pts[index].y !== pts[index + 1].y) return false;

  const y = pts[index].y;
  const prevY = index > 0 ? pts[index - 1].y : y + 1;
  const end = peakPlateauEnd(pts, index);
  const nextY = end + 1 < pts.length ? pts[end + 1].y : y + 1;

  return y < prevY && y < nextY;
}

function isOnPeakPlateau(pts: ChartPoint[], index: number): boolean {
  return isPeakPlateauStart(pts, plateauStartIndex(pts, index));
}

function collapsePeakPlateaus(pts: ChartPoint[]): ChartPoint[] {
  if (pts.length <= 2) return pts;

  const out: ChartPoint[] = [];
  let i = 0;

  while (i < pts.length) {
    if (isPeakPlateauStart(pts, i)) {
      const end = peakPlateauEnd(pts, i);
      out.push({
        x: (pts[i].x + pts[end].x) / 2,
        y: pts[i].y,
      });
      i = end + 1;
      continue;
    }

    out.push(pts[i]);
    i++;
  }

  return out;
}

function cardinalControls(
  p0: ChartPoint,
  p1: ChartPoint,
  p2: ChartPoint,
  p3: ChartPoint,
  tension: number
) {
  let cp1x = p1.x + (p2.x - p0.x) * tension;
  let cp1y = p1.y + (p2.y - p0.y) * tension;
  let cp2x = p2.x - (p3.x - p1.x) * tension;
  let cp2y = p2.y - (p3.y - p1.y) * tension;

  const peakY = Math.min(p1.y, p2.y);
  cp1y = Math.max(cp1y, peakY);
  cp2y = Math.max(cp2y, peakY);

  return { cp1x, cp1y, cp2x, cp2y };
}

function cardinalSegment(
  p0: ChartPoint,
  p1: ChartPoint,
  p2: ChartPoint,
  p3: ChartPoint,
  tension: number
): string {
  const { cp1x, cp1y, cp2x, cp2y } = cardinalControls(p0, p1, p2, p3, tension);
  return ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
}

function evalCubic(t: number, a: number, b: number, c: number, d: number): number {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

function yAtXOnCubic(seg: CubicSegment, targetX: number): number {
  const { x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2 } = seg;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  if (targetX < minX || targetX > maxX) return y1;

  let lo = 0;
  let hi = 1;

  for (let step = 0; step < 48; step++) {
    const mid = (lo + hi) / 2;
    const x = evalCubic(mid, x1, cp1x, cp2x, x2);
    if (x < targetX) lo = mid;
    else hi = mid;
  }

  const t = (lo + hi) / 2;
  return evalCubic(t, y1, cp1y, cp2y, y2);
}

function buildCurveSegments(
  pts: ChartPoint[],
  tension = 0.35
): CubicSegment[] {
  const curvePts = collapsePeakPlateaus(pts);
  if (curvePts.length < 2) return [];

  const segments: CubicSegment[] = [];

  for (let i = 0; i < curvePts.length - 1; i++) {
    const p0 = curvePts[i - 1] ?? curvePts[i];
    const p1 = curvePts[i];
    const p2 = curvePts[i + 1];
    const p3 = curvePts[i + 2] ?? p2;
    const { cp1x, cp1y, cp2x, cp2y } = cardinalControls(p0, p1, p2, p3, tension);

    segments.push({
      x1: p1.x,
      y1: p1.y,
      cp1x,
      cp1y,
      cp2x,
      cp2y,
      x2: p2.x,
      y2: p2.y,
    });
  }

  return segments;
}

function yOnCurve(segments: CubicSegment[], x: number, fallbackY: number): number {
  for (const seg of segments) {
    const minX = Math.min(seg.x1, seg.x2);
    const maxX = Math.max(seg.x1, seg.x2);
    if (x >= minX - 0.5 && x <= maxX + 0.5) {
      return yAtXOnCubic(seg, x);
    }
  }
  return fallbackY;
}

/** Snap peak-plateau dots onto the rounded curve at their x position. */
export function snapPointsToCurve(
  pts: ChartPoint[],
  tension = 0.35
): ChartPoint[] {
  const segments = buildCurveSegments(pts, tension);

  return pts.map((p, index) => {
    if (!isOnPeakPlateau(pts, index)) return p;
    return { x: p.x, y: yOnCurve(segments, p.x, p.y) };
  });
}

/**
 * Rounded peaks that touch the top line and curve back, using the original
 * smooth cardinal spline style (tension 0.35).
 */
export function smoothCurvePath(
  pts: ChartPoint[],
  tension = 0.35,
  _yMin = 0
): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  const curvePts = collapsePeakPlateaus(pts);

  if (curvePts.length === 1) return `M ${curvePts[0].x} ${curvePts[0].y}`;
  if (curvePts.length === 2) {
    const p0 = curvePts[0];
    const p1 = curvePts[1];
    if (p0.y === p1.y) {
      return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
    }
  }

  let d = `M ${curvePts[0].x} ${curvePts[0].y}`;

  for (let i = 0; i < curvePts.length - 1; i++) {
    const p0 = curvePts[i - 1] ?? curvePts[i];
    const p1 = curvePts[i];
    const p2 = curvePts[i + 1];
    const p3 = curvePts[i + 2] ?? p2;
    d += cardinalSegment(p0, p1, p2, p3, tension);
  }

  return d;
}

export function niceChartMax(values: number[], floor = 10): number {
  const peak = Math.max(...values, 0);
  if (peak <= 0) return floor;

  const magnitude = 10 ** Math.floor(Math.log10(peak));
  const normalized = peak / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function buildYAxisTicks(maxV: number, steps = 5): number[] {
  const ceiling = Math.max(maxV, 1);
  const step = ceiling / steps;
  const ticks: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const value = i === steps ? ceiling : Math.round(step * i);
    if (ticks.length === 0 || ticks[ticks.length - 1] !== value) {
      ticks.push(value);
    }
  }

  return ticks;
}
