import { TestBed } from '@angular/core/testing';
import type { ArticArtworkListItem } from '../rest/artic-client/artic-list';
import { Favorites } from './favorites';

const mockItem = (id: number): ArticArtworkListItem => ({
    id,
    title: `Artwork ${id}`,
    image_id: `img-${id}`,
    thumbnail: null,
    artist_title: null,
    date_display: null,
    medium_display: null,
});

describe('Favorites', () => {
    let service: Favorites;

    beforeEach(() => {
        TestBed.resetTestingModule();
        service = TestBed.inject(Favorites);
    });

    it('should be provided in root', () => {
        expect(service).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have empty items', () => {
            expect(service.items()).toEqual([]);
        });

        it('should have empty ids set', () => {
            expect(service.ids().size).toBe(0);
        });

        it('should have count 0', () => {
            expect(service.count()).toBe(0);
        });
    });

    describe('upsert', () => {
        it('should add an item', () => {
            service.upsert(mockItem(1));

            expect(service.items()).toEqual([mockItem(1)]);
            expect(service.count()).toBe(1);
        });

        it('should remove an item when upserted twice', () => {
            service.upsert(mockItem(1));
            service.upsert(mockItem(1));

            expect(service.items()).toEqual([]);
            expect(service.count()).toBe(0);
        });

        it('should add multiple unique items', () => {
            service.upsert(mockItem(1));
            service.upsert(mockItem(2));
            service.upsert(mockItem(3));

            expect(service.count()).toBe(3);
            expect(service.items()).toEqual([mockItem(1), mockItem(2), mockItem(3)]);
        });

        it('should remove only the toggled item', () => {
            service.upsert(mockItem(1));
            service.upsert(mockItem(2));
            service.upsert(mockItem(3));
            service.upsert(mockItem(2));

            expect(service.count()).toBe(2);
            expect(service.items()).toEqual([mockItem(1), mockItem(3)]);
        });
    });

    describe('ids', () => {
        it('should return a Set of current ids', () => {
            service.upsert(mockItem(10));
            service.upsert(mockItem(20));

            const ids = service.ids();
            expect(ids).toBeInstanceOf(Set);
            expect(ids.has(10)).toBe(true);
            expect(ids.has(20)).toBe(true);
            expect(ids.has(99)).toBe(false);
        });

        it('should update after removal', () => {
            service.upsert(mockItem(10));
            service.upsert(mockItem(20));
            service.upsert(mockItem(10));

            expect(service.ids().has(10)).toBe(false);
            expect(service.ids().has(20)).toBe(true);
        });
    });

    describe('isFavorite', () => {
        it('should return false for unknown id', () => {
            expect(service.isFavorite(999)).toBe(false);
        });

        it('should return true after adding', () => {
            service.upsert(mockItem(1));
            expect(service.isFavorite(1)).toBe(true);
        });

        it('should return false after toggling off', () => {
            service.upsert(mockItem(1));
            service.upsert(mockItem(1));
            expect(service.isFavorite(1)).toBe(false);
        });
    });
});
