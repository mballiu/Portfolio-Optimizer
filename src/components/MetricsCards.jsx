import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { formatPct, round2 } from "../lib/utils"
import { useLanguage } from "../lib/i18n.jsx"
import { Info } from "lucide-react"

function InfoTip({ explanation, alignRight }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center">
      <button
        aria-label="Info"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-[32px] h-[32px] -m-1 text-text-muted hover:text-text-secondary transition-colors cursor-help"
      >
        <Info className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <div className={`absolute z-20 top-full mt-1.5 w-56 max-w-[80vw] p-2 rounded-lg bg-bg-elevated text-text-primary text-[11px] leading-relaxed shadow-lg border border-bg-border pointer-events-none ${
          alignRight ? "right-0" : "left-1/2 -translate-x-1/2"
        }`}>
          {explanation}
          <div className={`absolute bottom-full border-4 border-transparent border-b-bg-border ${
            alignRight ? "right-2" : "left-1/2 -translate-x-1/2"
          }`} />
        </div>
      )}
    </span>
  )
}

export default function MetricsCards({ results, loading }) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2 min-h-[90px]">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!results) return null

  function valueColor(metric) {
    if (metric === "annReturn" || metric === "sharpe") {
      return results[metric] >= 0 ? "text-accent-green" : "text-accent-red"
    }
    return "text-accent-blue"
  }

  const metrics = [
    { key: "annReturn", label: t("metrics.annReturn"), tip: t("metrics.annReturnTip"), value: formatPct(results.annReturn) },
    { key: "annVolatility", label: t("metrics.annVol"), tip: t("metrics.annVolTip"), value: formatPct(results.annVolatility), alignRight: true },
    { key: "sharpe", label: t("metrics.sharpe"), tip: t("metrics.sharpeTip"), value: round2(results.sharpeRatio).toFixed(2) },
    { key: "stocks", label: t("metrics.stocks"), tip: t("metrics.stocksTip"), value: results.stockDetails.length },
    { key: "portfolioBeta", label: t("metrics.portfolioBeta"), tip: t("metrics.portfolioBetaTip"), value: (results.portfolioBeta || 0).toFixed(2) },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1">
      {metrics.map(m => (
        <Card key={m.label} className="hover:bg-accent-blue/8 transition-colors duration-150">
          <CardContent className="p-4 min-h-[90px] flex flex-col justify-center">
            <div className="text-xs text-text-secondary uppercase tracking-wide mb-1 flex items-center">
              {m.label}
              <InfoTip explanation={m.tip} alignRight={m.alignRight} />
            </div>
            <p className={`text-xl sm:text-2xl font-bold font-tabular-nums leading-tight ${valueColor(m.key)}`}>
              {String(m.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
