import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AbstractRestQueryClient } from './abstract-rest-query-client';
import type { EndpointProvider } from './rest-query-client';

interface Item {
    id: number;
    name: string;
}

type TestEndpointMap = {
    items: { response: Item[]; params: { page: number; tags?: string[] } };
    'items/:id': { response: Item; params: { id: number } };
};

@Injectable()
class TestClient extends AbstractRestQueryClient<TestEndpointMap> {
    protected readonly _baseUrl = 'https://api.test.com';

    protected readonly _endpoints: EndpointProvider<TestEndpointMap> = {
        items: () => '/items',
        'items/:id': ({ id }) => `/items/${id}`,
    };
}

const matchUrl = (url: string) => (r: { url: string }) => r.url === url;

describe('AbstractRestQueryClient', () => {
    let client: TestClient;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            teardown: { destroyAfterEach: true },
            providers: [provideHttpClient(), provideHttpClientTesting(), TestClient],
        }).compileComponents();

        client = TestBed.inject(TestClient);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    describe('URL resolution', () => {
        it('should resolve static function endpoint', () => {
            client.get('items', { page: 1 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            req.flush([]);
        });

        it('should resolve parameterized endpoint with path params', () => {
            client.get('items/:id', { id: 42 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items/42'));
            req.flush({ id: 42, name: 'Test' });
        });

        it('should resolve parameterized endpoint with id = 0', () => {
            client.get('items/:id', { id: 0 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items/0'));
            req.flush({ id: 0, name: 'Zero' });
        });

        it('should resolve parameterized endpoint with negative id', () => {
            client.get('items/:id', { id: -1 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items/-1'));
            req.flush({ id: -1, name: 'Negative' });
        });
    });

    describe('HTTP params', () => {
        it('should send params as query params', () => {
            client.get('items', { page: 3 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            expect(req.request.params.get('page')).toBe('3');
            req.flush([]);
        });

        it('should join array params with commas', () => {
            client.get('items', { page: 1, tags: ['oil', 'canvas'] }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            expect(req.request.params.get('tags')).toBe('oil,canvas');
            req.flush([]);
        });

        it('should skip undefined param values', () => {
            client.get('items', { page: 1, tags: undefined } as any).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            expect(req.request.params.has('tags')).toBe(false);
            expect(req.request.params.get('page')).toBe('1');
            req.flush([]);
        });

        it('should handle page=0 as a valid param value', () => {
            client.get('items', { page: 0 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            expect(req.request.params.get('page')).toBe('0');
            req.flush([]);
        });

        it('should handle empty array param', () => {
            client.get('items', { page: 1, tags: [] }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items'));
            expect(req.request.params.get('tags')).toBe('');
            req.flush([]);
        });

        it('should also send path params as query params for function endpoints', () => {
            client.get('items/:id', { id: 42 }).subscribe();

            const req = httpTesting.expectOne(matchUrl('https://api.test.com/items/42'));
            expect(req.request.params.get('id')).toBe('42');
            req.flush({ id: 42, name: 'Test' });
        });
    });

    describe('caching', () => {
        it('should cache GET response by default', () => {
            const results: Item[][] = [];

            client.get('items', { page: 1 }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([{ id: 1, name: 'A' }]);

            client.get('items', { page: 1 }).subscribe((r) => results.push(r));
            // no second HTTP request — served from cache

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual(results[1]);
        });

        it('should make separate requests for different params', () => {
            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            client.get('items', { page: 2 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);
        });

        it('should generate same cache key regardless of param property order', () => {
            const results: Item[][] = [];

            client.get('items', { page: 1, tags: ['a'] }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([{ id: 1, name: 'A' }]);

            client.get('items', { tags: ['a'], page: 1 } as any).subscribe((r) => results.push(r));
            // no HTTP request — same cache key

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual(results[1]);
        });

        it('should bypass cache when cache: false', () => {
            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            client.get('items', { page: 1 }, { cache: false }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);
        });

        it('should not store response when cache: false', () => {
            client.get('items', { page: 1 }, { cache: false }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([{ id: 1, name: 'A' }]);

            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);
        });

        it('should use custom cacheKey when provided', () => {
            const results: Item[][] = [];

            client.get('items', { page: 1 }, { cacheKey: 'my-key' }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([{ id: 1, name: 'A' }]);

            // different params but same cacheKey — should hit cache
            client.get('items', { page: 999 }, { cacheKey: 'my-key' }).subscribe((r) => results.push(r));

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual(results[1]);
        });

        it('should expire cache after TTL', () => {
            vi.useFakeTimers();

            client.get('items', { page: 1 }, { ttl: 1000 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            vi.advanceTimersByTime(1001);

            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            vi.useRealTimers();
        });

        it('should serve from cache before TTL expires', () => {
            vi.useFakeTimers();

            const results: Item[][] = [];

            client.get('items', { page: 1 }, { ttl: 5000 }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([{ id: 1, name: 'A' }]);

            vi.advanceTimersByTime(4999);

            client.get('items', { page: 1 }).subscribe((r) => results.push(r));
            // no HTTP request — still cached

            expect(results).toHaveLength(2);

            vi.useRealTimers();
        });
    });

    describe('invalidation', () => {
        it('should invalidate cache for a specific endpoint', () => {
            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            client.invalidate('items');

            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);
        });

        it('should not invalidate cache for other endpoints', () => {
            const results: Item[] = [];

            client.get('items/:id', { id: 1 }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items/1')).flush({ id: 1, name: 'A' });

            client.invalidate('items');

            client.get('items/:id', { id: 1 }).subscribe((r) => results.push(r));
            // no HTTP request — items/:id cache untouched

            expect(results).toHaveLength(2);
        });

        it('should invalidate all cache entries with invalidateAll', () => {
            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            client.get('items/:id', { id: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items/1')).flush({ id: 1, name: 'A' });

            client.invalidateAll();

            client.get('items', { page: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            client.get('items/:id', { id: 1 }).subscribe();
            httpTesting.expectOne(matchUrl('https://api.test.com/items/1')).flush({ id: 1, name: 'A' });
        });

        it('should handle invalidate when cache is already empty', () => {
            expect(() => client.invalidate('items')).not.toThrow();
            expect(() => client.invalidateAll()).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle empty array response', () => {
            let result: Item[] | undefined;

            client.get('items', { page: 1 }).subscribe((r) => (result = r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush([]);

            expect(result).toEqual([]);
        });

        it('should propagate HTTP errors', () => {
            let error: any;

            client.get('items', { page: 1 }).subscribe({ error: (e) => (error = e) });
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush('Not Found', { status: 404, statusText: 'Not Found' });

            expect(error).toBeTruthy();
            expect(error.status).toBe(404);
        });

        it('should not cache failed responses', () => {
            client.get('items', { page: 1 }).subscribe({ error: () => {} });
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush('Error', { status: 500, statusText: 'Server Error' });

            client.get('items', { page: 1 }).subscribe({ error: () => {} });
            httpTesting.expectOne(matchUrl('https://api.test.com/items')).flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should handle concurrent requests to same endpoint with cache disabled', () => {
            const results: Item[][] = [];

            client.get('items', { page: 1 }, { cache: false }).subscribe((r) => results.push(r));
            client.get('items', { page: 1 }, { cache: false }).subscribe((r) => results.push(r));

            const reqs = httpTesting.match(matchUrl('https://api.test.com/items'));
            expect(reqs).toHaveLength(2);

            reqs[0].flush([{ id: 1, name: 'A' }]);
            reqs[1].flush([{ id: 2, name: 'B' }]);

            expect(results).toHaveLength(2);
            expect(results[0]).not.toEqual(results[1]);
        });

        it('should cache different parameterized endpoints independently', () => {
            const results: Item[] = [];

            client.get('items/:id', { id: 1 }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items/1')).flush({ id: 1, name: 'A' });

            client.get('items/:id', { id: 2 }).subscribe((r) => results.push(r));
            httpTesting.expectOne(matchUrl('https://api.test.com/items/2')).flush({ id: 2, name: 'B' });

            // both should be cached independently
            client.get('items/:id', { id: 1 }).subscribe((r) => results.push(r));
            client.get('items/:id', { id: 2 }).subscribe((r) => results.push(r));

            expect(results).toHaveLength(4);
            expect(results[0]).toEqual(results[2]);
            expect(results[1]).toEqual(results[3]);
        });
    });
});
