import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHmac, randomBytes } from 'crypto';
import { series } from '$lib/series';

function encodeRfc3986(value: string) {
	return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildOauthSignature({
	method,
	baseUrl,
	params,
	consumerSecret,
	tokenSecret
}: {
	method: string;
	baseUrl: string;
	params: URLSearchParams;
	consumerSecret: string;
	tokenSecret: string;
}) {
	const sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
	const paramString = sortedParams
		.map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
		.join('&');
	const baseString = [
		method.toUpperCase(),
		encodeRfc3986(baseUrl),
		encodeRfc3986(paramString)
	].join('&');
	const signingKey = `${encodeRfc3986(consumerSecret)}&${encodeRfc3986(tokenSecret)}`;
	return createHmac('sha1', signingKey).update(baseString).digest('base64');
}

export async function GET({ params }) {
	const entry = series.find((item) => item.slug === params.slug);

	if (!entry) {
		return json({ error: 'Series not found' }, { status: 404 });
	}

	if (!entry.photosetId) {
		return json({ error: 'Series photoset ID is not configured' }, { status: 400 });
	}

	const FLICKR_API_KEY = env.FLICKR_API_KEY;
	const FLICKR_USER_ID = env.FLICKR_USER_ID;
	const FLICKR_API_SECRET = env.FLICKR_API_SECRET;
	const FLICKR_OAUTH_TOKEN = env.FLICKR_OAUTH_TOKEN;
	const FLICKR_OAUTH_TOKEN_SECRET = env.FLICKR_OAUTH_TOKEN_SECRET;

	if (!FLICKR_API_KEY || !FLICKR_USER_ID) {
		return json({ error: 'Missing Flickr API configuration' }, { status: 500 });
	}

	const paramsForRequest = new URLSearchParams({
		method: 'flickr.photosets.getPhotos',
		photoset_id: entry.photosetId,
		user_id: FLICKR_USER_ID,
		format: 'json',
		nojsoncallback: '1',
		extras: 'description,date_taken,url_o,url_l,url_m,tags'
	});

	if (FLICKR_OAUTH_TOKEN && FLICKR_OAUTH_TOKEN_SECRET && FLICKR_API_SECRET) {
		paramsForRequest.set('oauth_consumer_key', FLICKR_API_KEY);
		paramsForRequest.set('oauth_token', FLICKR_OAUTH_TOKEN);
		paramsForRequest.set('oauth_signature_method', 'HMAC-SHA1');
		paramsForRequest.set('oauth_timestamp', Math.floor(Date.now() / 1000).toString());
		paramsForRequest.set('oauth_nonce', randomBytes(8).toString('hex'));
		paramsForRequest.set('oauth_version', '1.0');

		const signature = buildOauthSignature({
			method: 'GET',
			baseUrl: 'https://www.flickr.com/services/rest/',
			params: paramsForRequest,
			consumerSecret: FLICKR_API_SECRET,
			tokenSecret: FLICKR_OAUTH_TOKEN_SECRET
		});

		paramsForRequest.set('oauth_signature', signature);
	} else {
		paramsForRequest.set('api_key', FLICKR_API_KEY);
	}

	const endpoint = `https://www.flickr.com/services/rest/?${paramsForRequest.toString()}`;

	try {
		const response = await fetch(endpoint);
		const data = await response.json();

		if (data?.stat === 'fail') {
			return json({ error: data.message || 'Flickr request failed' }, { status: 400 });
		}

		if (!response.ok || !data?.photoset?.photo) {
			return json({ error: 'Failed to fetch series photos' }, { status: 502 });
		}

		const photos = data.photoset.photo.map((photo) => ({
			...photo,
			displayUrl: photo.url_o || photo.url_l || photo.url_m
		}));

		return json({ photos });
	} catch (error) {
		console.error('Error fetching series photos:', error);
		return json({ error: 'Failed to fetch series photos' }, { status: 500 });
	}
}
