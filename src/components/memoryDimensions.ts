export interface ImageDimensions {
  width: number;
  height: number;
}

export function fitWithinLongSide(
  width: number,
  height: number,
  maxLongSide: number
): ImageDimensions {
  const longSide = Math.max(width, height);
  if (longSide <= maxLongSide) return { width, height };

  const scale = maxLongSide / longSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
