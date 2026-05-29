import { useState, useEffect, useRef, Fragment } from "react"
import { createPortal } from "react-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePortfolio } from "./hooks/usePortfolio"
import { useOptimizer } from "./hooks/useOptimizer"
import { LanguageProvider, useLanguage } from "./lib/i18n.jsx"
import StockInput from "./components/StockInput"
import SettingsPanel from "./components/SettingsPanel"
import ProgressStepper from "./components/ProgressStepper"
import MetricsCards from "./components/MetricsCards"
import WeightsTable from "./components/WeightsTable"
import EfficientFrontierChart from "./components/EfficientFrontierChart"
import NormalizedReturnsChart from "./components/NormalizedReturnsChart"
import MethodologyPanel from "./components/MethodologyPanel"
import CorrelationMatrix from "./components/CorrelationMatrix"
import BenchmarkComparison from "./components/BenchmarkComparison"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { AlertCircle, BarChart3, Sun, Moon, Loader2, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, ReferenceDot, ResponsiveContainer } from "recharts"
import { LineChart, Line, Legend } from "recharts"

const queryClient = new QueryClient()

function PrintReport({ results, settings, rawData, lang, t, investment, currency, fractional }) {
  const companyNames = rawData?.companyNames || {}
  const rec = (b, r) => r > 0.02 && b < 1.5 ? "Buy" : r < -0.01 || b > 1.5 ? "Sell" : "Hold"
  const rate = rawData?.eurUsdRate || 1.08
  const sym = currency === "USD" ? "$" : "€"
  const prices = rawData?.usdPrices || {}

  return (
    <div id="print-area">
      <div className="print-header">
        <h1>Portfolio Optimizer</h1>
        <p className="print-subtitle">{t("header.subtitle")}</p>
        <p className="print-date">{t("printDate")}: {new Date().toLocaleDateString(lang === "el" ? "el-GR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <p className="print-meta">{t("printPeriod")}: {settings.period} &mdash; {t("printMode")}: {settings.mode === "minVariance" ? t("settings.minVariance") : t("settings.maxSharpe")}</p>
      </div>

      <div className="print-metrics">
        <div className="print-metric"><span className="print-metric-label">{t("metrics.annReturn")}</span><span className="print-metric-value">{(results.annReturn * 100).toFixed(2)}%</span></div>
        <div className="print-metric"><span className="print-metric-label">{t("metrics.annVol")}</span><span className="print-metric-value">{(results.annVolatility * 100).toFixed(2)}%</span></div>
        <div className="print-metric"><span className="print-metric-label">{t("metrics.sharpe")}</span><span className="print-metric-value">{results.sharpeRatio.toFixed(2)}</span></div>
        <div className="print-metric"><span className="print-metric-label">{t("metrics.stocks")}</span><span className="print-metric-value">{results.stockDetails.length}</span></div>
        <div className="print-metric"><span className="print-metric-label">{t("metrics.portfolioBeta")}</span><span className="print-metric-value">{(results.portfolioBeta || 0).toFixed(2)}</span></div>
      </div>

      <h2 className="print-section-title">{t("weights.title")}</h2>
      <table className="print-table">
        <thead>
          <tr>
            <th>{t("weights.ticker")}</th>
            <th>{t("weights.region")}</th>
            <th>{t("weights.weight")}</th>
            <th>{t("weights.beta")}</th>
            <th>{t("weights.expRet")}</th>
            <th>{t("weights.rec")}</th>
          </tr>
        </thead>
        <tbody>
          {results.stockDetails.map(d => (
            <tr key={d.ticker}>
              <td>
                <div>{d.ticker}</div>
                {companyNames[d.ticker] && companyNames[d.ticker] !== d.ticker && <div className="print-company">{companyNames[d.ticker]}</div>}
              </td>
              <td>{d.region}</td>
              <td>{(d.weight * 100).toFixed(2)}%</td>
              <td>{d.beta.toFixed(2)}</td>
              <td>{(d.expReturn * 100).toFixed(2)}%</td>
              <td>{rec(d.beta, d.expReturn)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rawData?.usdPrices && investment > 0 && (
        <>
          <h2 className="print-section-title">{t("allocation.title")}</h2>
          <p className="print-meta" style={{marginBottom: 8}}>{t("allocation.total")}: {sym}{currency === "EUR" ? (investment / rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : investment.toLocaleString()}</p>
          <table className="print-table">
            <thead>
              <tr>
                <th>{t("weights.ticker")}</th>
                <th>{t("weights.weight")}</th>
                <th>{t("allocation.amount")}</th>
                <th>{t("allocation.price")}</th>
                <th>{t("allocation.shares")}</th>
              </tr>
            </thead>
            <tbody>
              {results.stockDetails.map(d => {
                const arr = prices[d.ticker]
                const lastP = arr?.[arr.length - 1] || 0
                const alloc = investment * d.weight
                const sh = lastP > 0 ? (fractional ? alloc / lastP : Math.floor(alloc / lastP)) : 0
                const disp = v => currency === "EUR" ? v / rate : v
                return (
                  <tr key={d.ticker}>
                    <td>{d.ticker}</td>
                    <td>{(d.weight * 100).toFixed(1)}%</td>
                    <td>{sym}{disp(alloc).toFixed(2)}</td>
                    <td>{sym}{disp(lastP).toFixed(2)}</td>
                    <td>{fractional ? sh.toFixed(4) : sh}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {results.corrMatrix && results.corrMatrix.length > 0 && (
        <>
          <h2 className="print-section-title">{t("correlation.title")}</h2>
          <table className="print-table print-correlation">
            <thead>
              <tr>
                <th></th>
                {results.tickerList.map(t => <th key={t}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.corrMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="print-correlation-label">{results.tickerList[i]}</td>
                  {row.map((v, j) => <td key={j}>{v.toFixed(2)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {results.ewReturn !== undefined && (
        <>
          <h2 className="print-section-title">{t("benchmark.title")}</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>{t("equalWeight.metric")}</th>
                <th>{t("equalWeight.optimized")}</th>
                <th>{t("equalWeight.equalWeight")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("equalWeight.return")}</td>
                <td>{(results.annReturn * 100).toFixed(2)}%</td>
                <td>{(results.ewReturn * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>{t("equalWeight.volatility")}</td>
                <td>{(results.annVolatility * 100).toFixed(2)}%</td>
                <td>{(results.ewVolatility * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>{t("equalWeight.sharpe")}</td>
                <td>{results.sharpeRatio.toFixed(2)}</td>
                <td>{results.ewSharpe.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div className="print-charts" style={{marginTop: 20}}>
        <h2 className="print-section-title">{t("frontier.title")}</h2>
        <div style={{width: "100%", height: 300, position: "relative", marginBottom: 30}}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 5, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.5} />
              <XAxis dataKey="risk" name="Risk" unit="%" tick={{ fontSize: 11, fill: "#333" }} label={{ value: t("frontier.volatility"), position: "bottom", fontSize: 11, fill: "#333" }} />
              <YAxis dataKey="return" name="Return" unit="%" tick={{ fontSize: 11, fill: "#333" }} label={{ value: t("frontier.return"), angle: -90, position: "left", fontSize: 11, fill: "#333" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#fff", color: "#000", fontSize: 11 }} formatter={(v) => v.toFixed(2) + "%"} />
              <ZAxis range={[16, 16]} />
              <Scatter name={t("frontier.random")} data={results.frontier.map(p => ({ risk: +(p.volatility * 100).toFixed(4), return: +(p.return * 100).toFixed(4) }))} fill="#ddd" stroke="#bbb" opacity={0.6} shape="circle" isAnimationActive={false} />
              <ReferenceDot x={+(results.optimalPoint.volatility * 100).toFixed(4)} y={+(results.optimalPoint.return * 100).toFixed(4)} r={10} fill="#3fb950" stroke="#fff" strokeWidth={2} />
              <ReferenceDot x={results.frontier.reduce((a, b) => a.risk < b.risk ? a : b, results.frontier[0]).volatility * 100} y={results.frontier.reduce((a, b) => a.risk < b.risk ? a : b, results.frontier[0]).return * 100} r={8} fill="#2f81f7" stroke="#fff" strokeWidth={2} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {rawData?.dates && rawData?.usdPrices && (() => {
          const prices = rawData.usdPrices
          const dates = rawData.dates
          let minVal = Infinity, maxVal = -Infinity
          rawData.tickerList.filter(t => prices[t]).forEach(t => {
            prices[t].forEach((p, j) => {
              const v = p / prices[t][0] * 100
              if (v < minVal) minVal = v
              if (v > maxVal) maxVal = v
            })
          })
          const padding = (maxVal - minVal) * 0.1 || 10
          const domainMin = Math.floor((minVal - padding) / 10) * 10
          const domainMax = Math.ceil((maxVal + padding) / 10) * 10
          return (
          <>
            <h2 className="print-section-title">{t("returns.title")}</h2>
            <div style={{width: "100%", height: 300, position: "relative", marginBottom: 30}}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart margin={{ top: 5, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#333" }} />
                  <YAxis domain={[domainMin, domainMax]} tick={{ fontSize: 10, fill: "#333" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#fff", color: "#000", fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {rawData.tickerList.filter(t => prices[t]).map((t, i) => {
                    const colors = ["#2f81f7", "#3fb950", "#d29922", "#f85149", "#8957e5", "#1f6feb"]
                    const data = prices[t].map((p, j) => ({ date: (dates[j] || "").slice(5), value: +(p / prices[t][0] * 100).toFixed(2) }))
                    return <Line key={t} data={data} dataKey="value" name={rawData.companyNames?.[t] || t} stroke={colors[i % colors.length]} dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
          )
        })()}
      </div>

      <p className="print-disclaimer">{t("methodology.disclaimer")}</p>
    </div>
  )
}

function AppContent() {
  const portfolio = usePortfolio()
  const { runPipeline } = useOptimizer()
  const { t, lang, toggleLang } = useLanguage()
  const [printMode, setPrintMode] = useState(null)
  const generatingRef = useRef(null)
  const [investment, setInvestment] = useState(10000)
  const [currency, setCurrency] = useState("USD")
  const [fractional, setFractional] = useState(false)

  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("theme")
      if (stored) return stored === "dark"
    } catch {}
    return true
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try { localStorage.setItem("theme", dark ? "dark" : "light") } catch {}
  }, [dark])

  useEffect(() => {
    if (printMode === "ready") {
      const doPrint = () => {
        window.print()
        const cleanUp = () => setPrintMode(null)
        window.addEventListener("afterprint", cleanUp, { once: true })
        setTimeout(cleanUp, 5000)
      }
      requestAnimationFrame(doPrint)
    }
  }, [printMode])

  useEffect(() => {
    const handler = () => setPrintMode(null)
    window.addEventListener("afterprint", handler)
    return () => window.removeEventListener("afterprint", handler)
  }, [])

  async function handleOptimize() {
    if (!portfolio.canOptimize) return
    portfolio.startLoading()
    try {
      await runPipeline({
        tickers: portfolio.tickers,
        settings: portfolio.settings,
        setStep: portfolio.setStep,
        setResults: portfolio.setResults,
        setError: portfolio.setError,
      })
    } catch {}
  }

  function toggleDark() {
    setDark(prev => !prev)
  }

  function handleExportPDF() {
    if (printMode) return
    setPrintMode("generating")
    generatingRef.current = setTimeout(() => {
      setPrintMode("ready")
    }, 300)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <header className="sticky top-0 z-50 h-[52px] border-b bg-bg-base">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent-blue" />
            <h1 className="text-sm font-bold text-text-primary">{t("header.title")}</h1>
            <span className="text-xs text-text-muted hidden sm:inline ml-1">{t("header.subtitle")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle language"
              onClick={toggleLang}
              className="h-8 px-2.5 text-xs font-medium rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("langToggle." + (lang === "en" ? "el" : "en"))}
            </button>
            <button
              aria-label="Toggle dark mode"
              onClick={toggleDark}
              className="h-8 w-8 flex items-center justify-center rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5 text-center sm:text-left">
        {portfolio.error && (
          <Card className="border-accent-red/50 bg-accent-red/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent-red mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-accent-red">{t("error.title")}</p>
                <p className="text-xs text-text-secondary mt-0.5">{portfolio.error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {portfolio.results?.hasLimitedData && (
          <Card className="border-accent-yellow/50 bg-accent-yellow/5">
            <CardContent className="p-3">
              <p className="text-xs text-accent-yellow">{t("weights.globalWarning")}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-[340px] shrink-0 space-y-5">
            <SettingsPanel
              settings={portfolio.settings}
              onUpdate={portfolio.updateSettings}
              disabled={portfolio.loading}
            />
            <StockInput
              tickers={portfolio.tickers}
              companyNames={portfolio.rawData?.companyNames || {}}
              onAdd={portfolio.addTicker}
              onRemove={portfolio.removeTicker}
              onSetTickers={portfolio.setTickers}
              disabled={portfolio.loading}
            />
            <button
              aria-label="Run optimization"
              onClick={handleOptimize}
              disabled={!portfolio.canOptimize || portfolio.loading}
              className="w-full lg:max-w-xs lg:mx-auto h-11 rounded-lg bg-accent-blue text-white font-medium text-sm hover:bg-[#3a8af7] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {portfolio.loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {portfolio.loading ? t("optimize.running") : t("optimize.button", portfolio.tickers.length)}
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            <ProgressStepper currentStep={portfolio.step} loading={portfolio.loading} />

            {!portfolio.loading && !portfolio.results && !portfolio.error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                  <p className="text-sm text-text-secondary">{t("empty.desc")}</p>
                </CardContent>
              </Card>
            )}

            {portfolio.results && (
              <div className="space-y-5">
                <div className="flex items-center justify-end">
                  <button
                    aria-label="Export PDF"
                    onClick={handleExportPDF}
                    disabled={printMode !== null}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {printMode === "generating" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                    {t("exportPdf")}
                  </button>
                </div>
                <MetricsCards results={portfolio.results} loading={portfolio.loading} />
                <WeightsTable results={portfolio.results} loading={portfolio.loading} rawData={portfolio.rawData} />
                {portfolio.rawData?.usdPrices && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-secondary whitespace-nowrap">{t("allocation.invest")}</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">$</span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={investment}
                            onChange={e => setInvestment(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-28 h-8 pl-5 pr-2.5 rounded-md bg-bg-elevated border border-bg-border text-sm text-text-primary font-mono focus:outline-none focus:border-accent-blue transition-colors"
                          />
                        </div>
                        {currency === "EUR" && (
                          <span className="text-xs text-text-muted font-mono">≈ €{(investment / (portfolio.rawData?.eurUsdRate || 1.08)).toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex rounded-md overflow-hidden border border-bg-border">
                        <button
                          onClick={() => setCurrency("USD")}
                          className={`px-2.5 h-7 text-xs font-medium transition-colors ${currency === "USD" ? "bg-accent-blue text-white" : "bg-bg-elevated text-text-secondary hover:text-text-primary"}`}
                        >USD</button>
                        <button
                          onClick={() => setCurrency("EUR")}
                          className={`px-2.5 h-7 text-xs font-medium transition-colors ${currency === "EUR" ? "bg-accent-blue text-white" : "bg-bg-elevated text-text-secondary hover:text-text-primary"}`}
                        >EUR</button>
                      </div>
                      <button
                        onClick={() => setFractional(!fractional)}
                        className={`px-2.5 h-7 text-xs font-medium rounded-md border transition-colors ${fractional ? "bg-accent-blue text-white border-accent-blue" : "border-bg-border bg-bg-elevated text-text-secondary hover:text-text-primary"}`}
                      >
                        {fractional ? "Fractional ON" : "Fractional"}
                      </button>
                    </div>
                    {investment > 0 && (
                      <AllocationBreakdown
                        results={portfolio.results}
                        rawData={portfolio.rawData}
                        investment={investment}
                        currency={currency}
                        fractional={fractional}
                        t={t}
                      />
                    )}
                  </div>
                )}
                <CorrelationMatrix results={portfolio.results} loading={portfolio.loading} />
                <BenchmarkComparison results={portfolio.results} loading={portfolio.loading} />
                <EfficientFrontierChart results={portfolio.results} loading={portfolio.loading} />
                <NormalizedReturnsChart rawData={portfolio.rawData} loading={portfolio.loading} />
              </div>
            )}

            <MethodologyPanel />
          </div>
        </div>
      </main>

      <footer className="border-t py-4 mt-8">
        <p className="text-xs text-text-muted text-center">{t("footer")}</p>
      </footer>

      {printMode === "ready" && createPortal(
        <PrintReport
          results={portfolio.results}
          settings={portfolio.settings}
          rawData={portfolio.rawData}
          lang={lang}
          t={t}
          investment={investment}
          currency={currency}
          fractional={fractional}
        />,
        document.body
      )}
    </div>
  )
}

function AllocationBreakdown({ results, rawData, investment, currency, fractional, t }) {
  const prices = rawData.usdPrices
  const rate = rawData.eurUsdRate || 1.08
  const symbol = currency === "USD" ? "$" : "€"
  const [expandedSet, setExpandedSet] = useState(new Set())

  function toggleExpanded(ticker) {
    setExpandedSet(prev => {
      const next = new Set(prev)
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker)
      return next
    })
  }

  const details = results.stockDetails.map(d => {
    const priceArr = prices[d.ticker]
    const lastPrice = priceArr?.[priceArr.length - 1] || 0
    const allocated = investment * d.weight
    const shares = lastPrice > 0 ? (fractional ? allocated / lastPrice : Math.floor(allocated / lastPrice)) : 0
    return { ...d, lastPrice, allocated, shares }
  })

  function fmt(n) { return currency === "EUR" ? n / rate : n }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("allocation.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-text-muted mb-3">
          {t("allocation.total")}: <span className="font-mono font-medium text-text-primary">{symbol}{fmt(investment).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-tabular-nums">
            <thead>
              <tr className="border-b text-xs text-text-secondary uppercase tracking-wide">
                <th className="w-6 sm:hidden pb-2 pt-0" />
                <th className="text-left pb-2 font-medium">{t("weights.ticker")}</th>
                <th className="text-right pb-2 font-medium">{t("weights.weight")}</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">{t("allocation.amount")}</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">{t("allocation.price")}</th>
                <th className="text-right pb-2 font-medium">{t("allocation.shares")}</th>
              </tr>
            </thead>
            <tbody>
              {details.map(d => {
                const isExpanded = expandedSet.has(d.ticker)
                return (
                  <Fragment key={d.ticker}>
                    <tr
                      onClick={() => toggleExpanded(d.ticker)}
                      className={`border-b last:border-0 sm:hover:bg-accent-blue/8 transition-colors sm:cursor-default cursor-pointer ${isExpanded ? "bg-accent-blue/8" : ""}`}
                    >
                      <td className="py-2 sm:hidden text-text-muted">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="py-2 text-sm font-medium text-text-primary">{d.ticker}</td>
                      <td className="py-2 text-right font-mono text-sm text-text-secondary">{(d.weight * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right font-mono text-sm text-text-primary hidden sm:table-cell">{symbol}{fmt(d.allocated).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-sm text-text-secondary hidden sm:table-cell">{symbol}{fmt(d.lastPrice).toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-sm text-text-primary">{fractional ? d.shares.toFixed(4) : d.shares}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="sm:hidden border-b border-bg-border">
                        <td colSpan={6} className="p-0">
                          <div className="px-9 pb-3 pt-0 space-y-1.5 text-xs">
                            <div className="flex justify-center gap-6">
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("weights.weight")}</span>
                                <span className="font-mono text-text-primary block text-center">{(d.weight * 100).toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("allocation.amount")}</span>
                                <span className="font-mono text-text-primary block text-center">{symbol}{fmt(d.allocated).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("allocation.price")}</span>
                                <span className="font-mono text-text-secondary block text-center">{symbol}{fmt(d.lastPrice).toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-text-muted uppercase tracking-wide text-[10px] block text-center">{t("allocation.shares")}</span>
                                <span className="font-mono text-text-primary block text-center">{fractional ? d.shares.toFixed(4) : d.shares}</span>
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  )
}
