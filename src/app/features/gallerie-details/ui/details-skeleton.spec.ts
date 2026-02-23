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

    it('should render shimmer placeholders', () => {
        const shimmers = fixture.nativeElement.querySelectorAll('.shimmer');
        expect(shimmers.length).toBeGreaterThanOrEqual(3);
    });

    it('should render back button placeholder', () => {
        const backPlaceholder = fixture.nativeElement.querySelector('.size-10.rounded-full');
        expect(backPlaceholder).toBeTruthy();
    });

    it('should render image placeholder with correct aspect ratio', () => {
        const imagePlaceholder = fixture.nativeElement.querySelector('.rounded-lg.shimmer');
        expect(imagePlaceholder).toBeTruthy();
    });
});
