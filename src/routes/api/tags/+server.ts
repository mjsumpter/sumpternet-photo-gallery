import { json } from '@sveltejs/kit';
import { FLICKR_API_KEY, FLICKR_USER_ID } from '$env/static/private';

export async function GET() {
	const endpoint = `https://www.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&extras=tags&format=json&nojsoncallback=1`;

	try {
		// Fetch the data
		const response = await fetch(endpoint);
		const data = await response.json();

		// Check if the response contains photos
		if (data?.photos?.photo) {
			const photoTags = data.photos.photo;

			// Initialize a tag count map
			const tagCounts = {};

			// Iterate through all photos and count tags
			photoTags.forEach((photo) => {
				const tags = photo.tags.split(' '); // Split tags by space
				tags.forEach((tag: string) => {
					if (tag) {
						// Increment the count for each tag
						tagCounts[tag] = (tagCounts[tag] || 0) + 1;
					}
				});
			});

			// Convert the tagCounts object into an array of { tag, count } objects
			const sortedTags = Object.entries(tagCounts)
				.map(([tag, count]) => ({ tag, count }))
				.sort((a, b) => b.count - a.count); // Sort by count (descending)

			return json(sortedTags);
		} else {
			return json({ error: 'No photos found' }, { status: 404 });
		}
	} catch (error) {
		console.error('Error fetching tags:', error);
		return json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
}
