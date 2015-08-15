if (typeof window === 'undefined') {
  var AIWeights = require('./ai_weights.js');
}

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
AIPlayer.prototype.getGridStats = function(grid) {

    var gridCells = grid.cells;

    var stats = {
        vPairs: 0,
        hPairs: 0,
    };
    var cols = [0,0,0,0];
    var rows = [0,0,0,0];

    for (x = 0; x < gridCells.length; x++) {
        var prevY = null;
        for (y = 0; y < gridCells[0].length; y++) {
            if (gridCells[x][y] === null) {
                if (!stats.emptyCells) stats.emptyCells = 0;
                stats.emptyCells++;
            }
            else {
                cols[x]++;
                rows[y]++;
            }

            if (gridCells[x][y] != null) {
                if (prevY != null && gridCells[x][y].value === prevY) {
                    stats.vPairs++;
                    prevY = null;
                }
                else {
                    prevY = gridCells[x][y].value;
                }
            }
        }
    }

    stats.emptyCells /= (gridCells.length * gridCells[0].length);

    for (y = 0; y < gridCells[0].length; y++) {
        var prevX = null;
        for (x= 0; x < gridCells.length; x++) {
            if (gridCells[x][y] != null) {
                if (prevX != null && gridCells[x][y].value === prevX) {
                    stats.hPairs++;
                    prevX = null;
                }
                else {
                    prevX = gridCells[x][y].value;
                }
            }
        }
    }


    return stats;
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
        dirScores[dir] = dirScores[dir] + (Math.random()*2-1) * this.weights[key][dir];
      }
      else {
        dirScores[dir] = dirScores[dir] + (gridStats[key] || 0) * this.weights[key][dir];
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
