import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ReferenceDot } from "recharts"
import { Skeleton } from "./ui/skeleton"
import { useLanguage } from "../lib/i18n.jsx"
import { useBreakpoint } from "../hooks/useBreakpoint"

export default function EfficientFrontierChart({ results, loading }) {
  const { t } = useLanguage()
  const { chartHeight, isMobile } = useBreakpoint()

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("frontier.title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    )
  }

  if (!results) return null

  const frontierData = results.frontier.map(p => ({
    risk: +(p.volatility * 100).toFixed(4),
    return: +(p.return * 100).toFixed(4),
  }))

  const optPoint = {
    risk: +(results.optimalPoint.volatility * 100).toFixed(4),
    return: +(results.optimalPoint.return * 100).toFixed(4),
  }

  const minVar = frontierData.reduce((a, b) => a.risk < b.risk ? a : b, frontierData[0])
  const optColor = "#3fb950"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("frontier.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ScatterChart margin={{ top: 5, right: 10, bottom: isMobile ? 5 : 10, left: isMobile ? 0 : 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" opacity={0.5} />
            <XAxis
              dataKey="risk"
              name="Risk"
              unit="%"
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              label={{ value: t("frontier.volatility"), position: "bottom", fontSize: 11, fill: "var(--color-text-secondary)" }}
            />
            <YAxis
              dataKey="return"
              name="Return"
              unit="%"
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              label={{ value: t("frontier.return"), angle: -90, position: "left", fontSize: 11, fill: "var(--color-text-secondary)" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--color-bg-border)",
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                fontSize: "11px",
              }}
              formatter={(v) => v.toFixed(2) + "%"}
            />
            <ZAxis range={[16, 16]} />
            <Scatter name={t("frontier.random")} data={frontierData} fill="var(--color-bg-elevated)" stroke="var(--color-bg-border)" opacity={0.6} shape="circle" isAnimationActive={false} />
            <ReferenceDot x={optPoint.risk} y={optPoint.return} r={10} fill={optColor} stroke="#fff" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgba(63,185,80,0.5))" }} />
            <ReferenceDot x={minVar.risk} y={minVar.return} r={8} fill="#2f81f7" stroke="#fff" strokeWidth={2} />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary justify-center">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-blue shrink-0" /> {t("frontier.minVar")}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: optColor }} /> {t("frontier.optimal", results.mode)}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-bg-elevated border border-bg-border shrink-0" /> {t("frontier.random")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
