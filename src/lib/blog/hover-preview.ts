export function hoverPreviewOffset(
  pointer: { x: number; y: number },
  card: { left: number; top: number; width: number; height: number },
  preview: { width: number; height: number },
  viewport: { width: number; height: number },
) {
  // Clamp to the viewport, not the card: the beginning of a title must track too.
  const left = Math.max(8, Math.min(pointer.x + 20, viewport.width - preview.width - 8));
  const preferredTop = pointer.y + 24;
  const top = Math.max(8, preferredTop + preview.height <= viewport.height - 8
    ? preferredTop
    : pointer.y - preview.height - 24);
  return {
    x: left - (card.left + card.width - preview.width),
    y: top - card.top - card.height / 2 + preview.height / 2,
  };
}
