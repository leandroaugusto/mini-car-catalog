export const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, index) => String(1900 + index)
);

export async function fetchYearSuggestions(query: string) {
  return YEAR_OPTIONS.filter((year) => year.includes(query));
}
