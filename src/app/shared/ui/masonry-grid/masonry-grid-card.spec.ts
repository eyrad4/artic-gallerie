import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryGridCard } from './masonry-grid-card';

describe('MasonryGridCard', () => {
    let fixture: ComponentFixture<MasonryGridCard>;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [MasonryGridCard],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(MasonryGridCard);
        fixture.componentRef.setInput('id', 1);
        fixture.componentRef.setInput('title', 'Starry Night');
        fixture.componentRef.setInput('imageUrl', 'https://example.com/image.jpg');
        fixture.detectChanges();
    });

    const cardEl = () => fixture.nativeElement.querySelector('.card') as HTMLElement | null;
    const shimmerEls = () => fixture.nativeElement.querySelectorAll('.shimmer') as NodeListOf<HTMLElement>;
    const titleEl = () => fixture.nativeElement.querySelector('.font-display') as HTMLElement | null;
    const artistEl = () => fixture.nativeElement.querySelector('.px-4 > .text-gray-500') as HTMLElement | null;
    const subtitleEl = () => fixture.nativeElement.querySelector('.text-caption') as HTMLElement | null;
    const imgEl = () => fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
    const favBtn = () => fixture.nativeElement.querySelector('.fav-btn') as HTMLButtonElement | null;

    describe('loading state', () => {
        beforeEach(() => {
            fixture.componentRef.setInput('loading', true);
            fixture.detectChanges();
        });

        it('should render shimmer placeholders when loading', () => {
            expect(shimmerEls().length).toBeGreaterThan(0);
        });

        it('should not render the card content when loading', () => {
            expect(cardEl()).toBeNull();
            expect(imgEl()).toBeNull();
        });
    });

    describe('normal state', () => {
        it('should render the card when not loading', () => {
            expect(cardEl()).toBeTruthy();
        });

        it('should display the title', () => {
            expect(titleEl()?.textContent?.trim()).toBe('Starry Night');
        });

        it('should display the artist', () => {
            fixture.componentRef.setInput('artist', 'Van Gogh');
            fixture.detectChanges();
            expect(artistEl()?.textContent?.trim()).toBe('Van Gogh');
        });

        it('should render the image with correct src', () => {
            expect(imgEl()).toBeTruthy();
            expect(imgEl()?.alt).toBe('Starry Night');
        });

        it('should not render shimmer when not loading', () => {
            expect(shimmerEls().length).toBe(0);
        });
    });

    describe('subtitle', () => {
        it('should not render subtitle when not provided', () => {
            expect(subtitleEl()).toBeNull();
        });

        it('should render subtitle when provided', () => {
            fixture.componentRef.setInput('subtitle', '1889, Oil on canvas');
            fixture.detectChanges();
            expect(subtitleEl()?.textContent?.trim()).toBe('1889, Oil on canvas');
        });

        it('should hide subtitle when set to empty string', () => {
            fixture.componentRef.setInput('subtitle', '');
            fixture.detectChanges();
            expect(subtitleEl()).toBeNull();
        });
    });

    describe('aspect ratio', () => {
        it('should default to 3/4 when no dimensions provided', () => {
            const ratioEl = fixture.nativeElement.querySelector('[style*="aspect-ratio"]') as HTMLElement;
            expect(ratioEl.style.aspectRatio).toBe('3 / 4');
        });

        it('should compute aspect ratio from imageWidth and imageHeight', () => {
            fixture.componentRef.setInput('imageWidth', 800);
            fixture.componentRef.setInput('imageHeight', 600);
            fixture.detectChanges();

            const ratioEl = fixture.nativeElement.querySelector('[style*="aspect-ratio"]') as HTMLElement;
            expect(ratioEl.style.aspectRatio).toBe('800 / 600');
        });

        it('should fall back to 3/4 if only width is provided', () => {
            fixture.componentRef.setInput('imageWidth', 800);
            fixture.detectChanges();

            const ratioEl = fixture.nativeElement.querySelector('[style*="aspect-ratio"]') as HTMLElement;
            expect(ratioEl.style.aspectRatio).toBe('3 / 4');
        });

        it('should fall back to 3/4 if only height is provided', () => {
            fixture.componentRef.setInput('imageHeight', 600);
            fixture.detectChanges();

            const ratioEl = fixture.nativeElement.querySelector('[style*="aspect-ratio"]') as HTMLElement;
            expect(ratioEl.style.aspectRatio).toBe('3 / 4');
        });
    });

    describe('favorite button', () => {
        it('should render favorite button', () => {
            expect(favBtn()).toBeTruthy();
        });

        it('should not have active class when not favorite', () => {
            expect(favBtn()?.classList.contains('active')).toBe(false);
        });

        it('should have active class when favorite', () => {
            fixture.componentRef.setInput('favorite', true);
            fixture.detectChanges();
            expect(favBtn()?.classList.contains('active')).toBe(true);
        });

        it('should emit favoriteToggle on favorite button click', () => {
            const spy = vi.fn();
            fixture.componentInstance.favoriteToggle.subscribe(spy);

            favBtn()?.click();

            expect(spy).toHaveBeenCalledOnce();
        });

        it('should stop propagation on favorite button click', () => {
            const cardClickSpy = vi.fn();
            fixture.componentInstance.cardClick.subscribe(cardClickSpy);

            favBtn()?.click();

            expect(cardClickSpy).not.toHaveBeenCalled();
        });

        it('should have accessible label', () => {
            expect(favBtn()?.getAttribute('aria-label')).toBe('Toggle favorite');
        });
    });

    describe('card click', () => {
        it('should emit cardClick when card is clicked', () => {
            const spy = vi.fn();
            fixture.componentInstance.cardClick.subscribe(spy);

            cardEl()?.click();

            expect(spy).toHaveBeenCalledOnce();
        });
    });

    describe('image loaded', () => {
        it('should emit imageLoaded when image fires load event', () => {
            const spy = vi.fn();
            fixture.componentInstance.imageLoaded.subscribe(spy);

            imgEl()?.dispatchEvent(new Event('load'));

            expect(spy).toHaveBeenCalledOnce();
        });
    });

    describe('image error', () => {
        it('should show placeholder when image fails to load', () => {
            imgEl()?.dispatchEvent(new Event('error'));
            fixture.detectChanges();

            expect(imgEl()).toBeNull();
            expect(fixture.nativeElement.querySelector('app-image-placeholder')).toBeTruthy();
        });

        it('should keep card content visible when image fails', () => {
            imgEl()?.dispatchEvent(new Event('error'));
            fixture.detectChanges();

            expect(titleEl()?.textContent?.trim()).toBe('Starry Night');
        });
    });

    describe('priority', () => {
        it('should not set fetchpriority by default', () => {
            expect(imgEl()?.getAttribute('fetchpriority')).not.toBe('high');
        });
    });
});
