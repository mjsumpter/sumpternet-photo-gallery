<script lang="ts">
	import { writable } from 'svelte/store';
	import LoadingSpinner from '../components/LoadingSpinner.svelte';
	import type { PageProps } from '../../.svelte-kit/types/src/routes/$types';
	import Modal from '../components/Modal.svelte';

	let { data }: PageProps = $props();
	const { initialPhotos, tags, series } = data;

	const photos = writable(initialPhotos);
	const selectedTag = writable('showcase');
	const isLoading = writable(false);
	const selectedPhoto = writable<null | { url: string; title: string }>(null);
	const selectedIndex = writable<number | null>(null);

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
		const index = $photos.findIndex((item) => item.id === photo.id);
		selectedIndex.set(index >= 0 ? index : null);
	}

	function closeModal() {
		selectedPhoto.set(null);
		selectedIndex.set(null);
	}

	function showPhotoAt(index: number) {
		const list = $photos;
		if (!list.length) return;
		const wrappedIndex = (index + list.length) % list.length;
		selectedIndex.set(wrappedIndex);
		selectedPhoto.set(list[wrappedIndex]);
	}

	function showNextPhoto() {
		if ($selectedIndex === null) return;
		showPhotoAt($selectedIndex + 1);
	}

	function showPreviousPhoto() {
		if ($selectedIndex === null) return;
		showPhotoAt($selectedIndex - 1);
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
	<section class="mx-auto w-full max-w-5xl px-4 pb-6 pt-16">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="text-xs uppercase tracking-[0.3em] text-white/60">Series</p>
				<h2 class="text-2xl font-semibold">Photographic Sequences</h2>
			</div>
			<p class="max-w-md text-sm text-white/60">
				Full-page slideshows for narrative work and long-form projects.
			</p>
		</div>
		{#if series.length > 0}
			<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each series as item}
					<a
						href={`/series/${item.slug}`}
						class="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30"
					>
						{#if item.coverUrl}
							<img
								src={item.coverUrl}
								alt={item.title}
								class="h-44 w-full object-cover"
							/>
						{:else}
							<div class="flex h-44 items-center justify-center bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40">
								Add cover image
							</div>
						{/if}
						<div class="space-y-2 p-4">
							<h3 class="text-lg font-semibold group-hover:text-white">{item.title}</h3>
							<p class="text-sm text-white/60">{item.description}</p>
							<p class="text-xs uppercase tracking-[0.2em] text-white/50">View sequence</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="mt-6 text-sm text-white/60">No series yet.</p>
		{/if}
	</section>
	<!-- Dropdown for Tags -->
	<div class="filters mb-8 mt-5 flex flex-col items-center gap-3 sm:flex-row">
		<label for="tag-dropdown" class="font-semibold text-white">
			Filter by Tag:
		</label>
		<select
			id="tag-dropdown"
			class="rounded bg-gray-800 px-4 py-2 text-white"
			bind:value={$selectedTag}
			onchange={handleSelectChange}
		>
			<option value="">All</option>
			{#each tags as tag}
				<option value={tag.tag}>{tag.tag} ({tag.count})</option>
			{/each}
		</select>
		<button class="rounded-md bg-blue-500 p-2" onclick={shufflePhotos}>Shuffle</button>
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
	<Modal photo={$selectedPhoto} {closeModal} onNext={showNextPhoto} onPrev={showPreviousPhoto} />
{/if}
