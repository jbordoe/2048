AIPlayer.weights = {};
AIPlayer.weights.DEFAULT = 'default';
AIPlayer.weights.RANDOM  = 'random';
AIPlayer.weights.BEST = 'best';

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
    },
    best: {
        randomBias: {
            up: 0.5627194778062403,
            down: 0.09584220056422055,
            left: 0.2465270005632192,
            right: 0.05382815538905561
        },
        bias: {
            up: 0.9430990228429437,
            down: 0.02594538638368249,
            left: 0.6197927463799715,
            right: 0.7116631551180035
        },
   },
};

function AIPlayer(weights) {
// TODO: Put weights into a class/prototype of their own
    if (weights === AIPlayer.weights.BEST) {
        this.weights = this.getWeights( AIPlayer.weights.BEST );
    }
    else {
        this.weights = weights || this.getWeights( AIPlayer.weights.RANDOM );
    }
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
