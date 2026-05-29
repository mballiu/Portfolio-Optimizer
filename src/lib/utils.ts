import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function round2(v) {
  return Math.round(v * 100) / 100
}

export function formatPct(v) {
  return (v * 100).toFixed(2) + "%"
}

export function getRegion(ticker) {
  const suffix = ticker.includes(".") ? ticker.split(".")[1].toUpperCase() : ""
  if (!suffix) return "US"
  switch (suffix) {
    case "DE": case "AS": case "PA": case "BR": case "MI": case "MC":
    case "AT": case "LS": case "ST": case "OL": case "CO": case "HE":
    case "WA":
      return "Europe"
    case "L": case "LN": case "IL": return "Other"
    case "T": case "TO": case "V": return "Asia"
    case "HK": return "Asia"
    case "SI": return "Asia"
    case "KS": case "KQ": return "Asia"
    default: return "Other"
  }
}

export function getCurrency(ticker) {
  const suffix = ticker.includes(".") ? ticker.split(".")[1].toUpperCase() : ""
  switch (suffix) {
    case "DE": case "AS": case "PA": case "BR": case "MI": case "MC":
    case "AT": case "LS": case "ST": case "OL": case "CO": case "HE":
    case "WA":
      return "EUR"
    case "L": case "LN": return "GBP"
    case "IL": return "ILS"
    case "TO": return "CAD"
    case "T": return "JPY"
    case "HK": return "HKD"
    case "SI": return "SGD"
    case "KS": case "KQ": return "KRW"
    case "SS": return "CNY"
    default: return "USD"
  }
}

export function regionColor(region) {
  switch (region) {
    case "US": return "bg-accent-blue/10 text-accent-blue"
    case "Europe": return "bg-accent-green/10 text-accent-green"
    case "Asia": return "bg-accent-yellow/10 text-accent-yellow"
    default: return "bg-bg-elevated text-text-secondary"
  }
}

export function regionBadgeColor(region) {
  switch (region) {
    case "US": return "bg-[#1a2a3a] text-[#60a5fa] border-[#2a4a6a]"
    case "Europe": return "bg-[#1a2d1a] text-[#4ade80] border-[#2a4d2a]"
    default: return "bg-[#2a2a1a] text-[#facc15] border-[#4a4a1a]"
  }
}

export function recommendation(beta, ret) {
  if (beta > 1.2 && ret > 0.15) return "Buy"
  if (beta > 1.5 || ret > 0.25) return "Buy"
  if (beta < 0.8 && ret < 0.05) return "Sell"
  if (ret < -0.01) return "Sell"
  return "Hold"
}

export function recColor(rec) {
  switch (rec) {
    case "Buy": return "text-accent-green"
    case "Sell": return "text-accent-red"
    default: return "text-accent-yellow"
  }
}

export function betaColor(beta) {
  if (beta < 0.8) return "text-accent-green"
  if (beta <= 1.2) return "text-accent-yellow"
  return "text-accent-red"
}

export function betaBadgeColor(beta) {
  if (beta < 0.8) return "bg-[#0d2818] text-[#3fb950] border-[#1a4a2a]"
  if (beta <= 1.2) return "bg-[#271d00] text-[#d29922] border-[#4a3800]"
  return "bg-[#2a0d0d] text-[#f85149] border-[#4a1a1a]"
}

export function betaLabel(beta, t) {
  if (beta < 0.8) return t("weights.lowRisk")
  if (beta <= 1.2) return t("weights.market")
  return t("weights.highRisk")
}

export const PERIODS = [
  { value: "3mo", key: "3mo" },
  { value: "6mo", key: "6mo" },
  { value: "1y", key: "1y" },
  { value: "2y", key: "2y" },
  { value: "5y", key: "5y" },
]

export function periodLabel(value, t) {
  const map = { "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y" }
  return map[value] || value
}

export const PRESET_PORTFOLIOS = [
  { labelKey: "techGiants", tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"] },
  { labelKey: "euDiversified", tickers: ["SAP.DE", "ASML.AS", "AIR.PA", "DBK.DE"] },
  { labelKey: "mixedGlobal", tickers: ["AAPL", "SAP.DE", "TSM", "ASML.AS", "JPM"] },
]
