AIPlayer.weights = {};
AIPlayer.weights.DEFAULT = 'default';
AIPlayer.weights.RANDOM  = 'random';

AIPlayer.baseWeights = {
    random: {
        randomBias: {
            up:    1,
            down:  1,
            left:  1,
            right: 1,
        },
        bias: {
            up:    0,
            down:  0,
            left:  0,
            right: 0,
        },
    }
};

function AIPlayer() {
// TODO: Put weights into a class/prototype of their own
    this.weights = this.getWeights( AIPlayer.weights.RANDOM );
}


AIPlayer.prototype.getWeights = function (key) {
    if (AIPlayer.baseWeights[key]) {
        return AIPlayer.baseWeights[key];
    } else {
        throw new Error('Unrecognised weight class: ' + key);
    }
};

// Our AI player is really dumb for now
AIPlayer.prototype.getNextMove = function (gameGrid) {
  var gridCells = gameGrid.cells;
  var gridStats = this.getGridStats(gameGrid);

  var dir = this.evaluate(gridStats);
  var dirMap = { up: 0, right: 1, down: 2, left: 3 };
  return dirMap[dir];
};

// Extract attributes from game grid with which to make a decision
AIPlayer.prototype.getGridStats = function(gridCells) {
  return;
};

AIPlayer.prototype.evaluate = function (gridStats) {
  var dirScores = {
    up:    this.weights.bias.up || 0,
    down:  this.weights.bias.down || 0,
    left:  this.weights.bias.left || 0,
    right: this.weights.bias.right || 0,
  };
  
  var dirs = ['up', 'down', 'left', 'right'];
  for ( i = 0; i < dirs.length; i++ ) {
    var dir = dirs[i];
    for(var key in this.weights) {
      if (!this.weights[key] || key === 'bias') {
        continue;
      }
      else if (key === 'randomBias') {
        dirScores[dir] = dirScores[dir] + Math.random() * this.weights[key][dir];
      }
      else {
        dirScores[dir] = dirScores[dir] + gridStats[key] * this.weights[key][dir];
      }
    }
  }

  var bestScore = -Number.MAX_VALUE;
  var bestDir;
  for (var d in dirScores) {
    if (dirScores[d] > bestScore) {
      bestScore = dirScores[d];
      bestDir = d;
    }
    // If scores are equal, choosr at random
    else if (dirScores[d] == bestScore) {
       bestDir = Math.random() > 0.5 ? d : bestDir;
    }
  }
  return bestDir;
};

if (typeof window === 'undefined') {
  module.exports = AIPlayer;
}
