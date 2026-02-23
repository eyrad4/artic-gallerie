export const buildArtworkSubtitle = (date: string, medium: string): string => {
    const shortMedium = medium?.split(',')[0] ?? '';
    return [date, shortMedium].filter(Boolean).join(' \u00b7 ');
};
