export default defineEventHandler(async (event) => {
  return await nominatimFetch('reverse', getQuery(event));
});
