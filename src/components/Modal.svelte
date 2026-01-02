<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';

	let { photo, closeModal, onNext, onPrev } = $props<{
		photo: {
			title?: string;
			description?: { _content?: string };
			tags?: string;
			datetaken?: string;
			url_o?: string;
		};
		closeModal: () => void;
		onNext?: () => void;
		onPrev?: () => void;
	}>();

	let showInfoBox = $state(false);
	let isImageLoading = $state(true);

	const photoContent = $derived({
		title: photo.title,
		description: photo.description?._content,
		tags: photo.tags,
		date: photo.datetaken ? photo.datetaken.split(' ')[0] : ''
	});

	$effect(() => {
		photo;
		showInfoBox = false;
		isImageLoading = true;
	});

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeModal();
			}
			if (e.key === 'ArrowRight' && onNext) {
				onNext();
			}
			if (e.key === 'ArrowLeft' && onPrev) {
				onPrev();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	const toggleInfoBox = () => {
		showInfoBox = !showInfoBox;
	};
</script>

<div class="modal" role="dialog" aria-modal="true" aria-label={photo.title} onclick={closeModal}>
	<div class="modal-content" role="document" onclick={(e) => e.stopPropagation()}>
		<button class="close-button" onclick={closeModal}>X</button>
		{#if onPrev}
			<button class="nav-button nav-left" onclick={onPrev} aria-label="Previous photo">←</button>
		{/if}
		{#if onNext}
			<button class="nav-button nav-right" onclick={onNext} aria-label="Next photo">→</button>
		{/if}
		<!-- Display the photo -->
		{#if isImageLoading}
			<div class="image-loading">
				<LoadingSpinner />
			</div>
		{/if}
		<img
			src={photo.url_o}
			alt={photo.title}
			onload={() => (isImageLoading = false)}
			onerror={() => (isImageLoading = false)}
		/>

		<!-- Small preview info in the corner -->
		<div class="info-preview" onclick={toggleInfoBox}>ℹ️ Info</div>

		<!-- Full info box -->
		{#if showInfoBox}
			<div class="info-box">
				<button class="info-close" aria-label="Close info" onclick={toggleInfoBox}>x</button>
				{#if photoContent.title}
					<h3>{photoContent.title}</h3>
				{/if}
				{#if photoContent.description}
					<p>Description: {photoContent.description}</p>
				{/if}
				{#if photoContent.tags}
					<p>Tags: {photoContent.tags}</p>
				{/if}
				<p>Date Taken: {photoContent.date}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		z-index: 10;
	}

	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.5);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 999px;
		cursor: pointer;
		font-size: 1.25rem;
		z-index: 10;
	}

	.nav-left {
		left: 20px;
	}

	.nav-right {
		right: 20px;
	}

	.nav-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.close-button:hover {
		color: red;
	}
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		position: relative;
		width: 90%;
		height: 90%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: black;
		border-radius: 10px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.modal-content img {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 10px;
	}

	.image-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.35);
		z-index: 9;
	}

	.info-preview {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 5px 10px;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
	}

	.info-box {
		position: absolute;
		bottom: 10px;
		left: 10px;
		background-color: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 15px;
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
		border: white 1px solid;
		min-width: 200px;
	}

	.info-close {
		position: absolute;
		top: 6px;
		right: 6px;
		background: none;
		border: none;
		color: white;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.info-close:hover {
		color: red;
	}

	.info-preview:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
