if (typeof window === 'undefined') {
  var AIWeights = require('./ai_weights.js');
  var Grid      = require('./grid.js');
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

AIPlayer.prototype.setGameManager = function(GM) {
    this.GM = GM;
}

// Our AI player is really dumb for now
AIPlayer.prototype.getNextMove = function (gameGrid) {
  var gridCells = gameGrid.cells;
//  var gridStats = this.getGridStats(gameGrid);
  var gridStats = this.getFutureGridStates(gameGrid); 

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
        lockedCells: 0,
    };
    var cols = [0,0,0,0];
    var rows = [0,0,0,0];
    var maxVal = 0;

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
                if (gridCells[x][y].value > maxVal) {
                    maxVal = gridCells[x][y].value;
                }
            }
        }
    }
    stats.maxVal = maxVal;

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

                var isLocked = true;
                for (var offset in [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:0,y:1}]) {
                    if (typeof grid[x+offset.x] === 'undefined') continue;
                    if (typeof grid[x+offset.x][y+offset.y] === 'undefined') continue;
                    if (grid[x+offset.x][y+offset.y] === null) isLocked = false; break;
                    if (grid[x+offset.x][y+offset.y] === grid[x][y]) isLocked = false; break;
                }
            }
        }
    }
    stats.filledCols = cols.reduce(function(total, thisCol) {
        return total + (thisCol == grid.size ? 1 : 0);
    }, 0);
    stats.filledRows = cols.reduce(function(total, thisCol) {
        return total + (thisCol == grid.size ? 1 : 0);
    }, 0);

    return stats;
};

AIPlayer.prototype.getFutureGridStates = function(grid) {
    var futureStates = {};
    // 0: up, 1: right, 2: down, 3: left
    for (var direction in [0,1,2,3]) {
        if (!grid.canMove(direction)) {
            continue;
        }

        var gridState = grid.serialize();
        var nextGrid = new Grid(this.GM.size, gridState.cells);
        this.GM.move(direction, nextGrid);
        futureStates[direction] = this.getGridStats(nextGrid);
    }
    return futureStates;
}

AIPlayer.prototype.evaluate = function (gridStats, grid) {
  var dirScores = {
    up:    this.weights.upBias || 0,
    down:  this.weights.downBias || 0,
    left:  this.weights.leftBias || 0,
    right: this.weights.rightBias || 0,
  };
  
  var d2index = { 'up': 0, 'right': 1, 'down': 2, 'left': 3 };
  var dirs = ['up', 'down', 'left', 'right'];
  for ( i = 0; i < dirs.length; i++ ) {
    var dir = dirs[i];
    if (!gridStats[ d2index[dir] ]) { //We can't move in this direction
        continue;
    }
    for(var key in this.weights) {
      if (!this.weights[key] || key === 'bias' || key === 'score') {
        continue;
      }
      else if (key === 'randomBias') {
        dirScores[dir] = dirScores[dir] + (Math.random()*2-1) * this.weights[key];
      }
      else {
        dirScores[dir] = dirScores[dir] + (gridStats[ d2index[dir] ][key] || 0) * this.weights[key];
      }
    }
  }

  var bestScore = -Number.MAX_VALUE;
  var bestDir;

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
