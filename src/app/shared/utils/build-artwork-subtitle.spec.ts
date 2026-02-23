import { buildArtworkSubtitle } from './build-artwork-subtitle';

describe('buildArtworkSubtitle', () => {
    it('should join date and short medium with a dot separator', () => {
        expect(buildArtworkSubtitle('1889', 'Oil on canvas, framed')).toBe('1889 · Oil on canvas');
    });

    it('should take only first part before comma from medium', () => {
        expect(buildArtworkSubtitle('1900', 'Bronze, gold patina, marble base')).toBe('1900 · Bronze');
    });

    it('should return only date when medium is empty', () => {
        expect(buildArtworkSubtitle('1889', '')).toBe('1889');
    });

    it('should return only medium when date is empty', () => {
        expect(buildArtworkSubtitle('', 'Oil on canvas')).toBe('Oil on canvas');
    });

    it('should return empty string when both are empty', () => {
        expect(buildArtworkSubtitle('', '')).toBe('');
    });

    it('should handle medium with no comma', () => {
        expect(buildArtworkSubtitle('1920', 'Watercolor')).toBe('1920 · Watercolor');
    });

    it('should handle null medium', () => {
        expect(buildArtworkSubtitle('1889', null as unknown as string)).toBe('1889');
    });

    it('should handle undefined medium', () => {
        expect(buildArtworkSubtitle('1889', undefined as unknown as string)).toBe('1889');
    });
});
