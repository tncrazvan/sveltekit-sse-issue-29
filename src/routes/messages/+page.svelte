<!-- /routes/messages/+page.svelte -->
<script lang="ts">
	import { source } from 'sveltekit-sse';

	const IS_BROWSER = typeof document !== 'undefined';

	const connection = source('/api/messages', {
		beacon: 60 * 1000,
		options: {
			timeout: 60 * 1000,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		},
		close: (event) => {
			if (IS_BROWSER) {
				console.log('Connection closed', event.data);
				console.log('Reconnecting', event.error);
				event.connect();
			}
		},
		error: (event) => IS_BROWSER && console.error('Connection error', event.error)
	});

	const updatedMmessageString = connection.select('updated');

	// export let data: PageData;

	// let messages = data.messages;

	// $: {
	// 	if ($updatedMmessageString) {
	// 		const rawMmessage = JSON.parse($updatedMmessageString);
	// 		if (messages.find((t) => +t.id === +rawMmessage.id))
	// 			messages = messages.map((t) => (+t.id === +rawMmessage.id ? rawMmessage : t));
	// 		else messages.splice(0, 0, rawMmessage);
	// 	}
	// }
</script>

<h3>message string</h3>
<pre>{$updatedMmessageString}</pre>
