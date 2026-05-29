import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { formatPct, recommendation, recColor, betaLabel } from "../lib/utils"
import { useLanguage } from "../lib/i18n.jsx"
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react"
import { useState, Fragment } from "react"

export default function WeightsTable({ results, loading, rawData }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [expandedSet, setExpandedSet] = useState(new Set())

  function toggleExpanded(ticker) {
    setExpandedSet(prev => {
      const next = new Set(prev)
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker)
      return next
    })
  }
  const { t } = useLanguage()

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("weights.title")}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  if (!results) return null

  const companyNames = rawData?.companyNames || {}
  const data = [...results.stockDetails]
  const maxWeight = Math.max(...data.map(d => d.weight), 0.01)

  if (sortKey) {
    data.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
  }

  function toggleSort(key) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  function SortHeader({ label, sort, className }) {
    return (
      <button
        aria-label={`Sort by ${label}`}
        onClick={() => toggleSort(sort)}
        className={`inline-flex items-center gap-1 text-xs uppercase tracking-wide font-medium text-text-secondary hover:text-text-primary transition-colors duration-150 ${className}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("weights.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-tabular-nums">
            <thead>
              <tr className="sticky top-0 bg-bg-card z-10 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-bg-border">
                <th className="w-6 sm:hidden pb-2.5 pt-0" />
                <th className="text-left pb-2.5 pt-0"><SortHeader label={t("weights.ticker")} sort="ticker" /></th>
                <th className="text-left pb-2.5 pt-0 hidden sm:table-cell"><SortHeader label={t("weights.region")} sort="region" /></th>
                <th className="text-right pb-2.5 pt-0"><SortHeader label={t("weights.weight")} sort="weight" /></th>
                <th className="text-right pb-2.5 pt-0 hidden sm:table-cell"><SortHeader label={t("weights.beta")} sort="beta" /></th>
                <th className="text-right pb-2.5 pt-0 hidden lg:table-cell"><SortHeader label={t("weights.expRet")} sort="expReturn" /></th>
                <th className="text-right pb-2.5 pt-0"><SortHeader label={t("weights.rec")} sort="recommendation" /></th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => {
                const rec = recommendation(d.beta, d.expReturn)
                const limited = (d.dataPoints || 0) < 30
                const name = companyNames[d.ticker] || ""
                const barPct = (d.weight / maxWeight) * 100
                const isExpanded = expandedSet.has(d.ticker)
                return (
                  <Fragment key={d.ticker}>
                    <tr
                      onClick={() => toggleExpanded(d.ticker)}
                      className={`border-b last:border-0 transition-all duration-150 min-h-[52px] sm:hover:bg-accent-blue/8 active:bg-accent-blue/12 sm:cursor-default cursor-pointer ${idx % 2 === 1 ? "bg-bg-elevated/30" : ""}`}
                    >
                      <td className="py-2.5 sm:hidden text-text-muted">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="py-2.5 min-h-[52px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-text-primary leading-tight">{d.ticker}</span>
                          {name && name !== d.ticker && (
                            <span className="text-xs text-text-secondary leading-tight hidden sm:block">{name}</span>
                          )}
                          {limited && (
                            <span className="text-[10px] text-accent-yellow mt-0.5 hidden sm:block">{t("weights.limitedData")}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 hidden sm:table-cell">
                        <span className="text-xs text-text-secondary">
                          {d.region}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-sm text-text-primary">{formatPct(d.weight)}</span>
                          <div className="w-20 h-[3px] rounded-full bg-bg-elevated overflow-hidden hidden sm:block">
                            <div className="h-full rounded-full bg-accent-blue transition-all duration-300" style={{ width: `${barPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right hidden sm:table-cell">
                        <span className={`font-mono text-sm font-medium ${
                          d.beta < 0.8 ? "text-accent-green" : d.beta > 1.2 ? "text-accent-red" : "text-text-primary"
                        }`}>
                          {d.beta.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right hidden lg:table-cell">
                        <span className={`font-mono text-sm font-medium ${
                          d.expReturn > 0.02 ? "text-accent-green" : d.expReturn < -0.02 ? "text-accent-red" : "text-text-secondary"
                        }`}>
                          {d.expReturn > 0.02 ? "↑ " : d.expReturn < -0.02 ? "↓ " : ""}
                          {formatPct(d.expReturn)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 font-semibold text-sm ${recColor(rec)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rec === "Buy" ? "bg-accent-green" : rec === "Sell" ? "bg-accent-red" : "bg-accent-yellow"
                          }`} />
                          {t("weights." + rec.toLowerCase())}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="sm:hidden border-b border-bg-border">
                        <td colSpan={7} className="p-0">
                          <div className="px-9 pb-3 pt-0 space-y-2 text-xs">
                            {name && name !== d.ticker && (
                              <p className="text-text-secondary leading-tight text-center">{name}</p>
                            )}
                            {limited && (
                              <p className="text-accent-yellow text-center">{t("weights.limitedData")}</p>
                            )}
                            <div className="flex justify-center gap-6">
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("weights.region")}</span>
                                <span className="text-xs text-text-secondary block text-center">{d.region}</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("weights.beta")}</span>
                                <span className={`font-mono text-xs font-medium block text-center ${
                                  d.beta < 0.8 ? "text-accent-green" : d.beta > 1.2 ? "text-accent-red" : "text-text-primary"
                                }`}>{d.beta.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("weights.expRet")}</span>
                                <span className={`font-mono text-xs font-medium block text-center ${
                                  d.expReturn > 0.02 ? "text-accent-green" : d.expReturn < -0.02 ? "text-accent-red" : "text-text-secondary"
                                }`}>
                                  {d.expReturn > 0.02 ? "↑ " : d.expReturn < -0.02 ? "↓ " : ""}
                                  {formatPct(d.expReturn)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                                <span>{t("weights.weight")}</span>
                                <span className="font-mono font-medium text-text-primary text-xs">{formatPct(d.weight)}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden">
                                <div className="h-full rounded-full bg-accent-blue transition-all duration-300" style={{ width: `${barPct}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
