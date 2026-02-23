import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsSkeleton } from './details-skeleton';

describe('DetailsSkeleton', () => {
    let fixture: ComponentFixture<DetailsSkeleton>;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [DetailsSkeleton],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(DetailsSkeleton);
        fixture.detectChanges();
    });

    it('should render skeleton placeholders', () => {
        const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
        expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });

    it('should render back button placeholder as circle', () => {
        const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
        const backPlaceholder = skeletons[0];
        expect(backPlaceholder).toBeTruthy();
        expect(backPlaceholder.classList.contains('rounded-full')).toBe(true);
    });

    it('should render image placeholder with aspect ratio', () => {
        const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton');
        const imagePlaceholder = skeletons[1];
        expect(imagePlaceholder).toBeTruthy();
        expect(imagePlaceholder.style.aspectRatio).toBe('4 / 3');
    });
});
