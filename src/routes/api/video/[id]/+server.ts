/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- JSON from external API */
import { json } from '@sveltejs/kit'
import type { VideoMetadata } from '$lib/api/video-api'
import { youtube, YOUTUBE_DATA_API_URL, YOUTUBE_OEMBED_URL } from '$lib/constants/youtube'
import { iso_duration } from '$lib/utils/iso-duration'
import type { RequestHandler } from './$types'

const STATUS_BAD_REQUEST = 400

interface OembedResponse {
	title?: string
}

/* eslint-disable @typescript-eslint/naming-convention -- YouTube API response uses camelCase */
interface DataApiError {
	error?: {
		code?: number
		message?: string
	}
}

interface DataApiResponse {
	items?: ReadonlyArray<{
		contentDetails?: { duration?: string }
	}>
}
/* eslint-enable @typescript-eslint/naming-convention */

function has_api_error(data: unknown): data is DataApiError {
	return (
		typeof data === 'object' &&
		data !== null &&
		'error' in data &&
		typeof (data as DataApiError).error === 'object'
	)
}

function throw_if_api_error(data: DataApiResponse & DataApiError): void {
	if (!has_api_error(data)) return

	const message = data.error?.message ?? 'Unknown YouTube API error'
	throw new Error(`YouTube API: ${message}`)
}

async function fetch_title(video_id: string): Promise<string | undefined> {
	const url = `${YOUTUBE_OEMBED_URL}?url=${youtube.watch_url(video_id)}&format=json`
	const response = await fetch(url)
	if (!response.ok) return undefined

	const data = (await response.json()) as OembedResponse
	return data.title
}

function extract_duration_string(data: DataApiResponse): string | undefined {
	return data.items?.[0]?.contentDetails?.duration
}

async function fetch_duration(video_id: string, api_key: string): Promise<number | undefined> {
	const url = `${YOUTUBE_DATA_API_URL}?id=${video_id}&part=contentDetails&key=${api_key}`
	const response = await fetch(url)
	const data = (await response.json()) as DataApiResponse & DataApiError

	throw_if_api_error(data)
	if (!response.ok) return undefined

	const raw = extract_duration_string(data)

	return raw ? iso_duration.to_seconds(raw) : undefined
}

function get_api_key(platform: App.Platform | undefined): string {
	/* eslint-disable @typescript-eslint/naming-convention -- Cloudflare env binding uses UPPER_CASE */
	const key = (platform as { env?: { YOUTUBE_API_KEY?: string } } | undefined)?.env?.YOUTUBE_API_KEY
	/* eslint-enable @typescript-eslint/naming-convention */

	if (!key) throw new Error('YOUTUBE_API_KEY is not configured')
	return key
}

export const GET: RequestHandler = async ({ params, platform }) => {
	const video_id = params.id

	if (!video_id) {
		return json({ error: 'Missing video id' }, { status: STATUS_BAD_REQUEST })
	}

	const [title, duration_seconds] = await Promise.all([
		fetch_title(video_id),
		fetch_duration(video_id, get_api_key(platform)),
	])

	const metadata: VideoMetadata = {
		title: title ?? '',
		duration_seconds,
	}
	return json(metadata)
}
