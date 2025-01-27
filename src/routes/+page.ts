import type { PageLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [tagsRes, photosRes] = await Promise.all([fetch('/api/tags'), fetch('/api/photos')]);

		const tags = await tagsRes.json();
		const photos = await photosRes.json();

		return {
			tags,
			initialPhotos: photos.photo || []
		};
	} catch (error) {
		console.error('Error in load function:', error);
		return {
			tags: [],
			initialPhotos: []
		};
	}
};
