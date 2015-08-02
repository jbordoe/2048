var sys = require('sys');
var AIPlayer = require('./ai_player.js');
var AIWeights = require('./ai_weights.js');
var AIInputManager = require('./ai_input_manager.js');
var DummyActuator = require('./dummy_actuator.js');
var GameManager = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');

var opts = {
    verbose: false,
    weightKey: AIWeights.MAXVAL,
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    if (val === '--verbose' || val === '-v') {
        opts.verbose = true;
    }
    else if (val.match(/(-w|--weight_key)=\w+/)) {
        opts.weightKey = val.split('=')[1];
    }
    else if (val === '--help') {
        help();
        process.exit(0);
    }
    else {
        console.warn('Invalid argument ' + val);
        process.exit(1);
    }
});

function help() {
    var helpStr =
"USAGE: run_AI.js [OPTIONS]\r\n" +
'\r\n'+
'Perform a run of 2048 game with an AI\r\n' +
'\r\n'+
'Options:\r\n' +
'    --weights_key -w\r\n' +
'        Use weights specified by the given key. Must correspond to a key under "weightSets" in ai-weights.json.\r\n' +
'        Default: ' + AIWeights.MAXVAL + '\r\n' +
'\r\n'+
'    --verbose\r\n' +
'        Print detailed output.\r\n' +
'\r\n'+
'    --help\r\n' +
'        Display this help dialog.\r\n' +
'\r\n';

    console.log(helpStr);
}

var aiPlayer = new AIPlayer( AIWeights.get(opts.weightKey).weights );
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
