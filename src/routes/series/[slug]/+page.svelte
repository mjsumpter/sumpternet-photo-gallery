<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '../../../components/LoadingSpinner.svelte';
	import type { PageProps } from '../../../../.svelte-kit/types/src/routes/$types';

	let { data }: PageProps = $props();
	const { series, photos } = data;

	let currentIndex = $state(0);
	let showInfo = $state(false);
	let isImageLoading = $state(true);
	let swipeStartX = $state(0);
	let swipeStartY = $state(0);

	const currentPhoto = $derived(photos[currentIndex]);
	const totalPhotos = $derived(photos.length);
	const hasPhotos = $derived(totalPhotos > 0);
	const isFirst = $derived(currentIndex === 0);
	const isLast = $derived(currentIndex === totalPhotos - 1);
	const hasPrev = $derived(!isFirst && hasPhotos);
	const hasNext = $derived(!isLast && hasPhotos);

	const next = () => {
		if (!hasPhotos || isLast) return;
		isImageLoading = true;
		currentIndex = currentIndex + 1;
	};

	const previous = () => {
		if (!hasPhotos || isFirst) return;
		isImageLoading = true;
		currentIndex = currentIndex - 1;
	};


	const toggleInfo = () => {
		showInfo = !showInfo;
	};

	const preloadImage = (url?: string) => {
		if (!url || typeof window === 'undefined') return;
		const img = new Image();
		img.src = url;
	};

	$effect(() => {
		if (!hasPhotos) return;
		preloadImage(currentPhoto?.displayUrl);
		preloadImage(photos[currentIndex - 1]?.displayUrl);
		preloadImage(photos[currentIndex + 1]?.displayUrl);
	});

	const handleTouchStart = (event: TouchEvent) => {
		const touch = event.touches[0];
		if (!touch) return;
		swipeStartX = touch.clientX;
		swipeStartY = touch.clientY;
	};

	const handleTouchEnd = (event: TouchEvent) => {
		const touch = event.changedTouches[0];
		if (!touch) return;
		const deltaX = touch.clientX - swipeStartX;
		const deltaY = touch.clientY - swipeStartY;
		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);
		if (absX < 40 || absX < absY) return;
		if (deltaX < 0) {
			next();
		} else {
			previous();
		}
	};

	onMount(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowRight') {
				next();
			}
			if (event.key === 'ArrowLeft') {
				previous();
			}
			if (event.key === 'i' || event.key === 'I') {
				toggleInfo();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="relative min-h-screen bg-black text-white">
	<div class="absolute left-0 top-0 z-10 w-full">
		<div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
			<a href="/" class="text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white">Home</a>
			<div class="text-center">
				<p class="text-xs uppercase tracking-[0.3em] text-white/60">Series</p>
				<h1 class="text-lg font-semibold sm:text-xl">{series.title}</h1>
				{#if totalPhotos > 1}
					<div class="mt-2 flex items-center justify-center gap-2">
						{#each photos as _, index}
							<span
								class={`h-1.5 w-1.5 rounded-full transition ${
									index === currentIndex ? 'bg-white scale-150' : 'bg-white/25'
								}`}
							></span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="flex items-center gap-3 text-xs text-white/70">
				<button class="rounded-full border border-white/30 px-3 py-1 hover:border-white" onclick={toggleInfo}>
					{showInfo ? 'Hide Info' : 'Show Info'}
				</button>
			</div>
		</div>
	</div>

	{#if hasPhotos}
		<div
			class="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-0 md:pb-24"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			{#if hasPrev}
				<button
					class="absolute left-0 top-0 h-full w-1/2 cursor-w-resize"
					onclick={previous}
					aria-label="Previous image"
				></button>
				<div class="pointer-events-none absolute left-0 top-0 h-full w-1/6 bg-gradient-to-r from-black/40 to-transparent opacity-70"></div>
			{/if}
			{#if hasNext}
				<button
					class="absolute right-0 top-0 h-full w-1/2 cursor-e-resize"
					onclick={next}
					aria-label="Next image"
				></button>
				<div class="pointer-events-none absolute right-0 top-0 h-full w-1/6 bg-gradient-to-l from-black/40 to-transparent opacity-70"></div>
			{/if}

			{#if isImageLoading}
				<div class="absolute inset-0 flex items-center justify-center">
					<LoadingSpinner />
				</div>
			{/if}
			<img
				src={currentPhoto.displayUrl}
				alt={currentPhoto.title}
				class="max-h-[75vh] w-auto max-w-full object-contain transition-opacity duration-300"
				class:opacity-0={isImageLoading}
				class:opacity-100={!isImageLoading}
				onload={() => {
					isImageLoading = false;
				}}
			/>
		</div>

		<div class="static w-full -mt-2 md:mt-0 md:absolute md:bottom-0 md:left-0">
			<div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-2 text-sm text-white/70 md:py-4">
				<p class="max-w-xl text-balance text-white/60">{series.description}</p>
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
