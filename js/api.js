/**
 * API-Integration: CoinGecko (BTC) + Finnhub (Aktien) - dynamisch für N Assets
 */
var API = {
  fetchBtcPrice: function() {
    // Find BTC asset index
    var btcIdx = -1;
    AppState.assets.forEach(function(a, i) { if (a.type === 'crypto' && a.apiSymbol === 'bitcoin') btcIdx = i; });
    if (btcIdx < 0) return Promise.resolve(null);

    var cacheKey = 'btc-price-cache';
    var cached = this._getCache(cacheKey);
    if (cached) {
      this._applyBtcPrice(cached, btcIdx);
      return Promise.resolve(cached);
    }

    var url = AppConfig.api.coingecko + '?ids=bitcoin&vs_currencies=usd,eur';

    return fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('CoinGecko HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data && data.bitcoin) {
          var result = { usd: data.bitcoin.usd, eur: data.bitcoin.eur };
          API._setCache(cacheKey, result);
          API._applyBtcPrice(result, btcIdx);
          return result;
        }
        throw new Error('Invalid CoinGecko response');
      })
      .catch(function(err) {
        console.warn('BTC price fetch failed:', err.message);
        UI.renderPriceStatus(btcIdx, 'default');
        return null;
      });
  },

  _applyBtcPrice: function(data, idx) {
    StateManager.updateAsset(idx, { price: data.usd });
    if (data.usd && data.eur) {
      AppState.eurRate = data.usd / data.eur;
      StateManager.save();
    }
    UI.renderPriceStatus(idx, 'api');
  },

  fetchStockPrice: function(symbol) {
    if (!AppState.finnhubKey) return Promise.resolve(null);

    var cacheKey = 'stock-price-' + symbol;
    var cached = this._getCache(cacheKey);
    if (cached !== null) return Promise.resolve(cached);

    var url = AppConfig.api.finnhub + '?symbol=' + encodeURIComponent(symbol) +
      '&token=' + encodeURIComponent(AppState.finnhubKey);

    return fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('Finnhub HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data && data.c && data.c > 0) {
          API._setCache(cacheKey, data.c);
          return data.c;
        }
        return null;
      })
      .catch(function(err) {
        console.warn('Stock price fetch failed for ' + symbol + ':', err.message);
        return null;
      });
  },

  fetchAllStockPrices: function() {
    var promises = [];
    AppState.assets.forEach(function(a, i) {
      if (a.type === 'stock' && a.apiSymbol) {
        var p = API.fetchStockPrice(a.apiSymbol)
          .then(function(price) {
            if (price !== null) {
              StateManager.updateAsset(i, { price: price });
              UI.renderPriceStatus(i, 'api');
            } else {
              UI.renderPriceStatus(i, 'manual');
            }
          });
        promises.push(p);
      }
    });
    return Promise.all(promises).then(function() {
      Events.triggerUpdate();
    });
  },

  fetchAllPrices: function() {
    return Promise.all([
      this.fetchBtcPrice(),
      this.fetchAllStockPrices()
    ]).then(function() {
      Events.triggerUpdate();
    });
  },

  _getCache: function(key) {
    try {
      var raw = sessionStorage.getItem(key);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (Date.now() - cached.ts > AppConfig.cacheTTL) { sessionStorage.removeItem(key); return null; }
      return cached.data;
    } catch (e) { return null; }
  },

  _setCache: function(key, data) {
    try { sessionStorage.setItem(key, JSON.stringify({ data: data, ts: Date.now() })); } catch (e) {}
  }
};
