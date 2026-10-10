// ECB reference cross-rate via Frankfurter, 2026-10-09; fallback for offline demos.
export const fallbackExchangeRate = { date: '2026-10-09', cnyPerUsd: 6.6921 };
export function convertCny(value: number, english: boolean, cnyPerUsd: number) {
  return english ? Math.round(value / cnyPerUsd * 100) / 100 : value;
}
export async function fetchExchangeRate(signal: AbortSignal) {
  const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=CNY', { signal });
  if (!response.ok) throw new Error('Exchange rate unavailable');
  const data = await response.json();
  if (data.base !== 'USD' || typeof data.rates?.CNY !== 'number' || data.rates.CNY <= 0 || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Invalid exchange rate');
  return { date: data.date as string, cnyPerUsd: data.rates.CNY as number };
}
