import { useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { getRegion, regionColor, PRESET_PORTFOLIOS } from "../lib/utils"
import { useLanguage } from "../lib/i18n.jsx"
import { X, Plus, Sparkles } from "lucide-react"

export default function StockInput({ tickers, companyNames = {}, onAdd, onRemove, onSetTickers, disabled }) {
  const { t } = useLanguage()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  function handleAdd() {
    const ticker = value.trim().toUpperCase()
    if (!ticker) return
    if (!/^[A-Z0-9]{1,5}(\.[A-Z]{2,4})?$/.test(ticker)) {
      setError(t("stockInput.invalidTicker"))
      return
    }
    if (tickers.length >= 15) {
      setError(t("stockInput.maxStocks"))
      return
    }
    if (tickers.includes(ticker)) {
      setError(t("stockInput.alreadyAdded"))
      return
    }
    onAdd(ticker)
    setValue("")
    setError("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {t("stockInput.title")}
          <span className="text-xs text-text-muted font-normal">{tickers.length}/15</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              aria-label={t("stockInput.add")}
              placeholder={t("stockInput.placeholder")}
              value={value}
              onChange={e => { setValue(e.target.value); setError("") }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
            {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
          </div>
          <Button aria-label={t("stockInput.add")} onClick={handleAdd} disabled={disabled || !value.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_PORTFOLIOS.map(p => (
            <Button
              key={p.labelKey}
              variant="outline"
              size="sm"
              onClick={() => onSetTickers(p.tickers)}
              disabled={disabled}
              aria-label={`${t("presets.load")} ${t("presets." + p.labelKey)}`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {t("presets." + p.labelKey)}
            </Button>
          ))}
        </div>

        {tickers.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tickers.map(sym => (
              <div
                key={sym}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all hover:border-text-muted"
              >
                <div className="flex flex-col">
                  <span className="font-medium leading-tight text-text-primary">{sym}</span>
                  {companyNames[sym] && companyNames[sym] !== sym && (
                    <span className="text-[10px] text-text-secondary leading-tight">{companyNames[sym]}</span>
                  )}
                </div>
                <Badge className={regionColor(getRegion(sym))}>{getRegion(sym)}</Badge>
                <button
                  aria-label={`${t("stockInput.remove")} ${sym}`}
                  onClick={() => onRemove(sym)}
                  disabled={disabled}
                  className="ml-0.5 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
