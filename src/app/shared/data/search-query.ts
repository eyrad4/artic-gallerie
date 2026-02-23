import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchQueryService {
    readonly query = signal('');
}
