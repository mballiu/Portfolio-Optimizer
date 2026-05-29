import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { useLanguage } from "../lib/i18n.jsx"

function corrBg(v) {
  if (v === 1) return "#2f81f7"
  if (v > 0) {
    const a = Math.min(v, 1) * 0.25
    return `rgba(248,81,73,${a})`
  }
  const a = Math.min(Math.abs(v), 1) * 0.25
  return `rgba(63,185,80,${a})`
}

function corrText(v) {
  return v === 1 ? "text-white" : "text-text-primary"
}

export default function CorrelationMatrix({ results, loading }) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("correlation.title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    )
  }

  if (!results || !results.corrMatrix || results.corrMatrix.length === 0) return null

  const { corrMatrix, tickerList } = results

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("correlation.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm font-tabular-nums" aria-label={t("correlation.title")}>
            <thead>
              <tr>
                <th className="p-1.5 sm:p-2.5 min-w-[52px]" />
                {tickerList.map(t => (
                  <th key={t} className="p-1.5 sm:p-2.5 text-center font-medium text-text-primary min-w-[52px]">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-1.5 sm:p-2.5 font-medium text-text-secondary sticky left-0 bg-bg-card z-10 min-w-[52px]">{tickerList[i]}</td>
                  {row.map((v, j) => (
                    <td
                      key={j}
                      className={`p-1.5 sm:p-2.5 text-center rounded text-[11px] sm:text-xs font-medium ${corrText(v)}`}
                      style={{ backgroundColor: corrBg(v) }}
                      title={t("correlation.tooltip", tickerList[i], tickerList[j], v)}
                    >
                      {v.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-secondary mt-3">{t("correlation.explanation")}</p>
      </CardContent>
    </Card>
  )
}
