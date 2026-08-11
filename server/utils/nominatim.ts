const contactEmail = (useRuntimeConfig().nominatimContactEmail as string | undefined)?.trim() || '';
const NOMINATIM_UA = contactEmail
  ? `Tastemap/1.0 (contact: ${contactEmail})`
  : 'Tastemap/1.0 (Frontend Mentor product challenge)';

export function nominatimFetch(path: 'search' | 'reverse', query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value);
    }
  }
  params.set('format', 'json');

  return $fetch(`https://nominatim.openstreetmap.org/${path}?${params.toString()}`, {
    headers: {
      'User-Agent': NOMINATIM_UA,
      'Accept': 'application/json',
    },
  });
}
