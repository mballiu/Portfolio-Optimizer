import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { formatPct, round2 } from "../lib/utils"
import { useLanguage } from "../lib/i18n.jsx"

export default function BenchmarkComparison({ results, loading }) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("benchmark.title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    )
  }

  if (!results || results.ewReturn === undefined) return null

  const rows = [
    { label: t("equalWeight.return"), opt: formatPct(results.annReturn), ew: formatPct(results.ewReturn), better: results.annReturn > results.ewReturn },
    { label: t("equalWeight.volatility"), opt: formatPct(results.annVolatility), ew: formatPct(results.ewVolatility), better: results.annVolatility < results.ewVolatility },
    { label: t("equalWeight.sharpe"), opt: round2(results.sharpeRatio).toFixed(2), ew: round2(results.ewSharpe).toFixed(2), better: results.sharpeRatio > results.ewSharpe },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("benchmark.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm font-tabular-nums">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2.5 text-xs font-medium text-text-secondary">{t("equalWeight.metric")}</th>
                <th className="text-right pb-2.5 text-xs font-medium text-text-secondary">{t("equalWeight.optimized")}</th>
                <th className="text-right pb-2.5 text-xs font-medium text-text-secondary">{t("equalWeight.equalWeight")}</th>
                <th className="text-right pb-2.5 text-xs font-medium text-text-secondary">Better?</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.label} className="border-b last:border-0 hover:bg-accent-blue/8 transition-colors duration-150">
                  <td className="py-2.5 text-sm text-text-primary">{r.label}</td>
                  <td className={`py-2.5 text-right text-sm font-mono ${r.better ? "text-accent-green" : "text-accent-red"}`}>{r.opt}</td>
                  <td className="py-2.5 text-right text-sm font-mono text-text-secondary">{r.ew}</td>
                  <td className="py-2.5 text-right text-sm">
                    {r.better
                      ? <span className="text-accent-green font-medium">↑ {t("equalWeight.optimized")}</span>
                      : <span className="text-accent-red font-medium">↓ {t("equalWeight.equalWeight")}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-3">
          {rows.map(r => (
            <Card key={r.label} className="hover:bg-accent-blue/8 transition-colors duration-150">
              <CardContent className="p-3 space-y-1">
                <p className="text-xs text-text-secondary uppercase tracking-wide">{r.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{t("equalWeight.optimized")}</span>
                  <span className={`text-sm font-mono font-medium ${r.better ? "text-accent-green" : "text-accent-red"}`}>
                    {r.opt} {r.better ? "↑" : "↓"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{t("equalWeight.equalWeight")}</span>
                  <span className="text-sm font-mono text-text-secondary">{r.ew}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-3 italic">{t("equalWeight.note")}</p>
      </CardContent>
    </Card>
  )
}
