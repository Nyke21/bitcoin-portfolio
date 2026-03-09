/**
 * Zentraler App-State mit localStorage-Persistenz
 */
var AppState = {
  currency: 'USD',
  eurRate: AppConfig.eurRateDefault,
  lang: 'en',
  years: AppConfig.defaultYears,
  assets: [],
  finnhubKey: null
};

var StateManager = {
  STORAGE_KEY: 'btc-portfolio-state-v5',

  init: function() {
    var saved = this.load();
    if (saved) {
      AppState.currency = saved.currency || 'USD';
      AppState.eurRate = saved.eurRate || AppConfig.eurRateDefault;
      AppState.lang = saved.lang || 'en';
      AppState.years = saved.years || AppConfig.defaultYears;
      AppState.finnhubKey = saved.finnhubKey || null;

      if (saved.assets && saved.assets.length > 0) {
        AppState.assets = saved.assets.map(function(s, i) {
          // Merge with defaults or template
          var def = AppConfig.defaults[i]
            ? JSON.parse(JSON.stringify(AppConfig.defaults[i]))
            : JSON.parse(JSON.stringify(AppConfig.newAssetTemplate));
          Object.keys(s).forEach(function(k) {
            if (s[k] !== undefined) def[k] = s[k];
          });
          // Ensure color index
          def.colorIndex = i;
          return def;
        });
      } else {
        this._loadDefaults();
      }
    } else {
      this._loadDefaults();
    }
  },

  _loadDefaults: function() {
    AppState.assets = AppConfig.defaults.map(function(d, i) {
      var asset = JSON.parse(JSON.stringify(d));
      asset.colorIndex = i;
      if (asset.quantity === 0) {
        asset.quantity = StateManager._randomQty(asset.type, asset.ticker);
      }
      return asset;
    });
  },

  _randomQty: function(type, ticker) {
    if (type === 'crypto') {
      // 0.1 - 3.0 BTC, rounded to 2 decimals
      return Math.round((Math.random() * 2.9 + 0.1) * 100) / 100;
    }
    if (ticker === 'MTPLF') {
      // 100 - 5000 shares, rounded to 100s
      return Math.round((Math.random() * 49 + 1)) * 100;
    }
    // Stocks: 5 - 100 shares, whole numbers
    return Math.round(Math.random() * 95 + 5);
  },

  save: function() {
    try {
      var data = {
        currency: AppState.currency,
        eurRate: AppState.eurRate,
        lang: AppState.lang,
        years: AppState.years,
        finnhubKey: AppState.finnhubKey,
        assets: AppState.assets.map(function(a) {
          return {
            type: a.type,
            ticker: a.ticker,
            displayTicker: a.displayTicker,
            name: a.name,
            exchange: a.exchange,
            apiSymbol: a.apiSymbol,
            price: a.price,
            quantity: a.quantity,
            quantityLabel: a.quantityLabel,
            cagr: a.cagr,
            removable: a.removable,
            colorIndex: a.colorIndex,
            flag: a.flag || null
          };
        })
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('State save failed:', e);
    }
  },

  load: function() {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  reset: function() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.init();
  },

  getAsset: function(index) {
    return AppState.assets[index];
  },

  updateAsset: function(index, changes) {
    var asset = AppState.assets[index];
    if (!asset) return;
    Object.keys(changes).forEach(function(k) {
      asset[k] = changes[k];
    });
    this.save();
  },

  addAsset: function() {
    var tmpl = JSON.parse(JSON.stringify(AppConfig.newAssetTemplate));
    tmpl.colorIndex = AppState.assets.length;
    tmpl.ticker = t('new_asset_ticker');
    tmpl.displayTicker = t('new_asset_ticker');
    tmpl.name = t('new_asset_name');
    AppState.assets.push(tmpl);
    this.save();
    return AppState.assets.length - 1;
  },

  removeAsset: function(index) {
    if (index < 0 || index >= AppState.assets.length) return;
    if (!AppState.assets[index].removable) return;
    AppState.assets.splice(index, 1);
    // Reassign color indices
    AppState.assets.forEach(function(a, i) { a.colorIndex = i; });
    this.save();
  },

  getBaseValue: function() {
    var total = 0;
    AppState.assets.forEach(function(a) {
      total += a.price * a.quantity;
    });
    return total;
  },

  getColor: function(index) {
    return AppConfig.colors[index % AppConfig.colors.length];
  }
};
