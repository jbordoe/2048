#!/usr/bin/env node

var fs          = require('fs');
var gnuplot     = require('gnuplot');
var ProgressBar = require('progress');
var tmp         = require('tmp');

var AIInputManager      = require('./ai_input_manager.js');
var AIPlayer            = require('./ai_player.js');
var AIWeights           = require('./ai_weights.js');
var DummyActuator       = require('./dummy_actuator.js');
var GameManager         = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');

var opts = {
    verbose: false,
    weightKey: AIWeights.MAXVAL,
    runs: 1,
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    if (val === '--verbose' || val === '-v') {
        opts.verbose = true;
    }
    else if (val.match(/(-w|--weight_key)=\w+/)) {
        opts.weightKey = val.split('=')[1];
    }
    else if (val.match(/(-r|--runs)=\d+/)) {
        opts.runs = parseInt(val.split('=')[1]);
    }
    else if (val.match(/(-o|--outpath)=.+/)) {
        opts.plotPath = val.split('=')[1];
    }
    else if (val.match(/(-p|--plot)=(maxval|score)/)) {
        opts.plotVal = val.split('=')[1];
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

if (opts.plotPath && !opts.plotVal) {
    console.warn('Must provide measure to plot.');
    console.log('Run with --help for more details');
    process.exit(1);
}

function help() {
    var helpStr =
"USAGE: run_AI.js [OPTIONS]\r\n" +
'\r\n'+
'Perform a run of 2048 game with an AI\r\n' +
'\r\n'+
'Options:\r\n' +
'    --weights_key -w\r\n' +
'        Use weights specified by the given key.\r\n' +
'        Must correspond to a either a key under "weightSets" in ai-weights.json or "random".\r\n' +
'        Default: ' + AIWeights.MAXVAL + '\r\n' +
'    --runs -r\r\n' +
'        How many games the AI player should run\r\n' + 
'    --plot -p\r\n' +
'        Plot histogram of results for given measure (score, maxval)\r\n' +
'    --outpath -o\r\n' +
'        Plot histogram of results to given path (must be .png file)\r\n' +
'\r\n'+
'    --verbose\r\n' +
'        Print detailed output.\r\n' +
'\r\n'+
'    --help\r\n' +
'        Display this help dialog.\r\n' +
'\r\n';

    console.log(helpStr);
}

var aiWeights;
if (opts.weightKey === 'random') {
    aiWeights = AIWeights.getRandom();
}
else {
    aiWeights = AIWeights.get(opts.weightKey).weights;
}

var results = [];
var bar = new ProgressBar('[:current/:total] [:bar] [:elapseds elapsed]', {
    total: opts.runs,
    width: 100,
});

for (var i = 0; i < opts.runs; i++) {
    var aiPlayer = new AIPlayer(aiWeights);
    var aiInputManager = new AIInputManager(aiPlayer);

    var GM = new GameManager(4, aiInputManager, DummyActuator, LocalStorageManager);
    aiInputManager.on("move", function(dir) {
        if (GM.isGameTerminated()) {
            aiInputManager.stop();
            if (opts.verbose) {
                var score = GM.score;
                console.log('Game over!');
                console.log('Score - ' + score);
                console.log('Max Cell Value - ' + GM.grid.maxValue());
            }
        }
    });

    aiInputManager.run(null,GM);

    results[i] = {
        score:  GM.score,
        maxval: GM.grid.maxValue(),
    };
    bar.tick();
}

var stats = {
    best:  {},
    worst: {},
};
stats.best.score  = Math.max.apply(null, results.map( function(e) { return e.score }) );
stats.worst.score = Math.min.apply(null, results.map( function(e) { return e.score }) );

stats.best.maxval  = Math.max.apply(null, results.map( function(e) { return e.maxval }) );
stats.worst.maxval = Math.min.apply(null, results.map( function(e) { return e.maxval }) );

console.log('Stats:');
console.log('  Games played:', opts.runs);
console.log('');
console.log('  Best score: ', stats.best.score);
console.log('  Worst score:', stats.worst.score);
console.log('');
console.log('  Best value: ', stats.best.maxval);
console.log('  Worst value:', stats.worst.maxval);
console.log('');

if (opts.plotPath) {
    var tmpDir = tmp.dirSync();
    var tmpDataFile = tmpDir.name + '/output.dat';

    var outputStr = '';
    var freq = {};
    var binWidth = 100;
    results.map(function (elem) {
        var val = elem[opts.plotVal];
        var flooredVal = Math.floor(val/binWidth)*binWidth;
        if (!freq[flooredVal]) freq[flooredVal] = 0;
        freq[flooredVal]++;
    });

    for (var v in freq) {
        outputStr += v + ' ' + freq[v] + '\r\n'
    };

    fs.writeFileSync(
        tmpDataFile,
        outputStr
    );

    console.log('Saving plot to:',opts.plotPath,'...');
    gnuplot()
        .set('term png')
        .set('output "' + opts.plotPath + '"')
        .set('title "Results of AI run"')
        .set('xlabel "' + opts.plotVal + '"')
        .set('ylabel "Frequency"')
        .set('grid')
        .set('zeroaxis')
        .plot(
            '"' + tmpDataFile + '" using 1:2 smooth freq w boxes lc rgb"green" fill solid 0.3 notitle' +
            ', "" using 1:2 smooth bezier lc rgb "#0000CC" lt 2 notitle' +
            ''
        )
        .end();
}

