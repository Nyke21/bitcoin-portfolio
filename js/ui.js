/**
 * DOM-Rendering: Alles dynamisch aus State generiert
 */
var UI = {
  render: function() {
    this.renderHeader();
    this.renderAssetCards();
    this.renderPresets();
    this.renderApiSettings();
    this.renderTotals();
    this.renderChartTitle();
    this.renderMilestones();
    this.renderTable();
    this.renderFootnote();
    this.renderYearsControl();
    this.renderLightning();
  },

  renderHeader: function() {
    var h1 = document.getElementById('main-title');
    if (h1) h1.innerHTML = t('title');

    var sub = document.getElementById('main-subtitle');
    if (sub) sub.textContent = t('subtitle');

    var badge = document.getElementById('date-badge');
    if (badge) {
      var d = new Date();
      var dd = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      badge.textContent = t('date_prefix') + ' ' + dd + '.' + mm + '.' + d.getFullYear();
    }

    document.querySelectorAll('.lang-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.lang === AppState.lang);
    });
  },

  renderAssetCards: function() {
    var container = document.getElementById('asset-cards');
    if (!container) return;

    var html = '';
    AppState.assets.forEach(function(a, i) {
      var color = StateManager.getColor(i);
      var nowVal = a.price * a.quantity;
      var isCrypto = a.type === 'crypto';
      var qtyText = isCrypto
        ? a.quantity + ' ' + a.quantityLabel
        : a.quantity.toLocaleString('de-DE') + ' ' + a.quantityLabel;

      html += '<div class="panel asset-card" data-index="' + i + '" style="--ac-color:' + color + '">';
      html += '<div class="ac-top">';
      html += '<div>';
      html += '<div class="ac-ticker-row">';
      html += '<span class="ac-ticker">' + UI._esc(a.displayTicker) + '</span>';
      if (a.removable) {
        html += '<button class="ac-edit-btn" data-action="edit" data-index="' + i + '" title="' + t('edit_asset') + '">';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
        html += '</button>';
      }
      html += '</div>';
      var nameHtml = UI._esc(a.name);
      if (a.flag) {
        nameHtml = '<img class="ac-flag" src="https://flagcdn.com/w40/' + a.flag + '.png" alt="" width="20" height="14"> ' + nameHtml;
      }
      html += '<div class="ac-name">' + nameHtml + '</div>';
      html += '</div>';
      html += '<div class="ac-holdings">';
      html += '<div class="ac-qty ac-qty-editable" data-action="edit-qty" data-index="' + i + '" title="' + t('click_to_edit') + '">' + qtyText + '</div>';
      html += '<div class="ac-now">' + Calc.fmt(nowVal) + '</div>';
      html += '<div class="ac-price-status" data-index="' + i + '"></div>';
      html += '</div>';
      html += '</div>';

      // Slider + CAGR input
      html += '<div class="ac-display-bottom">';
      html += '<div class="slider-wrap">';
      html += '<div class="slider-label">';
      html += '<span>' + t('cagr_label') + '</span>';
      html += '<div class="cagr-row">';
      html += '<input type="number" class="cagr-input" data-action="cagr-input" data-index="' + i + '" value="' + a.cagr + '" min="-10" max="100" step="1" style="color:' + color + '">';
      html += '<span class="cagr-pct" style="color:' + color + '">%</span>';
      html += '</div>';
      html += '</div>';
      html += '<input type="range" data-action="slider" data-index="' + i + '" min="-10" max="100" step="1" value="' + a.cagr + '" style="--thumb-color:' + color + '">';
      html += '<div class="slider-range"><span>-10%</span><span>0%</span><span>+50%</span><span>+100%</span></div>';
      html += '</div>';
      html += '</div>';

      // Edit mode
      if (a.removable) {
        html += '<div class="ac-edit-mode">';
        html += '<div class="ac-edit-row"><label>' + t('ticker_symbol') + '</label>';
        html += '<input type="text" class="ac-edit-input" data-field="ticker" data-index="' + i + '" value="' + UI._esc(a.ticker) + '"></div>';
        html += '<div class="ac-edit-row"><label>' + t('display_name') + '</label>';
        html += '<input type="text" class="ac-edit-input" data-field="name" data-index="' + i + '" value="' + UI._esc(a.name) + '"></div>';
        html += '<div class="ac-edit-row"><label>' + t('exchange_market') + '</label>';
        html += '<input type="text" class="ac-edit-input" data-field="exchange" data-index="' + i + '" value="' + UI._esc(a.exchange) + '"></div>';
        html += '<div class="ac-edit-row"><label>' + t('current_price') + '</label>';
        html += '<div class="ac-price-row">';
        html += '<input type="number" class="ac-edit-input" data-field="price" data-index="' + i + '" value="' + a.price + '" step="0.01" min="0">';
        html += '<button class="ac-fetch-btn" data-action="fetch" data-index="' + i + '">' + t('load') + '</button>';
        html += '</div></div>';
        html += '<div class="ac-edit-row"><label>' + t('quantity') + '</label>';
        html += '<input type="number" class="ac-edit-input" data-field="qty" data-index="' + i + '" value="' + a.quantity + '" step="any" min="0"></div>';
        html += '<div class="ac-edit-actions">';
        html += '<button class="ac-done-btn" data-action="done" data-index="' + i + '">' + t('done') + '</button>';
        html += '<button class="ac-remove-btn" data-action="remove" data-index="' + i + '">' + t('remove') + '</button>';
        html += '</div>';
        html += '</div>';
      }

      html += '</div>';
    });

    // Add asset button
    html += '<button class="panel add-asset-btn" data-action="add-asset">' + t('add_asset') + '</button>';

    container.innerHTML = html;
  },

  renderPresets: function() {
    var container = document.getElementById('preset-btns');
    if (!container) return;

    var label = document.getElementById('presets-label');
    if (label) label.textContent = t('presets_label');

    var html = '';
    AppConfig.presets.forEach(function(p, pi) {
      var cagrText = '';
      AppState.assets.forEach(function(a, ai) {
        var val = p.cagrs[ai] !== undefined ? p.cagrs[ai] : p.cagrs[p.cagrs.length - 1];
        if (ai > 0) cagrText += ' / ';
        cagrText += a.ticker + ' ' + val;
      });
      html += '<button class="preset-btn" data-action="preset" data-preset="' + pi + '">';
      html += t(p.nameKey) + '<br><small>' + cagrText + '</small>';
      html += '</button>';
    });
    container.innerHTML = html;
  },

  renderApiSettings: function() {
    var label = document.getElementById('api-settings-label');
    if (label) label.textContent = t('api_settings');
    var keyLabel = document.getElementById('api-key-label');
    if (keyLabel) keyLabel.textContent = t('api_key_label');
    var input = document.getElementById('finnhub-key-input');
    if (input) input.placeholder = t('api_key_placeholder');

    var el = document.getElementById('api-status');
    if (!el) return;
    if (AppState.finnhubKey) {
      el.textContent = t('api_connected');
      el.className = 'settings-status connected';
    } else {
      el.textContent = t('api_disconnected');
      el.className = 'settings-status disconnected';
    }
  },

  renderTotals: function() {
    var container = document.getElementById('totals-rows');
    if (!container) return;

    var titleEl = document.getElementById('totals-title');
    if (titleEl) titleEl.textContent = t('today_values');

    var html = '';
    var grandTotal = 0;
    AppState.assets.forEach(function(a, i) {
      var val = a.price * a.quantity;
      grandTotal += val;
      html += '<div class="total-row"><span class="tr-label" style="color:' + StateManager.getColor(i) + '">' + UI._esc(a.name) + '</span>';
      html += '<span class="tr-val">' + Calc.fmt(val) + '</span></div>';
    });
    container.innerHTML = html;

    var totalEl = document.getElementById('sum-total');
    if (totalEl) totalEl.textContent = Calc.fmt(grandTotal);
    var gl = document.getElementById('gt-label');
    if (gl) gl.textContent = t('total_today');
  },

  renderChartTitle: function() {
    var el = document.getElementById('chart-title');
    if (el) el.textContent = t('chart_title');
  },

  renderMilestones: function() {
    var el = document.getElementById('milestones');
    if (!el) return;
    var base = StateManager.getBaseValue();
    var yrs = AppState.years;
    var milestones;
    if (yrs <= 5) milestones = [1, 2, 3, yrs];
    else if (yrs <= 10) milestones = [1, 3, 5, yrs];
    else if (yrs <= 20) milestones = [1, 5, 10, yrs];
    else milestones = [1, 5, 15, yrs];
    // Deduplicate
    milestones = milestones.filter(function(v, i, a) { return a.indexOf(v) === i; });
    var html = '';
    milestones.forEach(function(y) {
      var d = Calc.calcYear(y);
      var mult = base > 0 ? (d.total / base).toFixed(1) : '0.0';
      html += '<div class="ms-card"><div class="ms-year">' + t('year').toUpperCase() + ' ' + y + ' \u00B7 ' + (AppConfig.startYear + y) + '</div>';
      html += '<div class="ms-val">' + Calc.fmt(d.total) + '</div>';
      html += '<div class="ms-mult">' + mult + '\u00D7 ' + t('start_capital') + '</div></div>';
    });
    el.innerHTML = html;
  },

  renderTable: function() {
    var thead = document.getElementById('tableHead');
    var tbody = document.getElementById('tableBody');
    if (!thead || !tbody) return;
    var titleEl = document.getElementById('table-title');
    if (titleEl) titleEl.textContent = t('table_title');

    var hHtml = '<tr><th>' + t('year').toUpperCase() + '</th>';
    AppState.assets.forEach(function(a, i) {
      var c = StateManager.getColor(i);
      hHtml += '<th style="color:' + c + '">' + a.ticker + '-' + t('price_suffix') + '</th>';
      hHtml += '<th style="color:' + c + '">' + a.ticker + '-' + t('value_suffix') + '</th>';
    });
    hHtml += '<th style="color:var(--gold)">' + t('total') + '</th><th>' + t('factor') + '</th></tr>';
    thead.innerHTML = hHtml;

    var base = StateManager.getBaseValue();
    var bHtml = '';
    for (var i = 0; i < AppState.years; i++) {
      var y = i + 1;
      var d = Calc.calcYear(y);
      bHtml += '<tr><td>' + t('year') + ' ' + y + ' <small style="color:var(--muted);font-size:10px">(' + (AppConfig.startYear + y) + ')</small></td>';
      d.assets.forEach(function(ad, ai) {
        var c = StateManager.getColor(ai);
        bHtml += '<td style="color:' + c + '">' + Calc.fmtRate(ad.price) + '</td>';
        bHtml += '<td style="color:' + c + '">' + Calc.fmt(ad.value) + '</td>';
      });
      bHtml += '<td class="total">' + Calc.fmt(d.total) + '</td>';
      bHtml += '<td class="mult">' + (base > 0 ? (d.total / base).toFixed(1) : '0.0') + '\u00D7</td></tr>';
    }
    tbody.innerHTML = bHtml;
  },

  renderFootnote: function() {
    var el = document.getElementById('footnote');
    if (!el) return;
    var d = new Date();
    var ds = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
    var prices = AppState.assets.map(function(a) {
      return a.ticker + ' $' + a.price.toLocaleString('de-DE', { minimumFractionDigits: 2 });
    }).join(' \u00B7 ');
    el.innerHTML = t('footnote_prices') + ' ' + ds + ': ' + prices + '<br>' + t('footnote_disclaimer') + ' \u00B7 EUR/USD: ~' + AppState.eurRate.toFixed(2);
  },

  renderLightning: function() {
    var addr = 'hertrace563@walletofsatoshi.com';
    var ti = document.getElementById('lightning-title');
    if (ti) ti.textContent = t('lightning_title');
    var tx = document.getElementById('lightning-subtitle');
    if (tx) tx.textContent = t('lightning_text');
    var btn = document.getElementById('lightning-tip-btn');
    if (btn) {
      var svg = btn.querySelector('svg');
      var svgHtml = svg ? svg.outerHTML : '';
      btn.innerHTML = svgHtml + ' ' + t('lightning_btn');
    }
    var addrEl = document.getElementById('lightning-address');
    if (addrEl) {
      addrEl.innerHTML = addr + ' <span class="copy-hint">\u00B7 ' + t('lightning_copy') + '</span>';
      addrEl.onclick = function() {
        navigator.clipboard.writeText(addr).then(function() {
          addrEl.innerHTML = '\u2713 ' + t('lightning_copied');
          addrEl.style.color = 'var(--gold)';
          setTimeout(function() {
            addrEl.style.color = '';
            UI.renderLightning();
          }, 1500);
        });
      };
    }
  },

  renderYearsControl: function() {
    var container = document.getElementById('years-control');
    if (!container) return;
    var y = AppState.years;
    var html = '<div class="presets-label">' + t('years_label') + '</div>';
    html += '<div class="years-row">';
    html += '<input type="range" id="years-slider" data-action="years-slider" min="1" max="' + AppConfig.maxYears + '" step="1" value="' + y + '" style="--thumb-color:var(--gold)">';
    html += '<div class="years-value">';
    html += '<input type="number" id="years-input" data-action="years-input" value="' + y + '" min="1" max="' + AppConfig.maxYears + '" step="1">';
    html += '<span>' + t('years_suffix') + '</span>';
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
  },

  renderPriceStatus: function(index, source) {
    var el = document.querySelector('.ac-price-status[data-index="' + index + '"]');
    if (!el) return;
    if (source === 'api') { el.textContent = t('live'); el.className = 'ac-price-status live'; }
    else if (source === 'manual') { el.textContent = t('manual'); el.className = 'ac-price-status manual'; }
    else { el.textContent = t('default_status'); el.className = 'ac-price-status'; }
  },

  _esc: function(s) {
    var div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }
};
