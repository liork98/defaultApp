import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ISRAEL_TZ = 'Asia/Jerusalem'

export function getIsraelToday() {
  return new Date(new Intl.DateTimeFormat('en-US', { timeZone: ISRAEL_TZ }).format(new Date()))
}

export function formatIsraelDay(date: Date) {
  return formatInTimeZone(date, ISRAEL_TZ, 'yyyy-MM-dd')
}
