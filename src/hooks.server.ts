import type { Handle } from '@sveltejs/kit'
import { getTextDirection } from '$lib/paraglide/runtime'
import { paraglideMiddleware } from '$lib/paraglide/server'

export const handle: Handle = async ({ event, resolve }) =>
	await paraglideMiddleware(event.request, async ({ request, locale }) => {
		event.request = request

		return await resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale)),
		})
	})
