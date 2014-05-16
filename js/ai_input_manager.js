function AIInputManager(ai, moveTimeMillis) {
  this.ai = ai;

  this.MAX_MOVE_TIME = 1500; //milliseconds
  this.MIN_MOVE_TIME = 1;
  this.moveTimeMillis = moveTimeMillis || this.MIN_MOVE_TIME;

  this.events = {};

}

AIInputManager.prototype.init = function () {

  this.setMovesPerSecond(this.moveTimeMillis);

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
};

AIInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

AIInputManager.prototype.restart = function (event) { 
    event.preventDefault(); 
      this.emit("restart"); 
}; 
 
AIInputManager.prototype.keepPlaying = function (event) { 
    event.preventDefault(); 
      this.emit("keepPlaying"); 
}; 

AIInputManager.prototype.emitNextMove = function () {
    var move = this.ai.getNextMove(this.gameManager.getGrid);
    this.emit("move", move);
};

AIInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = []; 
  }
  this.events[event].push(callback);
};

AIInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    }); 
  }
};

AIInputManager.prototype.stop = function () {
    clearInterval(this.interval);
};

AIInputManager.prototype.reset = function () {
    this.stop();
    this.init();
};

AIInputManager.prototype.setMovesPerSecond = function (millisPerMove) {
    millisPerMove = Math.min(millisPerMove, this.MAX_MOVE_TIME);
    millisPerMove = Math.max(millisPerMove, this.MIN_MOVE_TIME);
    this.moveTimeMillis = millisPerMove;

    try {
      clearInterval(this.interval);
    } catch (e) {}

    this.interval = setInterval(this.emitNextMove.bind(this), this.moveTimeMillis );
};

AIInputManager.prototype.setRate = function (rate) {
    var range = this.MAX_MOVE_TIME - this.MIN_MOVE_TIME
    var moveTimeMillis = this.MAX_MOVE_TIME - (rate * range);  
    this.setMovesPerSecond(moveTimeMillis);
};

AIInputManager.prototype.setGameManager = function (GM) {
    this.gameManager = GM;
};

if (typeof window === 'undefined') {
  module.exports = AIInputManager;
}
