<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="layout">
	<main class="main-content">
		{@render children()}
	</main>
	<footer class="footer">
		<p>
			<a href="https://matthewsumpter.org" target="_blank" rel="noopener noreferrer"
				>matthewsumpter.org</a
			>
		</p>
		<p>
			Built with <a href="https://kit.svelte.dev" target="_blank" rel="noopener noreferrer"
				>SvelteKit</a
			>
			and
			<a href="https://www.flickr.com/services/api/" target="_blank" rel="noopener noreferrer"
				>Flickr API</a
			>
		</p>
	</footer>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content {
		flex: 1; /* Pushes the footer to the bottom when content is minimal */
	}

	.footer {
		background-color: rgba(0, 0, 0, 0.9);
		color: white;
		text-align: center;
		padding: 10px 0;
		font-size: 0.875rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.footer a {
		color: #1e90ff;
		text-decoration: none;
	}

	.footer a:hover {
		text-decoration: underline;
	}
</style>
