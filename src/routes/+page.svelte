<script lang="ts">
	import { writable, get } from 'svelte/store';
	import { onMount } from 'svelte';

	const photos = writable([]);
	const tags = writable([]);
	const selectedTag = writable('');
	const page = writable(1);
	const isLoading = writable(false);

	const base = import.meta.env.VITE_PUBLIC_BASE_URL || 'http://localhost:5173';

	async function fetchPhotos(reset = false) {
		isLoading.set(true);

		// Reset page and photos if reset is true
		if (reset) {
			console.log('reset');
			page.set(1); // Reset page to 1
			photos.set([]); // Clear previous photos
		}

		try {
			const currentPage = get(page); // Access current page value
			const currentTag = get(selectedTag); // Access current selected tag
			console.log(currentTag);
			console.log(`calling with page: ${currentPage}`);
			const res = await fetch(`${base}/api/photos?page=${currentPage}&tags=${currentTag}`);
			const data = await res.json();

			if (data?.photo?.length > 0) {
				photos.update((prev) => [...prev, ...data.photo]); // Append new photos to the list
				page.update((p) => p + 1); // Increment the page for the next fetch
			}
		} catch (error) {
			console.error('Error fetching photos:', error);
		} finally {
			isLoading.set(false);
		}
	}

	async function fetchTags() {
		const res = await fetch(`${base}/api/tags`);
		const data = await res.json();

		tags.set(data);
	}

	// Ensure fetch happens only on the client
	onMount(() => {
		fetchTags();
	});

	// Reactively refetch photos when the page changes, but prevent duplicate fetch on page 1
	$: if ($page > 1) {
		const currentPage = get(page); // Get the current page
		const currentTag = get(selectedTag); // Get the current selected tag
		console.log(`Reactive fetch for page: ${currentPage}`);
		fetchPhotos();
	}

	// Reactively refetch photos when the selected tag changes
	$: if ($selectedTag !== undefined) {
		console.log('Tag changed, resetting photos...');
		fetchPhotos(true); // Fetch new photos for the selected tag
	}
</script>

<div class="flex min-h-screen flex-col items-center bg-black text-white">
	<!-- Dropdown for Tags -->
	<div class="filters mb-8 mt-5">
		<label for="tag-dropdown" class="mb-2 font-semibold text-white">Filter by Tag:</label>
		<select
			id="tag-dropdown"
			class="rounded bg-gray-800 px-4 py-2 text-white"
			on:change={(e) => selectedTag.set(e.target.value)}
		>
			<option value="">All</option>
			{#each $tags as tag}
				<option value={tag.tag}>{tag.tag} ({tag.count})</option>
			{/each}
		</select>
	</div>

	<!-- Centered Masonry Layout -->
	<div class="mx-auto w-full sm:max-w-3xl xl:max-w-5xl">
		<div class="columns-1 gap-4 sm:columns-2 md:columns-3 xl:columns-4">
			{#each $photos as photo}
				<div class="mb-4 break-inside-avoid">
					<img
						src={photo.url_m}
						alt={photo.title}
						class="h-auto w-full rounded-lg object-cover shadow"
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- Loading State -->
	{#if $isLoading}
		<p class="mt-8 text-center text-gray-400">Loading more photos...</p>
	{/if}
</div>
