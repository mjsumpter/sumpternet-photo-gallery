import { FLICKR_API_KEY, FLICKR_API_SECRET, FLICKR_USER_ID } from '$env/static/private';

export async function GET({ url }) {
	const page = url.searchParams.get('page') || 1;
	const tags = url.searchParams.get('tags') || '';

	const endpoint = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&format=json&nojsoncallback=1&extras=date_taken,url_m, url_l,tags&page=${page}&per_page=20`;
	const tagFilter = tags ? `&tags=${tags}` : '';

	const response = await fetch(endpoint + tagFilter);
	const data = await response.json();

	return new Response(JSON.stringify(data.photos), { status: 200 });
}
