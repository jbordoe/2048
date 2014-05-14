
function AIPlayer() {
    this.weights = {
        RANDOM: 1
    };
}

// Our AI player is really dumb for now
AIPlayer.prototype.getNextMove = function (gameGrid) {
    return Math.floor(Math.random() * 4)
}

// Extract attributes from game grid with which to make a decision
AIPlayer.prototype.getGridStats = function(gameGrid) {
    return;
}

if (typeof window === 'undefined') {
  module.exports = AIPlayer;
}
