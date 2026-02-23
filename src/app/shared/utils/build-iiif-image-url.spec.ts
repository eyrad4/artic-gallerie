import { buildIiifImageUrl } from './build-iiif-image-url';

describe('buildIiifImageUrl', () => {
    const baseUrl = 'https://www.artic.edu/iiif/2';

    it('should build a full IIIF URL with default width', () => {
        expect(buildIiifImageUrl(baseUrl, 'abc123')).toBe('https://www.artic.edu/iiif/2/abc123/full/843,/0/default.jpg');
    });

    it('should build a full IIIF URL with custom width', () => {
        expect(buildIiifImageUrl(baseUrl, 'abc123', 400)).toBe('https://www.artic.edu/iiif/2/abc123/full/400,/0/default.jpg');
    });

    it('should return empty string when imageId is null', () => {
        expect(buildIiifImageUrl(baseUrl, null)).toBe('');
    });

    it('should return empty string when imageId is empty string', () => {
        expect(buildIiifImageUrl(baseUrl, '' as unknown as null)).toBe('');
    });
});
