var fs = require('fs');
var weightsJSON = './ai-weights.json';
AIWeights.weightData = require(weightsJSON);

AIWeights.SCORE  = 'score';
AIWeights.MAXVAL = 'maxval';

function AIWeights() {};
//TODO: validation

AIWeights.set = function (weightKey, weightStats) {
     AIWeights.weightData.weightSets[weightKey] = weightStats;
}

AIWeights.get = function (weightKey) {
    if(AIWeights.weightData.weightSets[weightKey]) {
        return AIWeights.weightData.weightSets[weightKey];
    }
    else {
        throw new Error('Unrecognised weight class: ' + weightKey);
    }
}

AIWeights.getRandom = function () {
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
    return solution;
}

AIWeights.save = function () {
    console.log("Saving weights to file '" + weightsJSON + "'...");
    fs.writeFileSync(
        weightsJSON,
        JSON.stringify(AIWeights.weightData, null, 2)
    ); 
    console.log("Weights saved!");
}

if (typeof window === 'undefined') {
  module.exports = AIWeights;
}
