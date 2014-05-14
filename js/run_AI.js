var sys = require('sys');
var AIPlayer = require('./ai_player.js');
var AIInputManager = require('./ai_input_manager.js');
var DummyActuator = require('./dummy_actuator.js');
var GameManager = require('./game_manager.js');
var LocalStorageManager = require('./dummy_storage_manager.js');

var aiPlayer = new AIPlayer();
var aiInputManager = new AIInputManager(500,aiPlayer);

aiInputManager.on("move", function(dir) { sys.puts('Move ' + mapMove(dir) ) } );

var GM = new GameManager(4, aiInputManager, DummyActuator, LocalStorageManager);

aiInputManager.init();

function mapMove(move) {
    var map = {
        0: 'Up',
        1: 'Right',
        2: 'Down',
        3: 'Left'
    };
    return map[move];
}
