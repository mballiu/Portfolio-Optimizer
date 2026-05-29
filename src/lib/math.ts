import * as math from "mathjs"

export function logReturns(prices) {
  const n = prices.length
  if (n < 2) return []
  const rets = []
  for (let i = 1; i < n; i++) {
    rets.push(Math.log(prices[i] / prices[i - 1]))
  }
  return rets
}

export function allLogReturns(priceSeries) {
  return priceSeries.map(prices => logReturns(prices))
}

export function buildCovarianceMatrix(returns) {
  const n = returns.length
  if (n === 0 || returns[0].length < 2) return []
  const meanReturns = returns.map(r => math.mean(r))
  const T = returns[0].length
  const cov = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0
      for (let t = 0; t < T; t++) {
        sum += (returns[i][t] - meanReturns[i]) * (returns[j][t] - meanReturns[j])
      }
      cov[i][j] = sum / (T - 1)
      cov[j][i] = cov[i][j]
    }
  }
  return cov
}

export function buildCorrelationMatrix(returns) {
  const cov = buildCovarianceMatrix(returns)
  const n = cov.length
  if (n === 0) return []
  const std = []
  for (let i = 0; i < n; i++) {
    std.push(Math.sqrt(cov[i][i]))
  }
  const corr = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      corr[i][j] = std[i] > 0 && std[j] > 0 ? cov[i][j] / (std[i] * std[j]) : 0
    }
  }
  return corr
}

export function meanReturns(returns) {
  return returns.map(r => math.mean(r))
}

export function portfolioVariance(weights, covMatrix) {
  const w = math.matrix(weights)
  const cov = math.matrix(covMatrix)
  const wT = math.transpose(w)
  const covW = math.multiply(cov, w)
  return math.multiply(wT, covW)
}

function projectSimplex(v) {
  const n = v.length
  const u = [...v].sort((a, b) => b - a)
  let rho = 0
  for (let i = 1; i <= n; i++) {
    const sum = u.slice(0, i).reduce((a, b) => a + b, 0)
    const t = (sum - 1) / i
    if (t <= u[i - 1] && (i === n || t < u[i])) {
      rho = t
      break
    }
  }
  if (rho === 0) {
    const sum = u.reduce((a, b) => a + b, 0)
    rho = (sum - 1) / n
  }
  return v.map(x => Math.max(x - rho, 0))
}

export function minVariancePortfolio(covMatrix, allowShort) {
  const n = covMatrix.length
  const ones = new Array(n).fill(1)
  const invCov = math.inv(covMatrix)
  const wUnconstrained = math.multiply(invCov, ones)
  let w = math.divide(wUnconstrained, math.sum(wUnconstrained)).valueOf().flat()

  if (!allowShort) {
    w = projectSimplex(w)
    const sw = math.sum(w)
    if (sw > 0) w = math.divide(w, sw).valueOf().flat()
  }

  const variance = portfolioVariance(w, covMatrix)
  return { weights: w.map(Number), variance: Number(variance) }
}

export function maxSharpePortfolio(covMatrix, meanRets, rf, allowShort) {
  const n = covMatrix.length
  const maxIter = 5000
  const tol = 1e-8
  let lr = 0.01

  let w = new Array(n).fill(1 / n)

  for (let iter = 0; iter < maxIter; iter++) {
    const covW = math.multiply(covMatrix, w).valueOf().flat()
    const muP = math.dot(w, meanRets)
    const sigmaP = Math.sqrt(math.dot(w, covW))
    if (sigmaP < 1e-12) break

    const grad = meanRets.map((mu, i) => {
      const dSigma = covW[i] / sigmaP
      return (mu * sigmaP - (muP - rf) * dSigma) / (sigmaP * sigmaP)
    })

    let wNew = w.map((wi, i) => wi + lr * grad[i])

    if (!allowShort) {
      wNew = projectSimplex(wNew)
    }
    const sumW = wNew.reduce((a, b) => a + b, 0)
    if (sumW > 0) wNew = wNew.map(x => x / sumW)

    const diff = Math.sqrt(wNew.reduce((s, x, i) => s + (x - w[i]) ** 2, 0))
    w = wNew

    if (diff < tol) break

    if (iter > 0 && iter % 500 === 0) {
      lr *= 0.95
    }
  }

  const finalCovW = math.multiply(covMatrix, w).valueOf().flat()
  const finalMu = math.dot(w, meanRets)
  const finalSigma = Math.sqrt(math.dot(w, finalCovW))
  const sharpe = finalSigma > 1e-12 ? (finalMu - rf) / finalSigma : 0

  return { weights: w, sharpe, return: finalMu, volatility: finalSigma }
}

export function randomPortfolios(count, n, allowShort) {
  const portfolios = []
  for (let i = 0; i < count; i++) {
    let w
    if (allowShort) {
      w = Array.from({ length: n }, () => Math.random() - 0.5)
      const sum = Math.abs(w.reduce((a, b) => a + b, 0))
      if (sum > 1e-10) w = w.map(x => x / sum)
    } else {
      w = Array.from({ length: n }, () => Math.random())
      const sum = w.reduce((a, b) => a + b, 0)
      w = sum > 0 ? w.map(x => x / sum) : new Array(n).fill(1 / n)
    }
    portfolios.push(w)
  }
  return portfolios
}

export function portfolioStats(weights, covMatrix, meanRets, rf) {
  const ret = math.dot(weights, meanRets)
  const covW = math.multiply(covMatrix, weights).valueOf().flat()
  const vol = Math.sqrt(math.dot(weights, covW))
  const sharpe = vol > 1e-12 ? (ret - rf) / vol : 0
  return { return: ret, volatility: vol, sharpe }
}
