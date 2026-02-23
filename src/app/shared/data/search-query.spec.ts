import { TestBed } from '@angular/core/testing';

import { SearchQueryService } from './search-query';

describe('SearchQueryService', () => {
    let service: SearchQueryService;

    beforeEach(() => {
        TestBed.resetTestingModule();
        service = TestBed.inject(SearchQueryService);
    });

    it('should be provided in root', () => {
        expect(service).toBeTruthy();
    });

    it('should have empty string as default query', () => {
        expect(service.query()).toBe('');
    });

    it('should update query value', () => {
        service.query.set('monet');
        expect(service.query()).toBe('monet');
    });

    it('should overwrite previous query', () => {
        service.query.set('monet');
        service.query.set('van gogh');
        expect(service.query()).toBe('van gogh');
    });

    it('should reset query to empty string', () => {
        service.query.set('monet');
        service.query.set('');
        expect(service.query()).toBe('');
    });
});
