/**
 * Default-Konfiguration für Assets und Presets
 */
var AppConfig = {
  startYear: new Date().getFullYear(),

  colors: [
    '#f7931a', '#3d9eff', '#00d4aa', '#ff6b35',
    '#a855f7', '#ec4899', '#14b8a6', '#f59e0b',
    '#6366f1', '#ef4444', '#22d3ee', '#84cc16'
  ],

  defaults: [
    {
      type: 'crypto',
      ticker: 'BTC',
      displayTicker: 'BITCOIN',
      name: '\u20BF BTC',
      exchange: '',
      apiSymbol: 'bitcoin',
      price: 68400,
      quantity: 1.25,
      quantityLabel: 'BTC',
      cagr: 25,
      removable: false
    },
    {
      type: 'stock',
      ticker: 'MSTR',
      displayTicker: 'NASDAQ: MSTR',
      name: '\u26A1 Strategy',
      exchange: 'NASDAQ',
      apiSymbol: 'MSTR',
      price: 133.53,
      quantity: 40,
      quantityLabel: 'Shares',
      cagr: 35,
      removable: true
    },
    {
      type: 'stock',
      ticker: 'MTPLF',
      displayTicker: 'TYO: 3350',
      name: 'Metaplanet',
      flag: 'jp',
      exchange: 'TYO',
      apiSymbol: 'MTPLF',
      price: 2.10,
      quantity: 2100,
      quantityLabel: 'Shares',
      cagr: 38,
      removable: true
    }
  ],

  newAssetTemplate: {
    type: 'stock',
    ticker: '',
    displayTicker: '',
    name: '',
    exchange: '',
    apiSymbol: '',
    price: 0,
    quantity: 0,
    quantityLabel: 'Shares',
    cagr: 25,
    removable: true
  },

  presets: [
    { nameKey: 'conservative', cagrs: [20, 30, 33, 25, 25, 25, 25, 25, 25, 25, 25, 25] },
    { nameKey: 'moderate',     cagrs: [30, 40, 44, 35, 35, 35, 35, 35, 35, 35, 35, 35] },
    { nameKey: 'bullish',      cagrs: [40, 50, 55, 45, 45, 45, 45, 45, 45, 45, 45, 45] },
    { nameKey: 'ultra_bull',   cagrs: [60, 70, 77, 65, 65, 65, 65, 65, 65, 65, 65, 65] }
  ],

  eurRateDefault: 1.09,

  api: {
    coingecko: 'https://api.coingecko.com/api/v3/simple/price',
    finnhub: 'https://finnhub.io/api/v1/quote'
  },

  cacheTTL: 5 * 60 * 1000,

  defaultYears: 10,
  maxYears: 30
};
