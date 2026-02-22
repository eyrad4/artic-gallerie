import { Injectable, inject } from '@angular/core';
import { AbstractRestQueryClient } from '../../../core/rest/abstract-rest-query-client';
import { EndpointProvider } from '../../../core/rest/rest-query-client';
import { ARTIC_BASE_URL, ARTIC_ENDPOINTS, ArticEndpointMap } from './artic.endpoints';

@Injectable({ providedIn: 'root' })
export class ArticClient extends AbstractRestQueryClient<ArticEndpointMap> {
    protected readonly _baseUrl = inject(ARTIC_BASE_URL);

    protected readonly _endpoints: EndpointProvider<ArticEndpointMap> = inject(ARTIC_ENDPOINTS);
}
