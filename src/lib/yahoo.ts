function getRangeParams(period) {
  const now = Date.now()
  const ranges = { "3mo": 90, "6mo": 180, "1y": 365, "2y": 730, "5y": 1825 }
  const days = ranges[period] || 365
  return {
    period1: Math.floor((now - days * 86400000) / 1000),
    period2: Math.floor(now / 1000),
  }
}

const BASE = "/api/yahoo/chart"

async function fetchWithBackoff(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)
    if (res.ok) return res
    if (res.status === 429 && i < retries - 1) {
      const delay = (i + 1) * 5000
      await new Promise(r => setTimeout(r, delay))
      continue
    }
    throw new Error(`HTTP ${res.status} for ${url.split("?")[0].split("/").pop()}`)
  }
  throw new Error(`HTTP 429 after ${retries} retries`)
}

function extractPrices(result) {
  if (!result) return null
  const quotes = result.indicators?.adjclose || result.indicators?.quote
  if (!quotes?.[0]?.adjclose && !quotes?.[0]?.close) return null
  const prices = (quotes[0].adjclose || quotes[0].close)
  const timestamps = result.timestamp || []
  if (timestamps.length < 2) return null
  const pairs = timestamps
    .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().split("T")[0], price: prices[i] }))
    .filter(p => p.price !== null && !isNaN(p.price) && p.price > 0)
  if (pairs.length < 2) return null
  return {
    dates: pairs.map(p => p.date),
    prices: pairs.map(p => p.price),
    shortName: result.meta?.shortName || result.meta?.symbol || "",
  }
}

function parseSparkEntry(entry) {
  const wrap = entry.response?.[0] || entry
  const sym = wrap.symbol || entry.symbol || entry.context?.symbol || ""
  if (!sym) return null
  const extracted = extractPrices(wrap)
  if (!extracted) return null
  return { ticker: sym, ...extracted }
}

export async function fetchAllTickers(tickers, period) {
  const range = { "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y" }[period] || "1y"

  try {
    const res = await fetch(`/api/yahoo/spark?symbols=${tickers.join(",")}&range=${range}&interval=1d`)
    if (res.ok) {
      const data = await res.json()
      const results = {}
      for (const entry of data.spark?.result || []) {
        const r = parseSparkEntry(entry)
        if (r) results[r.ticker] = r
      }
      if (tickers.every(t => results[t])) return results
    }
  } catch {}

  const results = {}
  for (const ticker of tickers) {
    results[ticker] = await fetchHistoricalPrices(ticker, period)
  }
  return results
}

export async function fetchHistoricalPrices(ticker, period) {
  const { period1, period2 } = getRangeParams(period)
  const res = await fetchWithBackoff(`${BASE}/${ticker}?period1=${period1}&period2=${period2}&interval=1d`)
  const data = await res.json()

  const result = data.chart?.result?.[0]
  if (!result) {
    const err = data.chart?.error
    throw new Error(err ? `YF error for ${ticker}: ${err.description || JSON.stringify(err)}` : `No data for ${ticker}`)
  }

  const extracted = extractPrices(result)
  if (!extracted) throw new Error(`No price data for ${ticker}`)

  return { ticker, ...extracted }
}

export async function fetchEURUSD() {
  try {
    const { period1, period2 } = getRangeParams("6mo")
    const res = await fetch(`${BASE}/EURUSD=X?period1=${period1}&period2=${period2}&interval=1d`)
    if (!res.ok) throw new Error("HTTP " + res.status)
    const data = await res.json()
    const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close
    if (!quotes) throw new Error("No EUR/USD data")
    const valid = quotes.filter(p => p !== null && p > 0)
    if (valid.length === 0) throw new Error("No valid EUR/USD quotes")
    return valid[valid.length - 1]
  } catch (e) {
    return 1.08
  }
}
