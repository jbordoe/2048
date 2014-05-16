// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {

  var aiPlayer = new AIPlayer();
  var aiInputManager = new AIInputManager(aiPlayer);

  new GameManager(4, aiInputManager, HTMLActuator, DummyStorageManager);
  aiInputManager.init();
});
