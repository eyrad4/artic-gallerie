export const buildIiifImageUrl = (iiifUrl: string, imageId: string | null, width = 843): string => {
    if (!imageId) return '';
    return `${iiifUrl}/${imageId}/full/${width},/0/default.jpg`;
};
