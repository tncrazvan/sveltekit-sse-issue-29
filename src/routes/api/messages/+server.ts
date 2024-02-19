// /routes/api/messages/server.ts

import { events } from 'sveltekit-sse';

const updatedMessages = [] as Array<string>;

type Callback = (notification: { payload: string }) => void;

const clientUpdate = {
	callbacks: [] as Array<Callback>,
	on(event: string, callback: Callback) {
		console.log({ event });
		this.callbacks.push(callback);
	},
	query(payload: string): Promise<number> {
		const callbacks = this.callbacks;
		return new Promise(function start(resolve) {
			setTimeout(function run() {
				for (const callback of callbacks) {
					callback({ payload });
				}
				resolve(callbacks.length);
			}, 1000);
		});
	}
};
// await clientUpdate.connect();
// await clientUpdate.query('LISTEN messages_update');

clientUpdate.on('notification', (notification) => {
	console.log('New message:', notification);
	if (notification.payload) {
		updatedMessages.push(notification.payload);
	}
});
const authedUser = true;
// export function POST({ request, locals }) {
export function POST({ request }) {
	return events({
		request,
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		timeout: 90 * 1000,
		async start({ emit, lock }) {
			// if (!locals.authedUser) {
			if (!authedUser) {
				lock.set(false);
				return function cancel() {
					console.log('Not authorized.');
				};
			}

			const updateInterval = setInterval(async () => {
				if (updatedMessages.length > 0) {
					console.log('Sending new messages...');
					updatedMessages.forEach((message, index) => {
						const { error } = emit('updated', message);
						if (error) {
							console.error('There is an error while sending messages - ', error);
							return;
						}

						updatedMessages.splice(index, 1);
					});
				}

				await clientUpdate.query('SELECT TRUE');
			}, 1000);

			const unsubscribe = lock.subscribe(async function run($lock) {
				if ($lock) {
					return;
				}
				console.log('Done');
				clearInterval(updateInterval);
				unsubscribe();
			});

			return function cancel() {
				console.log('Canceled.');
			};
		}
	});
}
