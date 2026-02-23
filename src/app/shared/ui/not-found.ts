import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    imports: [RouterLink],
    template: `
        <div class="flex flex-col items-center justify-center py-32 text-gray-400">
            <span class="font-display text-8xl font-bold text-gray-300">404</span>
            <p class="font-display text-xl mt-4">Page not found</p>
            <p class="text-sm mt-2">The page you're looking for doesn't exist or has been moved.</p>
            <a routerLink="/" class="mt-6 text-sm text-gray-500 underline underline-offset-4 hover:text-gray-700 transition-colors">
                Back to gallery
            </a>
        </div>
    `,
})
export class NotFound {}
