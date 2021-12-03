export function filterEventsByType(rawData: string | null, eventType: string) {
  if (!rawData) return [];

  const filteredEvents = rawData
    .split(/\r?\n/)
    .slice(0, -2)
    .map((eventString) => JSON.parse(eventString))
    .filter((object) => object.type === eventType);

  return filteredEvents;
}
