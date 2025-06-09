import { env } from '$env/dynamic/private';

export async function GET({ url }) {
	const FLICKR_API_KEY = env.FLICKR_API_KEY;
	const FLICKR_USER_ID = env.FLICKR_USER_ID;

	const page = url.searchParams.get('page') || 1;
	const tags = url.searchParams.get('tags') || '';

	const endpoint = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1&extras=description,date_taken,url_m,url_l,tags&page=${page}&per_page=500`;
	const tagFilter = tags ? `&tags=${tags}` : '';

	const response = await fetch(endpoint + tagFilter);
	const data = await response.json();

	return new Response(JSON.stringify(data.photos), { status: 200 });
}
