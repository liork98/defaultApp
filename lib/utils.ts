import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ISRAEL_TZ = 'Asia/Jerusalem'

/**
 * Returns today's date in Israel as a "YYYY-MM-DD" string.
 * This is the source of truth for the app.
 */
export function getIsraelTodayStr() {
  return formatInTimeZone(new Date(), ISRAEL_TZ, 'yyyy-MM-dd')
}

/**
 * Formats any Date object to a "YYYY-MM-DD" string in Israel timezone.
 */
export function formatIsraelDay(date: Date) {
  // Always use formatInTimeZone to ensure the output is correct for Israel,
  // regardless of where the server or client is.
  return formatInTimeZone(date, ISRAEL_TZ, 'yyyy-MM-dd')
}

/**
 * Parses a "YYYY-MM-DD" string into a Date object at 12:00:00 PM in the Israel timezone.
 * This Date object can then be safely used in UI components without shifting days,
 * because even if the local timezone is +/- 12 hours, it stays on the same day.
 */
export function parseIsraelDay(dateStr: string) {
  // Create a date string that represents noon in Jerusalem
  const jerusalemNoon = `${dateStr}T12:00:00`
  // Convert that specific Jerusalem time to a JS Date object
  return fromZonedTime(jerusalemNoon, ISRAEL_TZ)
}

/**
 * Converts a JS Date object to the beginning of the day (00:00:00) in Israel.
 */
export function startOfIsraelDay(date: Date) {
  const zoned = toZonedTime(date, ISRAEL_TZ)
  zoned.setHours(0, 0, 0, 0)
  return fromZonedTime(zoned, ISRAEL_TZ)
}
