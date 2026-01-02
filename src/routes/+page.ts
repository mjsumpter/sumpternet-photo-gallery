import type { PageLoad } from '../../.svelte-kit/types/src/routes/$types';
import { series } from '$lib/series';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [tagsRes, photosRes, seriesResponses] = await Promise.all([
			fetch('/api/tags'),
			fetch('/api/photos'),
			Promise.all(
				series.map(async (entry) => {
					try {
						const res = await fetch(`/api/series/${entry.slug}`);
						if (!res.ok) return entry;
						const payload = await res.json();
						const coverUrl = payload?.photos?.[0]?.displayUrl;
						return coverUrl ? { ...entry, coverUrl } : entry;
					} catch {
						return entry;
					}
				})
			)
		]);

		const tags = await tagsRes.json();
		const photos = await photosRes.json();

		return {
			tags,
			initialPhotos: photos.photo || [],
			series: seriesResponses
		};
	} catch (error) {
		console.error('Error in load function:', error);
		return {
			tags: [],
			initialPhotos: [],
			series: []
		};
	}
};
