import { useLanguage } from "../lib/i18n.jsx"
import { Check, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

const STEP_KEYS = ["step1", "step2", "step3", "step4", "step5", "step6", "step7"]

export default function ProgressStepper({ currentStep, loading }) {
  const { t } = useLanguage()
  if (!loading) return null

  return (
    <div className="w-full py-4" role="progressbar" aria-label="Optimization progress" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={7}>
      <div className="flex items-center justify-between mb-3">
        {STEP_KEYS.map((key, i) => {
          const num = i + 1
          return (
            <div key={num} className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300",
                num < currentStep && "border-accent-green bg-accent-green/10 text-accent-green",
                num === currentStep && "border-accent-blue bg-accent-blue text-white animate-pulse",
                num > currentStep && "border-bg-border text-text-muted"
              )}>
                {num < currentStep ? <Check className="h-4 w-4" /> : num === currentStep ? <Loader2 className="h-4 w-4 animate-spin" /> : num}
              </div>
              <span className={cn(
                "text-[10px] mt-1 text-center leading-tight hidden sm:block",
                num <= currentStep ? "text-text-primary" : "text-text-muted"
              )}>
                {t("progress." + key)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative h-1 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent-blue rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (STEP_KEYS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
