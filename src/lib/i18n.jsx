import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const en = {
  header: {
    title: "Portfolio Optimizer",
    subtitle: "Academic tool • Not investment advice",
  },
  langToggle: { en: "EN", el: "ΕΛ" },
  empty: {
    title: "Optimize your portfolio",
    desc: 'Add at least 2 stocks and click "Optimize Portfolio" to begin.',
  },
  settings: {
    title: "Settings",
    timePeriod: "Time Period",
    mode: "Optimization Mode",
    minVariance: "Min Variance",
    maxSharpe: "Max Sharpe",
    rfRate: "Risk-Free Rate (%)",
    shortSelling: "Allow Short Selling",
    periodTip:
      "How far back to look for historical price data. A longer window captures more business cycles and market regimes, making the covariance estimates more stable. A shorter window reacts faster to recent market conditions but may overfit to the current regime. For long-term investors, 3–5 years is typical.",
    modeTip:
      "Min Variance finds the portfolio with the lowest possible volatility regardless of expected return — ideal for conservative investors prioritizing capital preservation. Max Sharpe maximizes return per unit of risk (Sharpe ratio), finding the tangency portfolio on the efficient frontier — the most efficient risk/reward trade-off.",
    rfRateTip:
      "The theoretical return of a risk-free asset (e.g. government bonds). A higher risk-free rate increases the return required to justify taking risk, shifting the efficient frontier upward and potentially reducing equity allocations in the optimal portfolio. Typical values: 3–5% (long-term average).",
    shortSellingTip:
      "When enabled, the optimizer can assign negative weights to some stocks, using proceeds to increase others. This expands the feasible set of portfolios and can improve the efficient frontier, but it introduces leverage and unlimited downside risk. Disabled by default for conservative use.",
  },
  stockInput: {
    title: "Stocks",
    placeholder: "e.g. AAPL, SAP.DE, ALPHA.AT",
    invalidTicker: "Invalid ticker format",
    maxStocks: "Maximum 15 stocks",
    alreadyAdded: "Ticker already added",
    add: "Add ticker",
    remove: "Remove",
  },
  presets: {
    techGiants: "Tech Giants",
    euDiversified: "EU Diversified",
    mixedGlobal: "Mixed Global",
    load: "Load",
  },
  optimize: {
    button: (n) => `Optimize Portfolio (${n} stocks)`,
    running: "Optimizing...",
  },
  progress: {
    step1: "Fetching prices",
    step2: "Detecting currencies",
    step3: "Converting to USD",
    step4: "Calculating returns",
    step5: "Building covariance",
    step6: "Running optimizer",
    step7: "Calculating Betas",
  },
  metrics: {
    annReturn: "Expected Ann. Return",
    annVol: "Annual Volatility",
    sharpe: "Sharpe Ratio",
    stocks: "Stocks",
    portfolioBeta: "Portfolio Beta",
    annReturnTip:
      "The annualized return the portfolio is expected to generate based on historical average returns.",
    annVolTip:
      "The annualized standard deviation of portfolio returns. Higher = more risk.",
    sharpeTip:
      "Return per unit of risk: (Return − Risk-Free Rate) / Volatility. Higher is better. Above 1.0 is considered good.",
    stocksTip: "Number of stocks currently in the portfolio.",
    portfolioBetaTip:
      "The weighted average sensitivity of the portfolio to market movements. β < 1 = less volatile than market. β > 1 = more volatile than market.",
  },
  weights: {
    title: "Portfolio Weights",
    ticker: "Ticker",
    region: "Region",
    weight: "Weight",
    bar: "Bar",
    beta: "Beta",
    expRet: "Exp. Ret.",
    rec: "Rec",
    lowRisk: "Low risk",
    market: "Market",
    highRisk: "High risk",
    buy: "Buy",
    hold: "Hold",
    sell: "Sell",
    legend: "Legend",
    legendHide: "Hide legend",
    betaLegend:
      "Beta measures a stock's sensitivity to market movements. β=1 means the stock moves with the market. β<1 means it's less volatile. β>1 means it's more volatile.",
    recLegend:
      "Buy: positive expected return AND Beta < 1.5. Hold: expected return near 0 OR Beta between 1.2–1.5. Sell: negative expected return OR Beta > 1.5.",
    limitedData: "⚠ Limited data — results may be unreliable",
    globalWarning:
      "⚠ Some tickers have limited trading data — results may be unreliable.",
  },
  frontier: {
    title: "Efficient Frontier",
    volatility: "Volatility (%)",
    return: "Return (%)",
    optimal: (mode) =>
      mode === "minVariance" ? "Optimal (Min Var)" : "Optimal (Max Sharpe)",
    minVar: "Min Variance",
    random: "Random",
  },
  prices: {
    title: "Price Evolution (Base 100)",
    base: "Base 100",
  },
  correlation: {
    title: "Correlation Matrix",
    explanation:
      "Stocks with lower correlation reduce portfolio risk through diversification.",
    tooltip: (a, b, v) => `${a} and ${b}: correlation = ${v.toFixed(2)}`,
  },
  equalWeight: {
    title: "Benchmark Comparison",
    metric: "Metric",
    optimized: "Optimized",
    equalWeight: "Equal Weight",
    return: "Return",
    volatility: "Volatility",
    sharpe: "Sharpe",
    note: "Equal-weight is a naive baseline. Optimization aims to improve risk-adjusted returns.",
  },
  allocation: {
    title: "Investment Allocation",
    invest: "Investment Amount",
    total: "Total Investment",
    amount: "Allocated",
    price: "Price",
    shares: "Shares",
  },
  benchmark: {
    title: "Benchmark Comparison",
  },
  methodology: {
    title: "Methodology & References",
    sections: [
      {
        title: "0. How This App Works",
        ref: "",
        content:
          'Enter stock tickers (e.g. AAPL, MSFT), configure settings (time period, optimization mode, risk-free rate), then click "Optimize Portfolio". The app fetches historical prices from Yahoo Finance and converts all non-USD prices to USD using the EUR/USD exchange rate. Daily log returns are calculated and a covariance matrix is built. The optimizer then solves for either the Minimum Variance or Maximum Sharpe Ratio portfolio using quadratic programming. Results are displayed as portfolio weights, performance metrics, efficient frontier chart, correlation matrix, and benchmark comparison. You can enter an investment amount (e.g. $10,000) and the app automatically calculates how much to invest in each stock based on the optimal weights, showing the exact number of shares to buy and the current price per share. A PDF report can be exported with all results, and you can toggle between dark/light mode and English/Greek.',
      },
      {
        title: "1. Historical Returns & Covariance (Markowitz 1952)",
        ref: "Markowitz, H. (1952). Portfolio Selection. The Journal of Finance, 7(1), 77–91.",
        content:
          "Daily log returns are calculated as ln(Pₜ/Pₜ₋₁) for each stock. The covariance matrix captures how stocks move together. The diagonal represents each stock's variance (risk), and off-diagonal elements represent co-movements. All non-USD prices are first converted to USD using the EUR/USD exchange rate.",
      },
      {
        title: "2. Minimum Variance Optimization (Markowitz 1952)",
        ref: "Markowitz, H. (1952). Portfolio Selection. The Journal of Finance, 7(1), 77–91.",
        content:
          "The Minimum Variance portfolio minimizes portfolio risk (volatility) without regard to expected return. It solves: minimize w'Σw subject to Σwᵢ = 1, wᵢ ≥ 0 (no short sales). The solution lies on the leftmost point of the efficient frontier.",
      },
      {
        title: "3. Maximum Sharpe Ratio (Sharpe 1964)",
        ref: "Sharpe, W.F. (1964). Capital Asset Prices. The Journal of Finance, 19(3), 425–442.",
        content:
          "The Sharpe Ratio measures return per unit of risk: (Rₚ − R𝒻)/σₚ. The Maximum Sharpe portfolio maximizes this ratio, finding the tangency point where the Capital Market Line touches the efficient frontier. This is the 'optimal' risky portfolio in CAPM.",
      },
      {
        title: "4. Beta & CAPM (Sharpe 1964, Lintner 1965)",
        ref: "Sharpe, W.F. (1964). Capital Asset Prices. The Journal of Finance, 19(3), 425–442.",
        content:
          "Beta measures a stock's sensitivity to market movements: βᵢ = Cov(Rᵢ, Rₘ)/Var(Rₘ). We use the MSCI World ETF (URTH) as our market proxy. A β > 1 means the stock amplifies market movements; β < 1 means it dampens them.",
      },
      {
        title: "5. International Diversification & Currency (Solnik 1974)",
        ref: "Solnik, B. (1974). An International Market Model of Security Price Behavior. Journal of Financial and Quantitative Analysis, 9(4), 537–554.",
        content:
          "International portfolios face currency risk. This tool detects ticker currency by exchange suffix (e.g., .DE = EUR, .MI = EUR) and converts all prices to USD using the EUR/USD exchange rate (EURUSD=X). This aligns with the International CAPM framework.",
      },
      {
        title: "Limitations & Assumptions",
        ref: "",
        content:
          "• Historical data does not guarantee future results. • Returns are assumed to be normally distributed (fat tails ignored). • Covariance is assumed stationary over the selected period. • All currency conversion uses EUR/USD as proxy for non-USD pairs. • The optimizer may find local rather than global optima. • MSCI World (URTH) is an imperfect proxy for the global market portfolio. • Transaction costs, taxes, and liquidity constraints are ignored.",
      },
    ],
    disclaimer:
      "Disclaimer: This tool is for educational and informational purposes only. It does not constitute investment advice. Past performance is not indicative of future results. All investment decisions should be made with the advice of a qualified financial professional.",
  },
  exportBtn: "Export Results",
  exportPdf: "Export PDF",
  generating: "Generating...",
  printDate: "Generated on",
  printPeriod: "Period",
  printMode: "Mode",
  error: { title: "Error" },
  footer: "Portfolio Optimizer © 2026 All rights reserved",
};

