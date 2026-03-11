const SECONDS_PER_DAY = 86_400
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60
/* eslint-disable sonarjs/slow-regex -- simple \d+ before literal char, no backtracking risk */
const DAYS_PATTERN = /(\d+)D/u
const HOURS_PATTERN = /(\d+)H/u
const MINUTES_PATTERN = /(\d+)M/u
const SECONDS_PATTERN = /(\d+)S/u
/* eslint-enable sonarjs/slow-regex */
const PT_PREFIX = 'PT'
const P_PREFIX = 'P'
const RADIX = 10

function extract_unit(source: string, pattern: RegExp): number {
	const raw = pattern.exec(source)?.[1] ?? '0'
	return Number.parseInt(raw, RADIX)
}

function is_valid_iso_duration(iso_string: string): boolean {
	return iso_string.startsWith(PT_PREFIX) || iso_string.startsWith(P_PREFIX)
}

function to_seconds(iso_string: string): number | undefined {
	if (!is_valid_iso_duration(iso_string)) return undefined

	const days = extract_unit(iso_string, DAYS_PATTERN)
	const hours = extract_unit(iso_string, HOURS_PATTERN)
	const minutes = extract_unit(iso_string, MINUTES_PATTERN)
	const seconds = extract_unit(iso_string, SECONDS_PATTERN)

	return days * SECONDS_PER_DAY + hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds
}

const iso_duration = {
	to_seconds,
}

export { iso_duration }
