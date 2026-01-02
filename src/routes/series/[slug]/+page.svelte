<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { PageProps } from '../../../../.svelte-kit/types/src/routes/$types';

	let { data }: PageProps = $props();
	const { series, photos } = data;

	let currentIndex = $state(0);
	let isPlaying = $state(false);
	let showInfo = $state(false);
	let intervalId: number | null = null;

	const currentPhoto = $derived(photos[currentIndex]);
	const totalPhotos = $derived(photos.length);
	const hasPhotos = $derived(totalPhotos > 0);

	const next = () => {
		if (!hasPhotos) return;
		currentIndex = (currentIndex + 1) % totalPhotos;
	};

	const previous = () => {
		if (!hasPhotos) return;
		currentIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;
	};

	const stopPlaying = () => {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
		isPlaying = false;
	};

	const startPlaying = () => {
		if (intervalId !== null || !hasPhotos) return;
		isPlaying = true;
		intervalId = window.setInterval(() => {
			next();
		}, 4000);
	};

	const togglePlay = () => {
		if (isPlaying) {
			stopPlaying();
		} else {
			startPlaying();
		}
	};

	const toggleInfo = () => {
		showInfo = !showInfo;
	};

	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowRight') {
				next();
			}
			if (event.key === 'ArrowLeft') {
				previous();
			}
			if (event.code === 'Space') {
				event.preventDefault();
				togglePlay();
			}
			if (event.key === 'i' || event.key === 'I') {
				toggleInfo();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		stopPlaying();
	});
</script>

<div class="relative min-h-screen bg-black text-white">
	<div class="absolute left-0 top-0 z-10 w-full">
		<div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
			<a href="/" class="text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white">Home</a>
			<div class="text-center">
				<p class="text-xs uppercase tracking-[0.3em] text-white/60">Series</p>
				<h1 class="text-lg font-semibold sm:text-xl">{series.title}</h1>
			</div>
			<div class="flex items-center gap-3 text-xs text-white/70">
				<span>{currentIndex + 1} / {totalPhotos}</span>
				<button class="rounded-full border border-white/30 px-3 py-1 hover:border-white" onclick={toggleInfo}>
					{showInfo ? 'Hide Info' : 'Show Info'}
				</button>
			</div>
		</div>
	</div>

	{#if hasPhotos}
		<div class="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-24">
			<button
				class="absolute left-0 top-0 h-full w-1/2 cursor-w-resize"
				onclick={previous}
				aria-label="Previous image"
			></button>
			<button
				class="absolute right-0 top-0 h-full w-1/2 cursor-e-resize"
				onclick={next}
				aria-label="Next image"
			></button>

			<img
				src={currentPhoto.displayUrl}
				alt={currentPhoto.title}
				class="max-h-[75vh] w-auto max-w-full object-contain"
			/>
		</div>

		<div class="absolute bottom-0 left-0 w-full">
			<div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm text-white/70">
				<p class="max-w-xl text-balance text-white/60">{series.description}</p>
				<div class="flex items-center gap-3">
					<button class="rounded-full border border-white/30 px-4 py-2 hover:border-white" onclick={previous}>
						Prev
					</button>
					<button class="rounded-full border border-white/30 px-4 py-2 hover:border-white" onclick={togglePlay}>
						{isPlaying ? 'Pause' : 'Play'}
					</button>
					<button class="rounded-full border border-white/30 px-4 py-2 hover:border-white" onclick={next}>
						Next
					</button>
				</div>
			</div>
		</div>

		{#if showInfo}
			<div class="absolute right-4 top-24 z-10 max-w-xs rounded-lg border border-white/20 bg-black/80 p-4 text-xs text-white/70">
				{#if currentPhoto.title}
					<h2 class="text-sm font-semibold text-white">{currentPhoto.title}</h2>
				{/if}
				{#if currentPhoto.description?._content}
					<p class="mt-2">{currentPhoto.description._content}</p>
				{/if}
				{#if currentPhoto.datetaken}
					<p class="mt-2">Captured: {currentPhoto.datetaken.split(' ')[0]}</p>
				{/if}
				{#if currentPhoto.tags}
					<p class="mt-2">Tags: {currentPhoto.tags}</p>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="flex min-h-screen items-center justify-center">
			<p class="text-white/60">No photos found for this series.</p>
		</div>
	{/if}
</div>