const el = {
  header: {
    title: "Portfolio Optimizer",
    subtitle: "Ακαδημαϊκό εργαλείο • Δεν αποτελεί επενδυτική συμβουλή",
  },
  langToggle: { en: "EN", el: "ΕΛ" },
  empty: {
    title: "Βελτιστοποιήστε το χαρτοφυλάκιό σας",
    desc: 'Προσθέστε τουλάχιστον 2 μετοχές και κάντε κλικ στο "Βελτιστοποίηση Χαρτοφυλακίου" για να ξεκινήσετε.',
  },
  settings: {
    title: "Ρυθμίσεις",
    timePeriod: "Χρονική Περίοδος",
    mode: "Τρόπος Βελτιστοποίησης",
    minVariance: "Ελάχιστη Διακύμανση",
    maxSharpe: "Μέγιστο Sharpe",
    rfRate: "Επιτόκιο Μηδενικού Κινδύνου (%)",
    shortSelling: "Επιτρέπονται Ανοικτές Πωλήσεις",
    periodTip:
      "Πόσο πίσω να αναζητηθούν ιστορικά δεδομένα τιμών. Μεγαλύτερο παράθυρο συλλαμβάνει περισσότερους κύκλους αγοράς, κάνοντας τις εκτιμήσεις συνδιακύμανσης πιο σταθερές. Μικρότερο παράθυρο αντιδρά ταχύτερα σε πρόσφατες συνθήκες αλλά μπορεί να υπερπροσαρμοστεί. Για μακροπρόθεσμους επενδυτές, 3–5 έτη είναι τυπικό.",
    modeTip:
      "Ελάχιστη Διακύμανση βρίσκει το χαρτοφυλάκιο με τη χαμηλότερη δυνατή μεταβλητότητα ανεξαρτήτως απόδοσης — ιδανικό για συντηρητικούς επενδυτές. Μέγιστο Sharpe μεγιστοποιεί την απόδοση ανά μονάδα κινδύνου, βρίσκοντας το εφαπτόμενο χαρτοφυλάκιο στο αποτελεσματικό σύνορο.",
    rfRateTip:
      "Η θεωρητική απόδοση ενός στοιχείου μηδενικού κινδύνου (π.χ. κρατικά ομόλογα). Υψηλότερο επιτόκιο αυξάνει την απαιτούμενη απόδοση για την ανάληψη κινδύνου, μετατοπίζοντας το αποτελεσματικό σύνορο προς τα πάνω. Τυπικές τιμές: 3–5% (μακροπρόθεσμος μέσος όρος).",
    shortSellingTip:
      "Όταν ενεργοποιηθεί, ο βελτιστοποιητής μπορεί να εκχωρήσει αρνητικές σταθμίσεις σε ορισμένες μετοχές, χρησιμοποιώντας τα έσοδα για να αυξήσει άλλες. Αυτό διευρύνει το σύνορο αλλά εισάγει μόχλευση και απεριόριστο κίνδυνο. Απενεργοποιημένο από προεπιλογή.",
  },
  stockInput: {
    title: "Μετοχές",
    placeholder: "π.χ. AAPL, SAP.DE, ALPHA.AT",
    invalidTicker: "Μη έγκυρη μορφή ticker",
    maxStocks: "Μέγιστο 15 μετοχές",
    alreadyAdded: "Το ticker έχει ήδη προστεθεί",
    add: "Προσθήκη ticker",
    remove: "Αφαίρεση",
  },
  presets: {
    techGiants: "Τεχνολογικοί Γίγαντες",
    euDiversified: "Ευρωπαϊκή Διαφοροποίηση",
    mixedGlobal: "Μικτό Παγκόσμιο",
    load: "Φόρτωση",
  },
  optimize: {
    button: (n) => `Βελτιστοποίηση Χαρτοφυλακίου (${n} μετοχές)`,
    running: "Βελτιστοποίηση...",
  },
  progress: {
    step1: "Λήψη τιμών",
    step2: "Ανίχνευση νομισμάτων",
    step3: "Μετατροπή σε USD",
    step4: "Υπολογισμός αποδόσεων",
    step5: "Δημιουργία πίνακα συνδιακύμανσης",
    step6: "Εκτέλεση βελτιστοποίησης",
    step7: "Υπολογισμός Beta",
  },
  metrics: {
    annReturn: "Αναμενόμενη Ετήσια Απόδοση",
    annVol: "Ετήσια Μεταβλητότητα",
    sharpe: "Δείκτης Sharpe",
    stocks: "Μετοχές",
    portfolioBeta: "Beta Χαρτοφυλακίου",
    annReturnTip:
      "Η ετήσια απόδοση που αναμένεται να δημιουργήσει το χαρτοφυλάκιο βάσει των ιστορικών μέσων αποδόσεων.",
    annVolTip:
      "Η ετήσια τυπική απόκλιση των αποδόσεων του χαρτοφυλακίου. Υψηλότερη = περισσότερος κίνδυνος.",
    sharpeTip:
      "Απόδοση ανά μονάδα κινδύνου: (Απόδοση − Επιτόκιο Μηδενικού Κινδύνου) / Μεταβλητότητα. Υψηλότερο = καλύτερο. Άνω του 1.0 θεωρείται καλό.",
    stocksTip: "Αριθμός μετοχών που περιλαμβάνονται στο χαρτοφυλάκιο.",
    portfolioBetaTip:
      "Η σταθμισμένη μέση ευαισθησία του χαρτοφυλακίου στις κινήσεις της αγοράς. β < 1 = λιγότερο ασταθές από την αγορά. β > 1 = πιο ασταθές από την αγορά.",
  },
  weights: {
    title: "Σταθμίσεις Χαρτοφυλακίου",
    ticker: "Ticker",
    region: "Περιοχή",
    weight: "Βάρος",
    bar: "Ράβδος",
    beta: "Beta",
    expRet: "Αναμ. Απόδ.",
    rec: "Σύστ.",
    lowRisk: "Χαμηλού κινδύνου",
    market: "Αγορά",
    highRisk: "Υψηλού κινδύνου",
    buy: "Αγορά",
    hold: "Διακράτηση",
    sell: "Πώληση",
    legend: "Υπόμνημα",
    legendHide: "Απόκρυψη υπομνήματος",
    betaLegend:
      "Το Beta μετρά την ευαισθησία μιας μετοχής στις κινήσεις της αγοράς. β=1 σημαίνει ότι η μετοχή κινείται με την αγορά. β<1 σημαίνει λιγότερο ασταθής. β>1 σημαίνει πιο ασταθής.",
    recLegend:
      "Αγορά: θετική αναμενόμενη απόδοση ΚΑΙ Beta < 1.5. Διακράτηση: απόδοση κοντά στο 0 Ή Beta μεταξύ 1.2–1.5. Πώληση: αρνητική απόδοση Ή Beta > 1.5.",
    limitedData:
      "⚠ Περιορισμένα δεδομένα — τα αποτελέσματα μπορεί να είναι αναξιόπιστα",
    globalWarning:
      "⚠ Ορισμένες μετοχές έχουν περιορισμένα δεδομένα — τα αποτελέσματα μπορεί να είναι αναξιόπιστα.",
  },
  frontier: {
    title: "Αποτελεσματικό Σύνορο",
    volatility: "Μεταβλητότητα (%)",
    return: "Απόδοση (%)",
    optimal: (mode) =>
      mode === "minVariance"
        ? "Βέλτιστο (Ελ. Διακ.)"
        : "Βέλτιστο (Μέγ. Sharpe)",
    minVar: "Ελάχ. Διακύμανση",
    random: "Τυχαία",
  },
  prices: {
    title: "Εξέλιξη Τιμής (Βάση 100)",
    base: "Βάση 100",
  },
  correlation: {
    title: "Πίνακας Συσχέτισης",
    explanation:
      "Οι μετοχές με χαμηλότερη συσχέτιση μειώνουν τον κίνδυνο χαρτοφυλακίου μέσω διαφοροποίησης.",
    tooltip: (a, b, v) => `${a} και ${b}: συσχέτιση = ${v.toFixed(2)}`,
  },
  equalWeight: {
    title: "Σύγκριση με Baseline",
    metric: "Μέτρο",
    optimized: "Βελτιστοποιημένο",
    equalWeight: "Ίσα Βάρη",
    return: "Απόδοση",
    volatility: "Μεταβλητότητα",
    sharpe: "Sharpe",
    note: "Τα ίσα βάρη είναι μια απλή βάση σύγκρισης. Η βελτιστοποίηση στοχεύει στη βελτίωση των αποδόσεων με προσαρμογή κινδύνου.",
  },
  allocation: {
    title: "Κατανομή Επένδυσης",
    invest: "Ποσό Επένδυσης",
    total: "Συνολική Επένδυση",
    amount: "Ποσό",
    price: "Τιμή",
    shares: "Μετοχές",
  },
  benchmark: {
    title: "Σύγκριση με Baseline",
  },
  methodology: {
    title: "Μεθοδολογία & Αναφορές",
    sections: [
      {
        title: "0. Πώς Λειτουργεί η Εφαρμογή",
        ref: "",
        content:
          'Εισάγετε tickers μετοχών (π.χ. AAPL, MSFT), διαμορφώστε τις ρυθμίσεις (χρονική περίοδο, τρόπο βελτιστοποίησης, επιτόκιο μηδενικού κινδύνου) και κάντε κλικ στο "Βελτιστοποίηση Χαρτοφυλακίου". Η εφαρμογή λαμβάνει ιστορικές τιμές από το Yahoo Finance και μετατρέπει όλες τις τιμές σε μη-USD σε USD με τη συναλλαγματική ισοτιμία EUR/USD. Υπολογίζονται ημερήσιες λογαριθμικές αποδόσεις και δημιουργείται πίνακας συνδιακύμανσης. Ο βελτιστοποιητής λύνει είτε για Ελάχιστη Διακύμανση είτε για Μέγιστο Sharpe χρησιμοποιώντας τετραγωνικό προγραμματισμό. Τα αποτελέσματα εμφανίζονται ως σταθμίσεις χαρτοφυλακίου, μετρικές απόδοσης, γράφημα αποτελεσματικού συνόρου, πίνακας συσχέτισης και σύγκριση με baseline. Μπορείτε να εισάγετε ένα ποσό επένδυσης (π.χ. €10.000) και η εφαρμογή υπολογίζει αυτόματα πόσο να επενδύσετε σε κάθε μετοχή βάσει των βέλτιστων σταθμίσεων, δείχνοντας τον ακριβή αριθμό μετοχών προς αγορά και την τρέχουσα τιμή ανά μετοχή. Μπορείτε να εξάγετε αναφορά PDF με όλα τα αποτελέσματα και να εναλλάσσεστε μεταξύ σκούρου/φωτεινού θέματος και Αγγλικών/Ελληνικών.',
      },
      {
        title: "1. Ιστορικές Αποδόσεις & Συνδιακύμανση (Markowitz 1952)",
        ref: "Markowitz, H. (1952). Portfolio Selection. The Journal of Finance, 7(1), 77–91.",
        content:
          "Οι ημερήσιες λογαριθμικές αποδόσεις υπολογίζονται ως ln(Pₜ/Pₜ₋₁) για κάθε μετοχή. Ο πίνακας συνδιακύμανσης καταγράφει πώς κινούνται μαζί οι μετοχές. Η διαγώνιος αντιπροσωπεύει τη διακύμανση (κίνδυνο) κάθε μετοχής και τα εκτός διαγωνίου στοιχεία αντιπροσωπεύουν συν-κινήσεις.",
      },
      {
        title: "2. Βελτιστοποίηση Ελάχιστης Διακύμανσης (Markowitz 1952)",
        ref: "Markowitz, H. (1952). Portfolio Selection. The Journal of Finance, 7(1), 77–91.",
        content:
          "Το χαρτοφυλάκιο Ελάχιστης Διακύμανσης ελαχιστοποιεί τον κίνδυνο (μεταβλητότητα) χαρτοφυλακίου χωρίς να λαμβάνει υπόψη την αναμενόμενη απόδοση. Λύνει: ελαχιστοποίηση w'Σw υπό Σwᵢ = 1, wᵢ ≥ 0.",
      },
      {
        title: "3. Μέγιστος Δείκτης Sharpe (Sharpe 1964)",
        ref: "Sharpe, W.F. (1964). Capital Asset Prices. The Journal of Finance, 19(3), 425–442.",
        content:
          "Ο δείκτης Sharpe μετρά την απόδοση ανά μονάδα κινδύνου: (Rₚ − R𝒻)/σₚ. Το χαρτοφυλάκιο Μέγιστου Sharpe μεγιστοποιεί αυτόν τον δείκτη, βρίσκοντας το σημείο εφαπτομένης όπου η Γραμμή Κεφαλαιαγοράς αγγίζει το αποτελεσματικό σύνορο.",
      },
      {
        title: "4. Beta & CAPM (Sharpe 1964, Lintner 1965)",
        ref: "Sharpe, W.F. (1964). Capital Asset Prices. The Journal of Finance, 19(3), 425–442.",
        content:
          "Το Beta μετρά την ευαισθησία μιας μετοχής στις κινήσεις της αγοράς: βᵢ = Cov(Rᵢ, Rₘ)/Var(Rₘ). Χρησιμοποιούμε το ETF MSCI World (URTH) ως αντιπρόσωπο της αγοράς.",
      },
      {
        title: "5. Διεθνής Διαφοροποίηση & Νόμισμα (Solnik 1974)",
        ref: "Solnik, B. (1974). An International Market Model of Security Price Behavior. Journal of Financial and Quantitative Analysis, 9(4), 537–554.",
        content:
          "Τα διεθνή χαρτοφυλάκια αντιμετωπίζουν νομισματικό κίνδυνο. Αυτό το εργαλείο ανιχνεύει το νόμισμα ticker από το επίθεμα ανταλλαγής (π.χ., .DE = EUR, .MI = EUR) και μετατρέπει όλες τις τιμές σε USD.",
      },
      {
        title: "Περιορισμοί & Παραδοχές",
        ref: "",
        content:
          "• Τα ιστορικά δεδομένα δεν εγγυώνται μελλοντικά αποτελέσματα. • Οι αποδόσεις θεωρούνται κανονικά κατανεμημένες. • Η συνδιακύμανση θεωρείται σταθερή κατά την επιλεγμένη περίοδο. • Όλες οι μετατροπές νομισμάτων χρησιμοποιούν EUR/USD. • Ο βελτιστοποιητής μπορεί να βρει τοπικά και όχι καθολικά βέλτιστα. • Το MSCI World (URTH) είναι ατελές υποκατάστατο της αγοράς.",
      },
    ],
    disclaimer:
      "Αποποίηση: Αυτό το εργαλείο προορίζεται μόνο για εκπαιδευτικούς και ενημερωτικούς σκοπούς. Δεν αποτελεί επενδυτική συμβουλή. Οι παρελθούσες επιδόσεις δεν αποτελούν ένδειξη μελλοντικών αποτελεσμάτων.",
  },
  exportBtn: "Εξαγωγή Αποτελεσμάτων",
  exportPdf: "Εξαγωγή PDF",
  generating: "Δημιουργία...",
  printDate: "Δημιουργήθηκε στις",
  printPeriod: "Περίοδος",
  printMode: "Τρόπος",
  error: { title: "Σφάλμα" },
  footer: "Portfolio Optimizer © 2026 Με επιφύλαξη παντός δικαιώματος",
};

const languages = { en, el };

const LangContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("lang") || "en";
    } catch {
      return "en";
    }
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "el" : "en";
      try {
        localStorage.setItem("lang", next);
      } catch {}
      return next;
    });
  }, []);

  const t = useCallback(
    (key, ...args) => {
      const keys = key.split(".");
      let val = languages[lang];
      for (const k of keys) {
        val = val?.[k];
      }
      if (typeof val === "function") return val(...args);
      return val ?? key;
    },
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
