import { useState, useEffect } from "react"

export function useBreakpoint() {
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    function handleResize() { setWidth(window.innerWidth) }
    addEventListener("resize", handleResize)
    return () => removeEventListener("resize", handleResize)
  }, [])

  return {
    width,
    isMobile: width < 640,
    chartHeight: width < 640 ? 260 : width < 1024 ? 320 : 380,
  }
}
