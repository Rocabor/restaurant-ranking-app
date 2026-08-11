import type { Place, Comparison } from '~/types';

interface PlaceRow {
  id: string;
  user_id: string;
  name: string;
  cuisine: string;
  cuisine_group: string;
  specialty: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  price_level: 1 | 2 | 3 | 4;
  status: 'ranked' | 'want';
  rank: number | null;
  visits: number;
  tags: string[];
  note: string;
  photo: string | null;
  website: string | null;
  date_added: string;
}

function rowToPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    cuisineGroup: row.cuisine_group,
    specialty: row.specialty,
    area: row.area,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    priceLevel: row.price_level,
    status: row.status,
    rank: row.rank,
    visits: row.visits,
    tags: row.tags ?? [],
    note: row.note ?? '',
    photo: row.photo,
    website: row.website,
    dateAdded: row.date_added,
  };
}

function placeToRow(place: Place, userId: string): Omit<PlaceRow, 'user_id'> & { user_id: string } {
  return {
    id: place.id,
    user_id: userId,
    name: place.name,
    cuisine: place.cuisine,
    cuisine_group: place.cuisineGroup,
    specialty: place.specialty,
    area: place.area,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    price_level: place.priceLevel,
    status: place.status,
    rank: place.rank,
    visits: place.visits,
    tags: place.tags,
    note: place.note ?? '',
    photo: place.photo,
    website: place.website,
    date_added: place.dateAdded,
  };
}

interface ComparisonRow {
  a_id: string;
  b_id: string;
  result: 'a' | 'b' | 'tie';
  date: string;
}

function rowToComparison(row: ComparisonRow): Comparison {
  return { aId: row.a_id, bId: row.b_id, result: row.result, date: row.date };
}

function comparisonToRow(c: Comparison): ComparisonRow {
  return { a_id: c.aId, b_id: c.bId, result: c.result, date: c.date };
}

const SCHEMA = 'tastemap';

export function useSupabaseData() {
  const client = useSupabaseClient().schema(SCHEMA);
  const user = useSupabaseUser();

  function currentUserId() {
    return user.value?.id;
  }

  async function loadPlaces() {
    const userId = currentUserId();
    if (!userId) return { places: [] as Place[], comparisons: [] as Comparison[] };

    const [placesRes, comparisonsRes] = await Promise.all([
      client.from('places').select('*').eq('user_id', userId),
      client.from('comparisons').select('*').eq('user_id', userId),
    ]);

    if (placesRes.error) throw placesRes.error;
    if (comparisonsRes.error) throw comparisonsRes.error;

    return {
      places: (placesRes.data as PlaceRow[]).map(rowToPlace),
      comparisons: (comparisonsRes.data as ComparisonRow[]).map(rowToComparison),
    };
  }

  async function upsertPlace(place: Place) {
    const userId = currentUserId();
    if (!userId) return;
    const { error } = await client.from('places').upsert(placeToRow(place, userId));
    if (error) throw error;
  }

  async function upsertPlaces(places: Place[]) {
    const userId = currentUserId();
    if (!userId || places.length === 0) return;
    const { error } = await client.from('places').upsert(places.map((p) => placeToRow(p, userId)));
    if (error) throw error;
  }

  async function deletePlace(id: string) {
    const userId = currentUserId();
    if (!userId) return;
    const { error } = await client.from('places').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  }

  async function insertComparison(c: Comparison) {
    const userId = currentUserId();
    if (!userId) return;
    const { error } = await client.from('comparisons').insert({ ...comparisonToRow(c), user_id: userId });
    if (error) throw error;
  }

  return { loadPlaces, upsertPlace, upsertPlaces, deletePlace, insertComparison };
}
