const YOUTUBE_BASE = 'https://www.youtube.com'

const YOUTUBE_OEMBED_URL = `${YOUTUBE_BASE}/oembed`
const YOUTUBE_IFRAME_API = `${YOUTUBE_BASE}/iframe_api`
const YOUTUBE_THUMBNAIL_BASE_URL = 'https://img.youtube.com/vi'

function watch_url(video_id: string): string {
	return `${YOUTUBE_BASE}/watch?v=${video_id}`
}

const youtube = {
	watch_url,
}

const YOUTUBE_DATA_API_URL = 'https://www.googleapis.com/youtube/v3/videos'

export {
	YOUTUBE_DATA_API_URL,
	YOUTUBE_OEMBED_URL,
	YOUTUBE_IFRAME_API,
	YOUTUBE_THUMBNAIL_BASE_URL,
	youtube,
}
