var weightsJSON = './ai-weights.json';
if (typeof window === 'undefined') {
    var fs = require('fs');
    AIWeights.weightData = require(weightsJSON);
}
else {
    AIWeights.weightData = AIWeightData;
}

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
    var solution = {};
    [
        'randomBias',
        'upBias',
        'downBias',
        'leftBias',
        'rightBias',
        'emptyCells',
        'hPairs',
        'vPairs',
        'maxVal',
        'filledCols',
        'filledRows',
        'lockedCells',
   //     'maxCol',
   //     'maxRow'
    ].map(function (wKey) {
        solution[wKey] = Math.random()*2-1;
    });
    return solution;
}

AIWeights.save = function () {
    console.log("Saving weights to file '" + weightsJSON + "'...");
    fs.writeFileSync(
        weightsJSON,
        JSON.stringify(AIWeights.weightData, null, 2)
    ); 
    console.log("Weights saved!");

    var browserJSON = weightsJSON;
    browserJSON = browserJSON.replace('.json','.browser.js');
    console.log("Saving weights to browser ready-js file '" + browserJSON + "'...");
    fs.writeFileSync(
        browserJSON,
        'AIWeightData = ' + JSON.stringify(AIWeights.weightData, null, 2)
    ); 
    console.log("Saved!");
}

if (typeof window === 'undefined') {
  module.exports = AIWeights;
}
