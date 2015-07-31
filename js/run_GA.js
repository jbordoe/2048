#!/usr/bin/env node

var sys = require('sys');
var AIPlayer = require('./ai_player.js');
var AIInputManager = require('./ai_input_manager.js');
var DummyActuator = require('./dummy_actuator.js');
var GameManager = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');

var opts = {
    verbose: false,
    popSize: 500,
    mutationRate: 0.05,
    maxGenerations: 1000,
    runsPerCandidate: 5,
    fitnessMeasure: 'score',
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    if (val === '--verbose' || val === '-v') {
        opts.verbose = true;
    }
    else if (val.match(/(-p|--popsize)=\d+/)) {
        opts.popSize = parseInt( val.split('=')[1] );
    }
    else if (val.match(/(-g|--max_generations)=\d+/)) {
        opts.maxGenerations = parseInt( val.split('=')[1] );
    }
    else if (val.match(/(-m|--mutation_rate)=\d+(\.\d+)?/)) {
        opts.mutationRate = parseFloat( val.split('=')[1] );
    }
    else if (val.match(/(-r|--runs)=\d+/)) {
        opts.runsPerCandidate = parseInt( val.split('=')[1] );
    }
    else if (val.match(/(-f|--fitness)=(score|maxval)/)) {
        opts.fitnessMeasure = val.split('=')[1];
    }
    else if (val === '--help') {
        help();
        process.exit(0);
    }
    else {
        console.log('Invalid argument ' + val);
        process.exit(1);
    }
});

function help() {
    var helpStr =
"USAGE: run_GA.js [OPTIONS]\r\n" +
'\r\n'+
'Runs genetic algorithm to train (breed?) progressively better 2048 AI players \r\n' +
'\r\n'+
'Options:\r\n' +
'    --popsize -p\r\n' +
'        Number of candidates per generation. Default: 500.\r\n' +
'    --max_generations -g\r\n' +
'        Generations to run GA. Default 1000.\r\n' +
'    --mutation_rate -m\r\n' +
'        Likelihood of mutation in new offspring. Default: 0.05 (i.e. 5%).\r\n' +
'    --runs -r\r\n' +
'        How many games each candidate should play to calculate averaged fitness.\r\n' +
'        Default: 5\r\n' +
'    --fitness -f\r\n' +
'        Fitness measure to use. One of:\r\n' +
'           score  - player score upon game over (default).\r\n' +
'           maxval - the highest value grid cell achieved upon game over.\r\n' +
'    --help\r\n' +
'        Display this help dialog.\r\n' +
'\r\n'+
'Examples:' +
'\r\n'+
'    Run a GA with a proplation size of 50, averaging fitness scores over 10 runs per candidate,\r\n' +
'    using the highest grid cell value as the fitness measure:\r\n' +
'\r\n'+
'        run_GA.js -p=50 -r=10 -f=maxval' +
'\r\n'+
'\r\n'+
'    Run a GA with a population size of 1000, mutation rate of 0.15 for 100 generations:\r\n' +
'\r\n'+
'        run_GA.js -m=0.15 -g=100 -p=1000' +
'\r\n';

    console.log(helpStr);
}

function getRandomSolution(callback) {
    var solution = {
        randomBias: {
            up:    Math.random(),
            down:  Math.random(),
            left:  Math.random(),
            right: Math.random()
        },
        bias: {
            up:    Math.random(),
            down:  Math.random(),
            left:  Math.random(),
            right: Math.random()
        },
    };
    callback(solution);
}

function crossover(parent1, parent2, callback) {
    var child = {}
    for (var key in parent1) {
        child[key] = {};
        var weightSet = parent1[key];
        for (var dir in weightSet) {
            if (Math.random() > 0.5) {
                child[key][dir] = parent1[key][dir];
            }
            else {
                child[key][dir] = parent2[key][dir];
            }
        }
    }
    callback(child);
}

function mutate(solution, callback) {
    for (var key in solution) {
        for (var dir in solution[key]) {
            if (Math.random() < opts.mutationRate) {
                solution[key][dir] = Math.random();
            }
        }
    }
    callback(solution);
}

function fitness(solution, callback) {
    var fitness = 0;

    for (var i=0; i<opts.runsPerCandidate; i++) {
        var aiPlayer = new AIPlayer(solution);
        var aiInputManager = new AIInputManager(aiPlayer);

        var GM = new GameManager(4, aiInputManager, DummyActuator, LocalStorageManager);
        aiInputManager.setGameManager(GM);
        aiInputManager.run(function() { return GM.isGameTerminated() }, GM);

        if (opts.fitnessMeasure === 'score') {
          fitness += GM.score;
        }
        else if (opts.fitnessMeasure === 'maxval') {
            fitness += GM.grid.maxValue();
        }
    }
    fitness = fitness / opts.runsPerCandidate;
    callback(fitness);
}

function stopCriteria() {
    return (this.generation == opts.maxGenerations)
}

var Task = require('./node_modules/genetic/lib').Task,
    options = {
    getRandomSolution : getRandomSolution,
    popSize : opts.popSize,
    stopCriteria : stopCriteria,
    fitness : fitness,
    minimize : false,
    mutateProbability : opts.mutationRate,
    mutate : mutate,
    crossoverProbability : 0.3,
    crossover : crossover
}

t = new Task(options);

if (opts.verbose) {
    t.on('run start', function () { console.log('run start');})
    t.on('run finished', function (results) { console.log('run finished - ', results); })
    t.on('init start', function () { console.log('init start') })
    t.on('init end', function (pop) { console.log('init end', pop) })
    t.on('loop start', function () { console.log('loop start') })
    t.on('loop end', function () { console.log('loop end') })
    t.on('iteration start', function (generation) { console.log('iteration start - ',generation) })
    t.on('iteration end', function () { console.log('iteration end') })
    t.on('calcFitness start', function () { console.log('calcFitness start') })
    t.on('calcFitness end', function (pop) { console.log('calcFitness end', pop) })
    t.on('parent selection start', function () { console.log('parent selection start') })
    t.on('parent selection end', function (parents) { console.log('parent selection end ',parents) })
    t.on('reproduction start', function () { console.log('reproduction start') })

    t.on('find sum', function () { console.log('find sum') })
    t.on('find sum end', function (sum) { console.log('find sum end', sum) })
    t.on('statistics', function (statistics) { console.log('statistics',statistics)})

    t.on('normalize start', function () { console.log('normalize start') })
    t.on('normalize end', function (normalized) { console.log('normalize end',normalized) })
    t.on('child forming start', function () { console.log('child forming start') })
    t.on('child forming end', function (children) { console.log('child forming end',children) })
    t.on('child selection start', function () { console.log('child selection start') })
    t.on('child selection end', function (population) { console.log('child selection end',population) })

    t.on('mutate', function () { console.log('MUTATION!') })

    t.on('reproduction end', function (children) { console.log('reproduction end',children) })
}

t.run(function (stats) { console.log('results', stats)});

t.on('error', function (error) { console.log('ERROR - ', error) })
t.run(function (stats) { console.log('results', stats)})
