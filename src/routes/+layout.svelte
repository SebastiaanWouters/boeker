<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
>

{@render children()}
