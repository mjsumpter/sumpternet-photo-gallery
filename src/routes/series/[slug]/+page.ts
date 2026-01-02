import type { PageLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { error } from '@sveltejs/kit';
import { series } from '$lib/series';

export const load: PageLoad = async ({ params, fetch }) => {
	const entry = series.find((item) => item.slug === params.slug);

	if (!entry) {
		throw error(404, 'Series not found');
	}

	const response = await fetch(`/api/series/${entry.slug}`);
	if (!response.ok) {
		let details = 'Failed to load series';

		try {
			const payload = await response.json();
			if (payload?.error) {
				details = payload.error;
			}
		} catch {
			// Ignore parsing errors and fall back to generic message.
		}

		throw error(response.status, details);
	}

	const data = await response.json();

	return {
		series: entry,
		photos: data.photos || []
	};
};
