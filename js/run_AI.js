var sys = require('sys');
var AIPlayer = require('./ai_player.js');
var AIInputManager = require('./ai_input_manager.js');
var DummyActuator = require('./dummy_actuator.js');
var GameManager = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');


var opts = {
    verbose: false
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    if (val === '--verbose') {
        opts.verbose = true;
    }
    else {
        sys.puts('Invalid argument ' + val);
        process.exit(1);
    }
});

var aiPlayer = new AIPlayer();
var aiInputManager = new AIInputManager(aiPlayer);

var GM = new GameManager(4, aiInputManager, DummyActuator, LocalStorageManager);
aiInputManager.on("move", function(dir) {
    if (GM.isGameTerminated()) {
        aiInputManager.stop();
        var score = GM.score;
        sys.puts('Game over! Score - ' + score);
    }
    else {
        if (opts.verbose) {
            sys.puts('Move ' + mapMove(dir) );
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
