/**
 * App Bootstrap - Initialisierung
 */
(function() {
  // 1. State laden
  StateManager.init();

  // 2. Finnhub Key wiederherstellen
  var keyInput = document.getElementById('finnhub-key-input');
  if (keyInput && AppState.finnhubKey) {
    keyInput.value = AppState.finnhubKey;
  }

  // 3. Currency-Toggle aus State
  if (AppState.currency === 'EUR') {
    document.getElementById('btn-usd').classList.remove('active');
    document.getElementById('btn-eur').classList.add('active');
  }

  // 4. Event-Listener binden (vor Rendering, da Events delegiert sind)
  Events.init();

  // 5. Initiales Rendering (generiert alle Cards, Totals, Table dynamisch)
  UI.render();

  // 6. Chart initialisieren + update
  PortfolioChart.init();
  PortfolioChart.update();

  // 7. Price-Status initial setzen
  AppState.assets.forEach(function(a, i) {
    UI.renderPriceStatus(i, 'default');
  });

  // 8. Live-Preise laden
  API.fetchAllPrices();
})();
