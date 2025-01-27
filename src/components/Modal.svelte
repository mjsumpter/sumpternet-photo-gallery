<script lang="ts">
	import { onMount } from 'svelte';

	export let photo;
	export let closeModal;

	console.log({ photo });
	const photoContent = {
		title: photo.title,
		description: photo.description?._content,
		tags: photo.tags,
		date: photo.datetaken.split(' ')[0]
	};

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="modal" role="dialog" aria-modal="true" aria-label={photo.title} onclick={closeModal}>
	<div class="modal-content" role="document">
		<!-- Display the photo -->
		<img src={photo.url_o} alt={photo.title} />

		<!-- Conditionally display the info box -->
		<div class="info-box">
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
	</div>
</div>

<style>
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
		width: 90%; /* Ensure the modal width adapts to the viewport */
		height: 90%; /* Ensure the modal height adapts to the viewport */
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
		max-width: 100%; /* Image will not exceed modal width */
		max-height: 100%; /* Image will not exceed modal height */
		object-fit: contain; /* Ensure image scales proportionally */
		border-radius: 10px;
	}

	.info-box {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		border: white 1px solid;
	}

	.modal-content:hover .info-box {
		opacity: 1;
	}
</style>
