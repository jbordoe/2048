var AIWeights = require('./ai_weights.js');

function AIPlayer(weights) {
    if (weights) {
        this.weights = weights;
    }
    else {
        console.warn('AIPlayer: No weights provided, using random weights');
        this.weights = AIWeights.getRandom();
    }
}

// Our AI player is really dumb for now
AIPlayer.prototype.getNextMove = function (gameGrid) {
  var gridCells = gameGrid.cells;
  var gridStats = this.getGridStats(gameGrid);

  var dir = this.evaluate(gridStats, gameGrid);
  var dirMap = { up: 0, right: 1, down: 2, left: 3 };
  return dirMap[dir];
};

// Extract attributes from game grid with which to make a decision
AIPlayer.prototype.getGridStats = function(gridCells) {
    return {};
};

AIPlayer.prototype.evaluate = function (gridStats, grid) {
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
      if (!this.weights[key] || key === 'bias' || key === 'score') {
        continue;
      }
      else if (key === 'randomBias') {
        dirScores[dir] = dirScores[dir] + Math.random() * this.weights[key][dir];
      }
      else {
        dirScores[dir] = dirScores[dir] + (gridStats[key] * this.weights[key][dir]) || 0;
      }
    }
  }

  var bestScore = -Number.MAX_VALUE;
  var bestDir;
  var d2index = { 'up': 0, 'right': 1, 'down': 2, 'left': 3 };

  for (var d in dirScores) {
    if (dirScores[d] > bestScore && grid.canMove( d2index[d] )) {
      bestScore = dirScores[d];
      bestDir = d;
    }
    // If scores are equal, choose at random
    else if (dirScores[d] == bestScore) {
       bestDir = Math.random() > 0.5 ? d : bestDir;
    }
  }
  if (bestScore === -Number.MAX_VALUE) {
    //console.log('apparently i cannae move');
    //grid.pretty();
  }

  return bestDir;
};

if (typeof window === 'undefined') {
  module.exports = AIPlayer;
}
