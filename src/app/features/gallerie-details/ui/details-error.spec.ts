import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsError } from './details-error';

describe('DetailsError', () => {
    let fixture: ComponentFixture<DetailsError>;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [DetailsError],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(DetailsError);
        fixture.detectChanges();
    });

    it('should display "Artwork not found" message', () => {
        expect(fixture.nativeElement.textContent).toContain('Artwork not found');
    });

    it('should display description text', () => {
        expect(fixture.nativeElement.textContent).toContain('The artwork you are looking for could not be loaded.');
    });

    it('should render a back button', () => {
        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.textContent).toContain('Back to gallery');
    });

    it('should emit goBack when button is clicked', () => {
        const spy = vi.fn();
        fixture.componentInstance.goBack.subscribe(spy);

        const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        button.click();

        expect(spy).toHaveBeenCalledOnce();
    });
});
