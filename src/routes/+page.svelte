<script lang="ts">
	import { books, downloadFileFromID } from '$lib';
	import { onDestroy, onMount } from 'svelte';

	let list: books.SearchResult[] = $state([]);
	let query = $state<string | null>(null);
	let isLoading = $state<boolean[]>(Array(100).fill(false));
	let dom_articles: Element[] = $state([]);
	let isSearching = $state(false);

	async function download(id: string, type: 'book' | 'article', title: string, index: number) {
		isLoading[index] = true;
		await downloadFileFromID(id, type, title);
		isLoading[index] = false;
	}

	let resizeObserver: ResizeObserver;

	// When the component is mounted, start watching the elements
	onMount(() => {
		resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				// Find the index of the changed article element
				const index = parseInt(entry.target.getAttribute('data-id') ?? '0');
				if (index !== -1) {
					// Update the height of the article
					const image = document.querySelector(`div[data-id="${index}"]`) as HTMLImageElement;
					if (image) {
						// Set the image's height to match the article's height
						image.style.height = `${entry.contentRect.height + 36}px`;
					}
				}
			});
		});
	});

	// Cleanup the observer when the component is destroyed
	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
	});

	async function search(query: string) {
		if (isSearching) return;
		isSearching = true;
		const searchType = document.querySelector('input[name="content-type"]:checked')?.id || 'book';
		const items = await books.search(query, {
			type: searchType === 'book' ? 'book' : 'article',
			amount: searchType === 'article' ? 3 : undefined
		});
		list = items;
		isSearching = false;
		setTimeout(() => {
			const articles = document.querySelectorAll('article');
			articles.forEach((article, i) => {
				const image = document.querySelector(`div[data-id="${i}"]`) as HTMLImageElement;
				if (image) {
					const articleHeight = article.clientHeight;
					// Set the image's height to match the article's height
					image.style.height = `${articleHeight}px`;
				}
			});
			articles.forEach((article) => {
				resizeObserver.observe(article);
			});
		}, 5);
	}
</script>

<main class="container" style="padding-top: 1.5rem;">
	<form
		style="margin-bottom: 0.75rem; max-width: 100%;"
		onsubmit={(e) => {
			e.preventDefault();
			search(query!);
		}}
	>
		<fieldset role="search">
			<input name="search" type="search" bind:value={query} placeholder="Search" />
			<input type="submit" value="Search" />
		</fieldset>
		<div style="padding-left: 0.25rem;" class="grid">
			<fieldset>
				<legend>Content type:</legend>
				<input type="radio" id="book" name="content-type" checked />
				<label for="book">Book</label>
				<input type="radio" id="article" name="content-type" />
				<label for="paper">Research Paper</label>
			</fieldset>
		</div>
		{#if isSearching}
			<span style="margin-bottom: 1rem; display: inline-block; padding-left: 0.25rem;" aria-busy="true">Searching...</span>
		{/if}
		<div
			style="width: 100%; height: 0.07rem; padding-left: 0.25rem; background-color: var(--pico-muted-color); opacity: 0.6; border-radius: 8px;"
		></div>
	</form>
	<div style="max-width: 100%; padding-left: 0.25rem;">
		{#if list.length > 0}
			{#each list as item, i (item.md5)}
				<div style="display:flex; margin-bottom: 2rem; max-width: 100%;">
					{#if item.cover}
						<div
							id="img"
							data-id={i}
							style="flex: 1 0 140px; width: auto; height: 100%; overflow: hidden; border: 1px solid #33333322; border-radius: 0.25rem 0px 0px 0.25rem;"
						>
							<img
								src={item.cover}
								onerror={() => {
									(document.querySelector(`div[data-id="${i}"]>img`) as HTMLImageElement)!.src =
										'https://diybookcovers.com/wp-content/uploads/2023/08/thriller3a.jpg';
								}}
								alt="cover"
								style="object-fit: cover; min-height: 100%;"
							/>
						</div>
					{:else}
						<div
							id="img"
							data-id={i}
							style="flex: 1 0 140px; width: auto; height: 100%; overflow: hidden; border: 1px solid #33333322; border-radius: 0.25rem 0px 0px 0.25rem;"
						>
							<img
								src="https://diybookcovers.com/wp-content/uploads/2023/07/nonfiction12.jpg"
								alt="cover"
								style="object-fit: cover; min-height: 100%;"
							/>
						</div>
					{/if}
					<article
						bind:this={dom_articles[i]}
						data-id={i}
						style="flex: 99 1 0%; height: fit-content; margin-bottom: 0rem;"
					>
						{#if item.author}
							<header style="font-size: 0.9rem; color: var(--pico-contrast)">{item.author}</header>
						{/if}
						<div
							id="content"
							style="display:flex; justify-content: space-between; gap: 1rem; flex: 1 0 0%"
						>
							<h5 style="color: var(--pico-primary);">{item.title}</h5>
							<button
								aria-busy={isLoading[i] ? 'true' : 'false'}
								style="height: fit-content;"
								class="contrast outline"
								onclick={() =>
									download(
										item.doi ? item.doi : item.md5,
										item.doi ? 'article' : 'book',
										item.title,
										i
									)}>Download</button
							>
						</div>
						<footer style="font-size: 0.85rem; line-height: 1.25;" id="meta">{item.meta}</footer>
					</article>
				</div>
			{/each}
		{:else if !isSearching}
			<p class="text-white">No results found</p>
		{/if}
	</div>
</main>

<style>
	#content {
		@media (max-width: 600px) {
			flex-direction: column;
			gap: 0rem !important;
		}
	}
	#img {
		@media (max-width: 600px) {
			flex: 1 0 80px !important;
		}
	}
	#meta {
		@media (max-width: 600px) {
			display: none;
		}
	}
</style>
