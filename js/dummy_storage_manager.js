function DummyStorageManager() {
}

DummyStorageManager.prototype.localStorageSupported = function () {
};

DummyStorageManager.prototype.getBestScore = function () {
};

DummyStorageManager.prototype.setBestScore = function (score) {
};

DummyStorageManager.prototype.getGameState = function () {
};

DummyStorageManager.prototype.setGameState = function (gameState) {
};

DummyStorageManager.prototype.clearGameState = function () {
};

if (typeof window === 'undefined') {
  module.exports = DummyStorageManager;
}
