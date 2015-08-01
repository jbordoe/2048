var sys = require('sys');
var AIPlayer = require('./ai_player.js');
var AIWeights = require('./ai_weights.js');
var AIInputManager = require('./ai_input_manager.js');
var DummyActuator = require('./dummy_actuator.js');
var GameManager = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');

var opts = {
    verbose: false
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    if (val === '--verbose' || val === '-v') {
        opts.verbose = true;
    }
    else {
        sys.puts('Invalid argument ' + val);
        process.exit(1);
    }
});

var aiPlayer = new AIPlayer( AIWeights.get(AIWeights.MAXVAL).weights );
var aiInputManager = new AIInputManager(aiPlayer);

var GM = new GameManager(4, aiInputManager, DummyActuator, LocalStorageManager);
aiInputManager.on("move", function(dir) {
    if (GM.isGameTerminated()) {
        aiInputManager.stop();
        var score = GM.score;
        console.log('Game over!');
        console.log('Score - ' + score);
        console.log('Max Cell Value - ' + GM.grid.maxValue());
    }
    else {
        if (opts.verbose) {
            console.log('Move ' + mapMove(dir) );
        }
    }
});

aiInputManager.init();

function mapMove(move) {
    var map = {
        0: '^',
        1: '>',
        2: 'v',
        3: '<'
    };
    return map[move];
}
