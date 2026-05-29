import { useCallback } from "react"
import { fetchAllTickers, fetchEURUSD } from "../lib/yahoo"
import { logReturns, allLogReturns, buildCovarianceMatrix, buildCorrelationMatrix, meanReturns, minVariancePortfolio, maxSharpePortfolio, randomPortfolios, portfolioStats } from "../lib/math"
import { annualizeReturn, annualizeVolatility, dailyToAnnualSharpe, calculateBeta } from "../lib/finance"
import { getCurrency, getRegion } from "../lib/utils"

export function useOptimizer() {
  const runPipeline = useCallback(async ({ tickers, settings, setStep, setResults, setError }) => {
    try {
      setStep(1)

      const allTickers = [...new Set([...tickers, "URTH"])]
      const priceData = await fetchAllTickers(allTickers, settings.period)
      const companyNames = {}
      for (const t of allTickers) {
        if (t !== "URTH") companyNames[t] = priceData[t].shortName
      }

      setStep(2)

      const currencies = {}
      for (const t of tickers) {
        currencies[t] = getCurrency(t)
      }

      setStep(3)

      const needsConversion = Object.values(currencies).some(c => c !== "USD")
      let eurUsdRate = 1.08
      if (needsConversion) {
        eurUsdRate = await fetchEURUSD()
      }

      setStep(4)

      const alignedDates = intersectDates(tickers.map(t => priceData[t].dates))
      if (alignedDates.length < 5) {
        throw new Error("Too few overlapping trading dates between selected tickers")
      }

      const dataPointCounts = {}
      const aligned = {}
      for (const t of allTickers) {
        const map = {}
        let lastPrice = priceData[t].prices[0]
        priceData[t].dates.forEach((d, i) => {
          map[d] = priceData[t].prices[i]
          if (priceData[t].prices[i] !== undefined) lastPrice = priceData[t].prices[i]
        })
        const arr = alignedDates.map(d => {
          const p = map[d]
          if (p !== undefined && p !== null) {
            lastPrice = p
            return p
          }
          return lastPrice
        })
        aligned[t] = arr
        if (t !== "URTH") dataPointCounts[t] = arr.length
      }

      const usdPrices = {}
      for (const t of tickers) {
        let prices = aligned[t]
        if (currencies[t] !== "USD") {
          prices = prices.map(p => p * eurUsdRate)
        }
        usdPrices[t] = prices
      }

      const tickerList = tickers
      const priceMatrix = tickerList.map(t => usdPrices[t])

      setStep(5)

      const returnSeries = allLogReturns(priceMatrix)

      setStep(6)

      const covMatrix = buildCovarianceMatrix(returnSeries)
      const corrMatrix = buildCorrelationMatrix(returnSeries)
      const meanRets = meanReturns(returnSeries)

      setStep(7)

      const rfDec = settings.rf / 100
      const rfDaily = Math.log(1 + rfDec) / 252

      let optResult, optWeights
      if (settings.mode === "minVariance") {
        const mv = minVariancePortfolio(covMatrix, settings.allowShort)
        optWeights = mv.weights
        optResult = portfolioStats(optWeights, covMatrix, meanRets, rfDaily)
        optResult.weights = optWeights
      } else {
        optResult = maxSharpePortfolio(covMatrix, meanRets, rfDaily, settings.allowShort)
        optWeights = optResult.weights
      }

      const n = tickerList.length
      const randomW = randomPortfolios(500, n, settings.allowShort)
      const frontier = randomW.map(w => portfolioStats(w, covMatrix, meanRets, rfDaily))

      const ewWeights = new Array(n).fill(1 / n)
      const ewStats = portfolioStats(ewWeights, covMatrix, meanRets, rfDaily)

      const urthPrices = aligned["URTH"]
      let marketReturns = []
      if (urthPrices && urthPrices.length > 1) {
        marketReturns = logReturns(urthPrices)
      }

      const betas = tickerList.map((t, i) => {
        const minLen = Math.min(returnSeries[i].length, marketReturns.length)
        const sr = returnSeries[i].slice(-minLen)
        const mr = marketReturns.slice(-minLen)
        return calculateBeta(sr, mr)
      })

      const portfolioBeta = betas.reduce((sum, b, i) => sum + b * optWeights[i], 0)

      const annRet = annualizeReturn(optResult.return)
      const annVol = annualizeVolatility(optResult.volatility)
      const annSharpe = dailyToAnnualSharpe(optResult.sharpe)

      const ewAnnRet = annualizeReturn(ewStats.return)
      const ewAnnVol = annualizeVolatility(ewStats.volatility)
      const ewAnnSharpe = dailyToAnnualSharpe(ewStats.sharpe)

      const stockDetails = tickerList.map((t, i) => ({
        ticker: t,
        companyName: companyNames[t] || t,
        region: getRegion(t),
        weight: optWeights[i],
        beta: betas[i],
        expReturn: annualizeReturn(meanRets[i]),
        dataPoints: dataPointCounts[t] || 0,
      }))

      const hasLimitedData = tickerList.some(t => (dataPointCounts[t] || 0) < 30)

      const results = {
        weights: tickerList.map((t, i) => ({ ticker: t, weight: optWeights[i], region: getRegion(t) })),
        annReturn: annRet,
        annVolatility: annVol,
        sharpeRatio: annSharpe,
        portfolioBeta,
        stockDetails,
        frontier: frontier.map(p => ({
          volatility: annualizeVolatility(p.volatility),
          return: annualizeReturn(p.return),
        })),
        optimalPoint: {
          volatility: annVol,
          return: annRet,
        },
        mode: settings.mode,
        corrMatrix,
        tickerList,
        ewReturn: ewAnnRet,
        ewVolatility: ewAnnVol,
        ewSharpe: ewAnnSharpe,
        hasLimitedData,
        limitedTickers: tickerList.filter(t => (dataPointCounts[t] || 0) < 30),
      }

      setResults(results, { tickerList, dates: alignedDates, usdPrices, eurUsdRate, companyNames, dataPointCounts })

    } catch (err) {
      setError(err.message || "An unexpected error occurred")
    }
  }, [])

  return { runPipeline }
}

function intersectDates(dateArrays) {
  if (dateArrays.length === 0) return []
  let common = new Set(dateArrays[0])
  for (let i = 1; i < dateArrays.length; i++) {
    const s = new Set(dateArrays[i])
    common = new Set([...common].filter(d => s.has(d)))
  }
  return [...common].sort()
}
