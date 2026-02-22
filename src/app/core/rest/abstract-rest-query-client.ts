import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable, of, tap } from 'rxjs';

import type { CacheEntry, EndpointMap, EndpointProvider, ParamsOf, RequestConfig, ResponseOf } from './rest-query-client';

const DEFAULT_TTL = 5 * 60 * 1000; // 5 min

export abstract class AbstractRestQueryClient<TMap extends EndpointMap> {
    private readonly _cache = new Map<string, CacheEntry>();

    protected readonly _http = inject(HttpClient);

    protected abstract readonly _baseUrl: string;

    protected abstract readonly _endpoints: EndpointProvider<TMap>;

    get<K extends keyof TMap & string>(
        endpoint: K,
        ...args: ParamsOf<TMap, K> extends void ? [config?: RequestConfig] : [params: ParamsOf<TMap, K>, config?: RequestConfig]
    ): Observable<ResponseOf<TMap, K>> {
        const [paramsOrConfig, maybeConfig] = args;
        const hasParams = this._endpointRequiresParams(endpoint);
        const params = hasParams ? (paramsOrConfig as ParamsOf<TMap, K>) : undefined;
        const config = (hasParams ? maybeConfig : paramsOrConfig) as RequestConfig | undefined;

        const url = this._resolveUrl(endpoint, params);
        const cacheEnabled = config?.cache !== false;
        const ttl = config?.ttl ?? DEFAULT_TTL;
        const key = config?.cacheKey ?? this._buildCacheKey('GET', endpoint, params);

        // Cache hit
        if (cacheEnabled) {
            const cached = this._getFromCache<ResponseOf<TMap, K>>(key);
            if (cached) return of(cached);
        }

        const httpParams = this._buildHttpParams(params);

        return this._http.get<ResponseOf<TMap, K>>(url, { params: httpParams }).pipe(
            tap((data) => {
                if (cacheEnabled) this._setCache(key, data, ttl);
            }),
        );
    }

    invalidate<K extends keyof TMap & string>(endpoint: K): void {
        const prefix = `:${endpoint}:`;
        for (const key of this._cache.keys()) {
            if (key.includes(prefix)) this._cache.delete(key);
        }
    }

    invalidateAll(): void {
        this._cache.clear();
    }

    private _resolveUrl<K extends keyof TMap & string>(endpoint: K, params?: ParamsOf<TMap, K>): string {
        const def = this._endpoints[endpoint];
        const path = typeof def === 'function' ? (def as (p: ParamsOf<TMap, K>) => string)(params as ParamsOf<TMap, K>) : (def as string);

        return `${this._baseUrl}${path}`;
    }

    private _buildCacheKey(method: string, endpoint: string, data?: unknown): string {
        const serialized = data
            ? JSON.stringify(data, (_, v) => {
                  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
                      return Object.keys(v as Record<string, unknown>)
                          .sort()
                          .reduce<Record<string, unknown>>((s, k) => {
                              s[k] = (v as Record<string, unknown>)[k];
                              return s;
                          }, {});
                  }
                  return v;
              })
            : '';
        return `${method}:${endpoint}:${serialized}`;
    }

    private _buildHttpParams(params: unknown): HttpParams | undefined {
        if (!params || typeof params !== 'object') return undefined;

        let hp = new HttpParams();
        for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
            if (v !== undefined && v !== null) {
                hp = hp.set(k, Array.isArray(v) ? v.join(',') : String(v));
            }
        }
        return hp;
    }

    private _getFromCache<T>(key: string): T | null {
        const entry = this._cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this._cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    private _setCache(key: string, data: unknown, ttl: number): void {
        this._cache.set(key, { data, timestamp: Date.now(), ttl });
    }

    private _endpointRequiresParams(endpoint: keyof TMap & string): boolean {
        return typeof this._endpoints[endpoint] === 'function';
    }
}
