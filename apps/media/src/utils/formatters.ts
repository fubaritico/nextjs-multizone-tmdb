/**
 * Format runtime in minutes to hours and minutes.
 *
 * @param minutes - Runtime in minutes.
 * @returns Formatted string (e.g., "2h 30m").
 */
export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours)}h ${String(mins)}m`
}
