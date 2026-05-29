import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useLanguage } from "../lib/i18n.jsx"

export default function MethodologyPanel() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState({})
  const { t } = useLanguage()

  const sections = t("methodology.sections")

  return (
    <Card>
      <CardContent className="p-0">
        <button
          aria-label={t("methodology.title")}
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors rounded-lg"
        >
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider border-l-2 border-accent-blue pl-3">{t("methodology.title")}</span>
          {open ? <ChevronDown className="h-4 w-4 text-text-secondary" /> : <ChevronRight className="h-4 w-4 text-text-secondary" />}
        </button>
        {open && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 border-t pt-3">
            {sections.map((s) => (
              <div key={s.title} className="border rounded-lg overflow-hidden">
                <button
                  aria-label={`Toggle ${s.title}`}
                  onClick={() => setExpanded(p => ({ ...p, [s.title]: !p[s.title] }))}
                  className="w-full flex items-center justify-between p-3 text-xs text-left hover:bg-bg-elevated transition-colors"
                >
                  <span className="font-medium text-text-primary pr-2">{s.title}</span>
                  {expanded[s.title] ? <ChevronDown className="h-3 w-3 shrink-0 text-text-secondary" /> : <ChevronRight className="h-3 w-3 shrink-0 text-text-secondary" />}
                </button>
                {expanded[s.title] && (
                  <div className="px-3 pb-3 text-xs text-text-secondary space-y-1">
                    <p>{s.content}</p>
                    {s.ref && <p className="italic text-text-muted mt-1">{s.ref}</p>}
                  </div>
                )}
              </div>
            ))}
            <p className="text-xs text-text-muted italic mt-3 pt-2 border-t">
              {t("methodology.disclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
