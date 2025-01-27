<script lang="ts">
	import { onMount } from 'svelte';

	export let photo; // Receive the photo to display
	export let closeModal; // Function to close the modal

	onMount(() => {
		const handleKeydown = (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

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
    .modal img {
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    }
</style>

<div class="modal" on:click={closeModal}>
	<img src={photo.url} alt={photo.title} />
</div>
