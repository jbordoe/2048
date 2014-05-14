function AIInputManager(rate, ai) {
    this.rate = rate; //how often to make a move (in milliseconds)
    this.ai = ai;

    this.events = {};
}

AIInputManager.prototype.init = function () {
    this.interval = setInterval(this.emitNextMove.bind(this), this.rate );
};

AIInputManager.prototype.emitNextMove = function () {
    var move = this.ai.getNextMove();
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

AIInputManager.prototype.setRate = function (rate) {
    this.rate = rate;
};

if (typeof window === 'undefined') {
  module.exports = AIInputManager;
}
