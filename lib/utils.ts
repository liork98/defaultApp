import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ISRAEL_TZ = 'Asia/Jerusalem'

/**
 * Returns today's date in Israel as a "YYYY-MM-DD" string
 */
export function getIsraelTodayStr() {
  return formatInTimeZone(new Date(), ISRAEL_TZ, 'yyyy-MM-dd')
}

/**
 * Formats any Date object to "YYYY-MM-DD" string in Israel timezone
 */
export function formatIsraelDay(date: Date) {
  return formatInTimeZone(date, ISRAEL_TZ, 'yyyy-MM-dd')
}

/**
 * Parses a "YYYY-MM-DD" string back into a Date object at 12:00 Israel time
 * This prevents the date from shifting when used in UI components like calendars
 */
export function parseIsraelDay(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0)
  return date
}
