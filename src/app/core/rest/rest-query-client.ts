export type EndpointMap = Record<
    string,
    {
        response: unknown;
        params?: unknown;
        body?: unknown;
    }
>;

export type ResponseOf<TMap extends EndpointMap, K extends keyof TMap> = TMap[K]['response'];

export type ParamsOf<TMap extends EndpointMap, K extends keyof TMap> = TMap[K] extends { params: infer P } ? P : undefined;

export interface RequestConfig {
    /** Enable caching for this request. Default: true for GET, false for POST. */
    cache?: boolean;
    /** Cache TTL in milliseconds. Default: 300_000 (5 min). */
    ttl?: number;
    /** Custom cache key override. If not provided, auto-generated from method+endpoint+params. */
    cacheKey?: string;
}

export interface CacheEntry<T = unknown> {
    data: T;
    timestamp: number;
    ttl: number;
}

export type EndpointDef<TParams = void> = TParams extends void ? string : string | ((params: TParams) => string);

export type EndpointProvider<TMap extends EndpointMap> = {
    [K in keyof TMap]: EndpointDef<ParamsOf<TMap, K>>;
};
