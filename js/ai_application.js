// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {

  var aiPlayer = new AIPlayer(AIWeights.get( AIWeights.SCORE ).weights );
  var aiInputManager = new AIInputManager(aiPlayer);

  var GM = new GameManager(4, aiInputManager, HTMLActuator, LocalStorageManager);
  aiPlayer.setGameManager(GM);
  aiInputManager.init();
});
