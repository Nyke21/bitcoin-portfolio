/**
 * Event-Delegation für dynamische Assets + CAGR Input + Language
 */
var Events = {
  init: function() {
    this.bindAssetCards();
    this.bindPresets();
    this.bindCurrency();
    this.bindApiKey();
    this.bindLanguage();
    this.bindYears();
  },

  triggerUpdate: function() {
    UI.render();
    PortfolioChart.update();
  },

  fullRebuild: function() {
    UI.render();
    PortfolioChart.buildChart();
    PortfolioChart.update();
  },

  // === ALL ASSET CARD EVENTS (delegated) ===
  bindAssetCards: function() {
    var self = this;
    var container = document.getElementById('asset-cards');
    if (!container) return;

    container.addEventListener('input', function(e) {
      var el = e.target;
      var idx = parseInt(el.dataset.index);
      var action = el.dataset.action;

      if (action === 'slider') {
        var val = parseInt(el.value);
        StateManager.updateAsset(idx, { cagr: val });
        // Sync input
        var inp = container.querySelector('.cagr-input[data-index="' + idx + '"]');
        if (inp) inp.value = val;
        self.triggerUpdate();
      }

      if (action === 'cagr-input') {
        var v = parseInt(el.value);
        if (isNaN(v)) return;
        v = Math.max(-10, Math.min(100, v));
        StateManager.updateAsset(idx, { cagr: v });
        // Sync slider
        var slider = container.querySelector('input[type=range][data-index="' + idx + '"]');
        if (slider) slider.value = v;
        self.triggerUpdate();
      }
    });

    container.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;

      var action = btn.dataset.action;
      var idx = parseInt(btn.dataset.index);

      if (action === 'edit') {
        var card = container.querySelector('.asset-card[data-index="' + idx + '"]');
        if (card) card.classList.toggle('editing');
      }

      if (action === 'done') {
        self._saveDone(idx);
      }

      if (action === 'remove') {
        StateManager.removeAsset(idx);
        self.fullRebuild();
      }

      if (action === 'add-asset') {
        var newIdx = StateManager.addAsset();
        self.fullRebuild();
        // Auto-open edit mode for new asset
        setTimeout(function() {
          var card = container.querySelector('.asset-card[data-index="' + newIdx + '"]');
          if (card) card.classList.add('editing');
        }, 50);
      }

      if (action === 'fetch') {
        self._fetchPrice(idx, btn);
      }

      if (action === 'edit-qty') {
        self._inlineQtyEdit(idx, btn);
      }
    });
  },

  _saveDone: function(idx) {
    var container = document.getElementById('asset-cards');
    var get = function(field) {
      var el = container.querySelector('[data-field="' + field + '"][data-index="' + idx + '"]');
      return el ? el.value.trim() : '';
    };

    var ticker = get('ticker').toUpperCase();
    var name = get('name');
    var exchange = get('exchange').toUpperCase();
    var price = parseFloat(get('price'));
    var qty = parseFloat(get('qty'));

    if (!ticker || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) return;

    var displayTicker = exchange ? exchange + ': ' + ticker : ticker;

    StateManager.updateAsset(idx, {
      ticker: ticker,
      displayTicker: displayTicker,
      name: name || ticker,
      exchange: exchange,
      apiSymbol: ticker,
      price: price,
      quantity: qty
    });

    var card = container.querySelector('.asset-card[data-index="' + idx + '"]');
    if (card) card.classList.remove('editing');

    this.triggerUpdate();
  },

  _fetchPrice: function(idx, btn) {
    var container = document.getElementById('asset-cards');
    var tickerEl = container.querySelector('[data-field="ticker"][data-index="' + idx + '"]');
    var ticker = tickerEl ? tickerEl.value.trim().toUpperCase() : '';
    if (!ticker) return;

    btn.textContent = '...';
    btn.disabled = true;

    API.fetchStockPrice(ticker).then(function(price) {
      if (price !== null) {
        var priceEl = container.querySelector('[data-field="price"][data-index="' + idx + '"]');
        if (priceEl) priceEl.value = price;
        btn.textContent = '\u2713';
      } else {
        btn.textContent = '\u2717';
      }
      btn.disabled = false;
      setTimeout(function() { btn.textContent = t('load'); }, 2000);
    });
  },

  _inlineQtyEdit: function(idx, el) {
    if (el.querySelector('input')) return;
    var a = AppState.assets[idx];
    var self = this;

    var input = document.createElement('input');
    input.type = 'number';
    input.className = 'ac-qty-input-inline';
    input.value = a.quantity;
    input.step = a.type === 'crypto' ? '0.001' : '1';
    input.min = '0';

    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();

    function finish() {
      var newQty = parseFloat(input.value);
      if (!isNaN(newQty) && newQty > 0) {
        StateManager.updateAsset(idx, { quantity: newQty });
      }
      self.triggerUpdate();
    }

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = a.quantity; input.blur(); }
    });
  },

  // === PRESETS (delegated) ===
  bindPresets: function() {
    var self = this;
    var container = document.getElementById('preset-btns');
    if (!container) return;

    container.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action="preset"]');
      if (!btn) return;

      var pi = parseInt(btn.dataset.preset);
      var preset = AppConfig.presets[pi];
      if (!preset) return;

      AppState.assets.forEach(function(a, ai) {
        var cagr = preset.cagrs[ai] !== undefined ? preset.cagrs[ai] : preset.cagrs[preset.cagrs.length - 1];
        StateManager.updateAsset(ai, { cagr: cagr });
      });

      self.triggerUpdate();
    });
  },

  // === CURRENCY ===
  bindCurrency: function() {
    var self = this;
    document.querySelectorAll('.cur-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        AppState.currency = this.dataset.cur;
        StateManager.save();
        document.querySelectorAll('.cur-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        self.triggerUpdate();
      });
    });
  },

  // === LANGUAGE ===
  bindLanguage: function() {
    var self = this;
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        AppState.lang = this.dataset.lang;
        StateManager.save();
        self.fullRebuild();
      });
    });
  },

  // === API KEY ===
  bindApiKey: function() {
    var saveBtn = document.getElementById('save-api-key');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', function() {
      var input = document.getElementById('finnhub-key-input');
      var key = input.value.trim();
      if (key) {
        AppState.finnhubKey = key;
        StateManager.save();
        UI.renderApiSettings();
        input.type = 'password';
        API.fetchAllStockPrices();
      }
    });
  },

  // === YEARS CONTROL ===
  bindYears: function() {
    var self = this;
    var container = document.getElementById('years-control');
    if (!container) return;

    container.addEventListener('input', function(e) {
      var el = e.target;
      var action = el.dataset.action;
      if (!action) return;

      var v = parseInt(el.value);
      if (isNaN(v)) return;
      v = Math.max(1, Math.min(AppConfig.maxYears, v));

      AppState.years = v;
      StateManager.save();

      if (action === 'years-slider') {
        var inp = document.getElementById('years-input');
        if (inp) inp.value = v;
      }
      if (action === 'years-input') {
        var slider = document.getElementById('years-slider');
        if (slider) slider.value = v;
      }

      self.fullRebuild();
    });
  }
};
