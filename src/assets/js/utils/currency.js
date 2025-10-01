/**
 * @file Currency utility functions for formatting and lookups.
 */

export const DEFAULT_QUOTE_CURRENCY = 'USD';

/**
 * Retrieves the quote currency for a given asset symbol.
 * Falls back to the default quote currency if not specified in meta.
 *
 * @param {string} symbol - The asset symbol (e.g., 'BTC').
 * @param {object} cryptoMeta - The crypto meta object.
 * @returns {string} The quote currency (e.g., 'USDT', 'USD').
 */
export function getQuoteCurrency(symbol, cryptoMeta) {
  if (!symbol || !cryptoMeta) {
    return DEFAULT_QUOTE_CURRENCY;
  }
  return cryptoMeta[symbol.toUpperCase()]?.quote || DEFAULT_QUOTE_CURRENCY;
}

/**
 * Constructs the trading pair string for a given asset symbol.
 *
 * @param {string} symbol - The asset symbol (e.g., 'BTC').
 * @param {object} cryptoMeta - The crypto meta object.
 * @returns {string} The trading pair (e.g., 'BTC-USD').
 */
export function getPair(symbol, cryptoMeta) {
  if (!symbol) {
    return `---${DEFAULT_QUOTE_CURRENCY}`;
  }
  const quote = getQuoteCurrency(symbol, cryptoMeta);
  return `${symbol.toUpperCase()}-${quote}`;
}
