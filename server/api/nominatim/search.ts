export default defineEventHandler(async (event) => {
  return await nominatimFetch('search', getQuery(event));
});
