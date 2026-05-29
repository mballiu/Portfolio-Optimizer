import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { useLanguage } from "../lib/i18n.jsx"

export default function SettingsPanel({ settings, onUpdate, disabled }) {
  const { t } = useLanguage()

  const periods = [
    { value: "3mo", label: "3mo" },
    { value: "6mo", label: "6mo" },
    { value: "1y", label: "1y" },
    { value: "2y", label: "2y" },
    { value: "5y", label: "5y" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t("settings.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block text-text-primary" id="period-label">{t("settings.timePeriod")}</label>
            <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-labelledby="period-label">
              {periods.map(p => (
                <button
                  key={p.value}
                  aria-label={p.label}
                  role="radio"
                  aria-checked={settings.period === p.value}
                  onClick={() => onUpdate({ period: p.value })}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    settings.period === p.value
                      ? "bg-accent-blue text-white border-accent-blue"
                      : "border-bg-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">{t("settings.periodTip")}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block text-text-primary" id="mode-label">{t("settings.mode")}</label>
            <div className="flex gap-1.5" role="radiogroup" aria-labelledby="mode-label">
              <button
                aria-label={t("settings.minVariance")}
                role="radio"
                aria-checked={settings.mode === "minVariance"}
                onClick={() => onUpdate({ mode: "minVariance" })}
                disabled={disabled}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                  settings.mode === "minVariance"
                    ? "bg-accent-blue text-white border-accent-blue"
                    : "border-bg-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                {t("settings.minVariance")}
              </button>
              <button
                aria-label={t("settings.maxSharpe")}
                role="radio"
                aria-checked={settings.mode === "maxSharpe"}
                onClick={() => onUpdate({ mode: "maxSharpe" })}
                disabled={disabled}
                className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                  settings.mode === "maxSharpe"
                    ? "bg-accent-blue text-white border-accent-blue"
                    : "border-bg-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                {t("settings.maxSharpe")}
              </button>
            </div>
            <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">{t("settings.modeTip")}</p>
          </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block text-text-primary" htmlFor="rf-rate">{t("settings.rfRate")}</label>
          <Input
            id="rf-rate"
            aria-label={t("settings.rfRate")}
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={settings.rf}
            onChange={e => onUpdate({ rf: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
          />
          <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{t("settings.rfRateTip")}</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-text-primary" htmlFor="short-toggle">{t("settings.shortSelling")}</label>
          <button
            id="short-toggle"
            aria-label={t("settings.shortSelling")}
            role="switch"
            aria-checked={settings.allowShort}
            onClick={() => onUpdate({ allowShort: !settings.allowShort })}
            disabled={disabled}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings.allowShort ? "bg-accent-blue" : "bg-bg-elevated"
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              settings.allowShort ? "translate-x-[18px]" : "translate-x-[3px]"
            }`} />
          </button>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">{t("settings.shortSellingTip")}</p>
      </CardContent>
    </Card>
  )
}
