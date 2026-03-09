/**
 * Projektions-Mathematik und Formatierungs-Funktionen
 */
var Calc = {
  sym: function() {
    return AppState.currency === 'EUR' ? '\u20AC' : '$';
  },

  conv: function(v) {
    return AppState.currency === 'EUR' ? v / AppState.eurRate : v;
  },

  fmt: function(v) {
    var c = this.conv(v);
    if (c >= 1e9) return this.sym() + (c / 1e9).toFixed(2) + 'B';
    if (c >= 1e6) return this.sym() + (c / 1e6).toFixed(2) + 'M';
    if (c >= 1e3) return this.sym() + Math.round(c).toLocaleString('de-DE');
    return this.sym() + c.toFixed(2);
  },

  fmtRate: function(v) {
    var c = this.conv(v);
    if (c >= 1e9) return this.sym() + (c / 1e9).toFixed(3) + 'B';
    if (c >= 1e6) return this.sym() + (c / 1e6).toFixed(3) + 'M';
    if (c >= 1e3) return this.sym() + Math.round(c).toLocaleString('de-DE');
    return this.sym() + c.toFixed(2);
  },

  pctStr: function(v) {
    return (v >= 0 ? '+' : '') + v + '%';
  },

  /**
   * Berechnet den Wert jedes Assets nach y Jahren
   * @returns {{ assets: [{value, price}], total }}
   */
  calcYear: function(y) {
    var total = 0;
    var assets = AppState.assets.map(function(a) {
      var growth = Math.pow(1 + a.cagr / 100, y);
      var value = a.price * a.quantity * growth;
      var price = a.price * growth;
      total += value;
      return { value: value, price: price };
    });
    return { assets: assets, total: total };
  }
};
