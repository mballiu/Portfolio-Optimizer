import { useReducer, useCallback } from "react"

const initialState = {
  tickers: [],
  settings: { period: "1y", mode: "minVariance", rf: 4.5, allowShort: false },
  step: 0,
  steps: [
    "Fetching historical prices...",
    "Detecting currencies...",
    "Converting to USD...",
    "Calculating log returns...",
    "Building covariance matrix...",
    "Running optimization...",
    "Calculating Betas vs MSCI World...",
  ],
  loading: false,
  error: null,
  results: null,
  rawData: null,
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TICKER":
      if (state.tickers.includes(action.ticker.toUpperCase())) return state
      return { ...state, tickers: [...state.tickers, action.ticker.toUpperCase()] }
    case "REMOVE_TICKER":
      return { ...state, tickers: state.tickers.filter(t => t !== action.ticker) }
    case "SET_TICKERS":
      return { ...state, tickers: action.tickers }
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case "SET_STEP":
      return { ...state, step: action.step }
    case "START_LOADING":
      return { ...state, loading: true, error: null, step: 0, results: null }
    case "SET_RESULTS":
      return { ...state, loading: false, results: action.results, rawData: action.rawData }
    case "SET_ERROR":
      return { ...state, loading: false, error: action.error }
    case "RESET":
      return initialState
    default:
      return state
  }
}

export function usePortfolio() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addTicker = useCallback((ticker) => dispatch({ type: "ADD_TICKER", ticker }), [])
  const removeTicker = useCallback((ticker) => dispatch({ type: "REMOVE_TICKER", ticker }), [])
  const setTickers = useCallback((tickers) => dispatch({ type: "SET_TICKERS", tickers }), [])
  const updateSettings = useCallback((payload) => dispatch({ type: "UPDATE_SETTINGS", payload }), [])
  const setStep = useCallback((step) => dispatch({ type: "SET_STEP", step }), [])
  const startLoading = useCallback(() => dispatch({ type: "START_LOADING" }), [])
  const setResults = useCallback((results, rawData) => dispatch({ type: "SET_RESULTS", results, rawData }), [])
  const setError = useCallback((error) => dispatch({ type: "SET_ERROR", error }), [])

  return {
    ...state,
    addTicker,
    removeTicker,
    setTickers,
    updateSettings,
    setStep,
    startLoading,
    setResults,
    setError,
    canOptimize: state.tickers.length >= 2,
  }
}
