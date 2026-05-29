# Portfolio Optimizer

A web application for optimizing investment portfolios using Modern Portfolio Theory (Markowitz). Built with React 19, Vite, Tailwind CSS, Recharts, and mathjs.

**Live demo:** [portfolio-optimizer-pied.vercel.app](https://portfolio-optimizer-pied.vercel.app/)

## Features

- **Portfolio Optimization** — Solve for Minimum Variance or Maximum Sharpe Ratio portfolios using quadratic programming.
- **Stock Input** — Add stock tickers with automatic company name resolution. Supports US, European, and international exchanges.
- **Historical Data** — Fetches historical prices from Yahoo Finance with dual-strategy API (spark batching + sequential chart fallback).
- **Currency Conversion** — Automatically detects ticker currencies by exchange suffix and converts all prices to USD via EUR/USD rate.
- **Efficient Frontier** — Interactive scatter chart showing the efficient frontier, optimal portfolio, and random portfolios.
- **Portfolio Metrics** — Expected annual return, annual volatility, Sharpe ratio, portfolio beta.
- **Weights Table** — Per-stock weights with region, beta, expected return, recommendation, and progress bars. Expandable rows on mobile.
- **Correlation Matrix** — Color-coded matrix showing pairwise stock correlations.
- **Benchmark Comparison** — Compares optimized portfolio against equal-weight baseline.
- **Investment Allocation** — Enter an investment amount and see exact per-stock allocation, current prices, and shares (with fractional shares toggle and EUR/USD display).
- **Beta Calculation** — CAPM beta against MSCI World (URTH) market proxy.
- **PDF Export** — Export a full report via the browser's print dialog.
- **Dark / Light Mode** — Persistent theme toggle with localStorage.
- **Internationalization** — Full English and Greek (Ελληνικά) support.
- **Responsive Design** — Optimized for desktop and mobile with expandable rows and adaptive layouts.

## Technologies

- **React 19** — UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS v4** — Utility-first CSS with `@theme` design tokens
- **Recharts** — Charting library (scatter, line, bar)
- **mathjs** — Matrix operations and quadratic programming optimization
- **Yahoo Finance API** — Historical price data (v8/finance/chart, v8/finance/spark)
- **ESLint** — Code quality

## Getting Started

```
npm install
npm run dev
```

## Build

```
npm run build
```

## Usage

1. Add stock tickers (e.g., AAPL, MSFT, SAP.DE) in the Stocks panel.
2. Configure settings: time period, optimization mode, risk-free rate, short selling.
3. Click "Optimize Portfolio" to run the optimizer.
4. View results: weights, metrics, efficient frontier, correlation matrix, benchmark comparison.
5. Enter an investment amount in the Allocation section to see required shares.
6. Export a PDF report using the Export PDF button.
