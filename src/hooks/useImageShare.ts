// Clean exportTierImageAndShare helper (single export)
export const exportTierImageAndShare = async (selector: string) => {
  try {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return false;
    const mod = await import('html2canvas').catch(() => null);
    if (!mod || typeof mod.default !== 'function') return false;
    const html2canvasFn = mod.default as (el: HTMLElement) => Promise<HTMLCanvasElement>;
    const canvas: HTMLCanvasElement = await html2canvasFn(el);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b)));
    if (blob) {
      const nav = navigator as Navigator & { canShare?: (arg: unknown) => boolean; share?: (data: { files?: File[]; title?: string }) => Promise<void> };
      if (nav.canShare && nav.share) {
        const file = new File([blob], 'survivor-ranking.png', { type: 'image/png' });
        try {
          await nav.share({ files: [file], title: 'Survivor Tier List' });
          return true;
        } catch {
          // fallthrough to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survivor-ranking.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
};
