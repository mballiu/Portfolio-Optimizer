import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "./ui/skeleton"
import { useLanguage } from "../lib/i18n.jsx"
import { useBreakpoint } from "../hooks/useBreakpoint"

const COLORS = ["#2f81f7","#3fb950","#f85149","#d29922","#8957e5","#39c5cf","#f0883e","#bc8cff","#56d364","#ff7b72"]

export default function NormalizedReturnsChart({ rawData, loading }) {
  const { t } = useLanguage()
  const { chartHeight, isMobile } = useBreakpoint()

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("prices.title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    )
  }

  if (!rawData) return null

  const { tickerList, dates, usdPrices, companyNames = {} } = rawData
  if (!dates || dates.length === 0) return null

  const chartData = dates.map((date, i) => {
    const point = { date: date.slice(5) }
    tickerList.forEach((t) => {
      if (usdPrices[t] && usdPrices[t][i]) {
        const base = usdPrices[t][0]
        point[t] = +(usdPrices[t][i] / base * 100).toFixed(2)
      }
    })
    return point
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("prices.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: isMobile ? 5 : 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: isMobile ? 10 : 11, fill: "var(--color-text-secondary)", angle: isMobile ? -30 : 0 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              domain={["auto", "auto"]}
              label={{ value: t("prices.base"), angle: -90, position: "left", fontSize: 11, fill: "var(--color-text-secondary)" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--color-bg-border)",
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                fontSize: "11px",
              }}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: isMobile ? "10px" : "11px", paddingTop: "8px" }} formatter={(value) => isMobile ? value : (companyNames[value] || value)} />
            {tickerList.map((t, i) => (
              <Line key={t} type="monotone" dataKey={t} stroke={COLORS[i % COLORS.length]} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
