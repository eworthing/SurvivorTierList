export const nativeShare = async ({ title, text }: { title?: string; text?: string }) => {
  try {
    if (typeof navigator !== 'undefined') {
      const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string }) => Promise<void> };
      if (nav.share && typeof nav.share === 'function') {
        await nav.share({ title, text });
        return true;
      }

      // Fallback: copy to clipboard when available
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && text) {
        await navigator.clipboard.writeText(text);
        window.dispatchEvent(new CustomEvent('tierlist:notify', { detail: { message: 'Ranking copied to clipboard' } }));
        return true;
      }
    }
  } catch {
    // ignore errors
  }
  return false;
};
