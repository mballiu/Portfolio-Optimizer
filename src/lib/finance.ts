export function annualizeReturn(dailyRet) {
  return Math.exp(dailyRet * 252) - 1
}

export function annualizeVolatility(dailyVol) {
  return dailyVol * Math.sqrt(252)
}

export function deannualizeReturn(annRet) {
  return Math.log(1 + annRet) / 252
}

export function deannualizeVolatility(annVol) {
  return annVol / Math.sqrt(252)
}

export function dailyToAnnualSharpe(dailySharpe) {
  return dailySharpe * Math.sqrt(252)
}

export function calculateBeta(stockReturns, marketReturns) {
  const n = Math.min(stockReturns.length, marketReturns.length)
  if (n < 2) return 1
  const s = stockReturns.slice(-n)
  const m = marketReturns.slice(-n)
  const meanS = s.reduce((a, b) => a + b, 0) / n
  const meanM = m.reduce((a, b) => a + b, 0) / n
  let cov = 0, varM = 0
  for (let i = 0; i < n; i++) {
    cov += (s[i] - meanS) * (m[i] - meanM)
    varM += (m[i] - meanM) ** 2
  }
  return varM > 0 ? cov / varM : 1
}

export function calculateAllBetas(stockReturnsList, marketReturns, tickers) {
  return tickers.map((t, i) => ({
    ticker: t,
    beta: calculateBeta(stockReturnsList[i], marketReturns)
  }))
}
