<script lang="ts">
	import { writable } from 'svelte/store';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import type { PageProps } from '../../.svelte-kit/types/src/routes/$types';
	import Modal from '../components/Modal.svelte';

	let { data }: PageProps = $props();
	const { initialPhotos, tags } = data;

	const photos = writable(initialPhotos);
	const selectedTag = writable('');
	const isLoading = writable(false);
	const selectedPhoto = writable<null | { url: string; title: string }>(null);

	async function fetchPhotosByTag(tag: string) {
		isLoading.set(true);

		tag
			? photos.set(initialPhotos.filter((photo) => photo.tags.includes(tag)))
			: photos.set(initialPhotos);
		isLoading.set(false);
	}

	// Trigger refetch when `selectedTag` changes
	selectedTag.subscribe((tag) => {
		fetchPhotosByTag(tag);
	});

	function handleSelectChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedTag.set(target?.value || '');
	}

	function shufflePhotos() {
		const array = $photos;
		let currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		photos.set(array);
	}

	function openModal(photo) {
		selectedPhoto.set(photo);
	}

	function closeModal() {
		selectedPhoto.set(null);
	}
</script>

<div class="flex min-h-screen flex-col items-center bg-black text-white">
	<a
		href="https://www.flickr.com/photos/gravelfeet/"
		rel="noopener noreferrer"
		class="absolute top-4 right-4"
	>
			<img src="/flickr.png" alt="Flickr" class="h-8 w-auto" />
	</a>
	<!-- Dropdown for Tags -->
	<div class="filters mb-8 mt-5 flex flex-col items-center gap-3 sm:flex-row">
		<label for="tag-dropdown" class="font-semibold text-white">
			Filter by Tag:
		</label>
		<select
			id="tag-dropdown"
			class="rounded bg-gray-800 px-4 py-2 text-white"
			onchange={handleSelectChange}
		>
			<option value="">All</option>
			{#each tags as tag}
				<option value={tag.tag}>{tag.tag} ({tag.count})</option>
			{/each}
		</select>
		<button class="rounded-md bg-blue-500 p-2">Shuffle</button>
	</div>

	<!-- Conditional Loading Spinner -->
	{#if $isLoading}
		<LoadingSpinner />
	{:else}
		<!-- Masonry Layout -->
		<div class="mx-auto w-full sm:max-w-3xl xl:max-w-5xl">
			<div class="columns-3 gap-4 md:columns-3 xl:columns-4">
				{#each $photos as photo}
					<div class="mb-4 break-inside-avoid">
						<div
							role="button"
							tabindex="0"
							aria-label="Open photo modal"
							class="cursor-pointer"
							onclick={() => openModal(photo)}
							onkeydown={(e) => e.key === 'Enter' && openModal(photo)}
						>
							<img
								src={photo.url_m}
								alt={photo.title}
								class="h-auto w-full rounded-lg object-cover shadow"
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if $selectedPhoto}
	<Modal photo={$selectedPhoto} {closeModal} />
{/if}
