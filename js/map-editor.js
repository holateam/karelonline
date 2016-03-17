
document.body.oncontextmenu = function() {
    return false;
};

var maxCellsInLine = 15;
var minCellsInLine = 1;
var maxFinalMaps = 5;

//Storage.clear('maps');

//____________________________________________________________buttons___________________________________________________

var $exit_btn = $('#exit-btn');
var $select_map = $('#map-selection-list');
var $reset_btn = $('#reset');
var $save_start_map = $('#save-start-map');
var $save_final_map = $('#save-final-map');
var $finalize = $('#finalize');
var $decrement_height = $('#decrement-height');
var $increment_height = $('#increment-height');
var $decrement_width = $('#decrement-width');
var $increment_width = $('#increment-width');
var $wall_cell = $('#wall');
var $empty_cell = $('#empty');
var $beeper_cell = $('#beeper');
var $karel_cell = $('#karel');
var $backpack_cell = $('#backpack');
var $minus = $('#minus');
var $plus = $('#plus');

var $complete = $('#complete');
var $name = $('#name');
var $description = $('#description');
var $close_pop_up = $('#close-pop-up');
var $close_alert = $('#close-alert');
var $ok_alert = $('#ok-alert');
var $alert_msg = $('#alert-msg');
var $alert = $('#alert');
var $beepers_count = $('#beepers-count');
var $num_beepers = $('#num-beepers');
/*
var $submit = $('#submit');
*/
var $map_selector_btn = $('#map-selector-btn');
var $sidebar = $('#sidebar');
var $map_list = $('#world-list-tab');
var $map_field = $('#map-field');
var $val_width = $('#value-width');
var $val_height = $('#value-height');
var $count_beepers = $('#inner');
var $original_map = $('#original-map');
var $final_maps = $('#final-maps');
//______________________________________________________________________________________________________________________

function Cell(wall, beepers, karel, direction){
    this.blocked = wall || false;
    this.beepers = beepers || 0;
    this.isKarel = karel || false;
    this.karelDirection = direction || 1;
}

function MapEdited(map) {
    this.map = map;
    this.name = "new-map";
    this.description = 'problem solving';
    this.karel = false;
    this.karelPosition = [-1, -1];
    this.active_btn = false;
    this.originalMap = {};
    this.finalMap = [];
    this.zippedMap = [];
    this.zippedKarel = {};
    this.scale = 1;
}



//__________________________________________________zip map_____________________________________________________________

MapEdited.prototype.zipMap = function() {
    this.zippedMap = [];
    this.zippedKarel = {};
    for (var row = 0; row < this.map.length; row++) {
        this.zippedMap.push([]);
        for (var cell = 0; cell < this.map[row].length; cell++) {
            var symbol = '';
            if (this.map[row][cell].blocked) {
                symbol = 'x';
            } else if (this.map[row][cell].beepers) {
                symbol = this.map[row][cell].beepers;
            }
            if (this.map[row][cell].isKarel) {
                this.zippedKarel.position = [cell, row];
                this.zippedKarel.direction = this.map[row][cell].karelDirection % 4;
                this.zippedKarel.beeperInBag = $count_beepers.text();
            }
            this.zippedMap[row].push(symbol);
        }
    }
};

//__________________________________________________unzip map___________________________________________________________

MapEdited.prototype.unzipMap = function (map) {
    var _this = this;
    _this.map = [];
    for (var y = 0; y < map.map.length; y++) {
        _this.map.push([]);
        for (var x = 0; x < map.map[y].length; x++){
            var cell;
            if (!map.map[y][x]) {
                cell = new Cell();
            } else if (map.map[y][x] == 'x'){
                cell = new Cell(true);
            } else {
                cell = new Cell(false, map.map[y][x]);
            }
            _this.map[y].push(cell);
        }
    }
    if (map.karel.position) {
        cell = _this.map[map.karel.position[1]][map.karel.position[0]];
        _this.map[map.karel.position[1]][map.karel.position[0]] = new Cell(cell.blocked, cell.beepers, true, map.karel.direction);
        _this.karelPosition = map.karel.position;
        $count_beepers.text(map.karel.beeperInBag);
    }
};




//___________________________________________________draw map___________________________________________________________


MapEdited.prototype.createDomMap = function() {
    this.karel = false;
    var table = '<table id="map">';
    for (var row = 0; row < this.map.length; row++) {
        table = table + '<tr>';
        for (var cell = 0; cell < this.map[row].length; cell++) {
            var domCell = analyzeCell(row, cell, this.map[row][cell], this);
            table = table + "<td>" + domCell + "</td>"
        }
        table = table + "</tr>";
    }
    return table + "</table>";
};


function analyzeCell(y, x, cell, ctx){
    var id = "y" + y + "x" + x;
    if (cell.blocked) {
        return '<div class="cell wall" id="' + id + '"></div>';
    }
    var direction;
    if (cell.beepers && cell.isKarel) {
        ctx.karel = true;
        direction = renderKarelDirection(cell.karelDirection % 4);
        return '<div class="cell karel ' + direction + '" id="' + id + '"><div class="beeper">' + cell.beepers + '</div></div>';
    }
    if (cell.beepers) {
        return '<div class="cell" id="' + id + '"><div class="beeper">' + cell.beepers + '</div></div>';
    }
    if (cell.isKarel) {
        ctx.karel = true;
        direction = renderKarelDirection(cell.karelDirection % 4);
        return '<div class="cell karel ' + direction + '" id="' + id + '"></div>';
    }
    return '<div class="cell" id="' + id + '"></div>';
}


function renderKarelDirection(direction) {
    if (direction == 0) {
        return "direction-south";
    } else if (direction == 2) {
        return "direction-north";
    } else if (direction == 3) {
        return "direction-west"
    } else {
        return "direction-east";
    }
}

//_________________________________________________redraw map__________________________________________________________
MapEdited.prototype.redrawMap = function () {
    var _this = this;
    $map_field.html(_this.createDomMap());
    $('.cell').mousedown(function(e) {
        var id = $(this).attr('id');
        if (e.which == 3) {
            e.preventDefault();
            _this.editMap(id, true);
        } else {
            _this.editMap(id);
        }
    });
    $val_height.text(_this.map.length);
    $val_width.text(_this.map[0].length);
};

// Edit map
//======================================================================================================================

// ___________________________________________resize map _______________________________________________________________

MapEdited.prototype.incrementWidth = function() {
    var _this = this;
    if (_this.map[0].length < maxCellsInLine) {
        for (var h = 0; h < _this.map.length; h++) {
            var emptyCell = new  Cell();
            _this.map[h].push(emptyCell);
        }
        _this.redrawMap();
    } else {
        alertMessage("Max field's height is reached.");
    }
};

MapEdited.prototype.decrementWidth = function() {
    var _this = this;
    if (_this.map[0].length > minCellsInLine) {
        for (var h = 0; h < _this.map.length; h++) {
            _this.map[h].pop();
        }
        _this.redrawMap();
    }
};

MapEdited.prototype.incrementHeight = function() {
    var _this = this;
    if (_this.map.length < maxCellsInLine) {
        _this.map.push([]);
        for (var w = 0; w < _this.map[0].length; w++) {
            var emptyCell = new Cell();
            _this.map[_this.map.length - 1].push(emptyCell);
        }
        _this.redrawMap();
    } else {
        alertMessage("Max field's height is reached.");
    }
};

MapEdited.prototype.decrementHeight = function() {
    var _this = this;
    if (_this.map.length > minCellsInLine){
        _this.map.pop();
        _this.redrawMap();
    }
};

MapEdited.prototype.scaleMap = function(resize) {
    var _this = this;
    if (resize == 'decrement' && _this.scale > 0.5) {
        _this.scale = _this.scale - 0.1;
    } else if (resize == 'increment' && _this.scale < 1) {
        _this.scale = _this.scale + 0.1;
    }
    $map_field.css( 'transform', 'scale(' + _this.scale + ', ' + _this.scale + ')' );
};

//_______________________________________________________active-edit-button_____________________________________________

MapEdited.prototype.activeToggle = function (el) {
    var _this = this;
    $(".btn-cell").css({"box-shadow": "none"});
    if (_this.active_btn == el) {
        _this.active_btn = false;
    } else {
        _this.active_btn = el;
        $(el).css({"box-shadow": "0 0 10px #000"});
    }
};

//_____________________________________________________edit-cell________________________________________________________

MapEdited.prototype.editMap = function (id, decrement) {
    var pos = id.indexOf('x');
    var y = id.slice(1, pos);
    var x = id.slice(pos + 1);
    var currentCell = this.map[y][x];
    if (this.active_btn) {
        if (this.active_btn == "#wall") {
            mountWall(currentCell);
        } else if (this.active_btn == "#beeper") {
            changeBeepersCount(currentCell, decrement);
        } else if (this.active_btn == "#empty") {
            clearCell(currentCell);
        } else {
            determinateKarelPosition(this, x, y, currentCell, decrement);
        }
    } else if (currentCell.isKarel) {
        currentCell.karelDirection = currentCell.karelDirection % 4 + 1;
    }
    this.redrawMap();
};

function mountWall(cell) {
    if (cell.blocked) {
        cell.blocked = false;
    } else {
        cell.blocked = true;
        cell.beepers = 0;
        removeKarel(cell);
    }
}
function changeBeepersCount(cell, decrement) {
    if (decrement) {
        if (cell.beepers > 1) {
            cell.beepers--;
        } else {
            cell.beepers = false;
        }
    } else {
        cell.blocked = false;
        cell.beepers++;
    }
}

function clearCell(cell) {
    cell.blocked = false;
    cell.beepers = 0;
    removeKarel(cell);
}

function determinateKarelPosition(ctx, x, y, cell, decrement) {
    if (cell.isKarel && decrement) {
        cell.isKarel = false;
        ctx.karel = [-1, -1];
    }  else if (cell.isKarel) {
        cell.karelDirection = cell.karelDirection % 4 + 1;
    } else if (!decrement) {
        console.log(ctx.active_btn);
        cell.isKarel = true;
        cell.blocked = false;
        if (ctx.karel) {
            ctx.map[ctx.karelPosition[1]][ctx.karelPosition[0]].isKarel = false;
            console.log(ctx.map[ctx.karelPosition[1]][ctx.karelPosition[0]].isKarel);
        }
        ctx.karel = true;
        ctx.karelPosition = [x, y];
    }
}

function removeKarel(cell) {
    if (cell.isKarel) {
        cell.isKarel = false;
        cell.karelDirection = 1;
    }
}

//_______________________________________________________reset map______________________________________________________

MapEdited.prototype.resetMap = function () {
    var _this = this;
    _this.activeToggle(_this.active_btn);
    _this.map = JSON.parse(JSON.stringify(startMap));
    _this.scale = 1;
    $map_field.css( 'transform', 'scale(' + _this.scale + ', ' + _this.scale + ')' );
    $map_field.css( 'top', 0);
    $map_field.css( 'left', 0);
    _this.redrawMap();
};

//___________________________________________________save start map_____________________________________________________

function  createDomElementLi(id, name) {
    return '<li id="' + id + '">' + name + '<div class="close" id="' + id + '-x">' + String.fromCharCode(215) + '</div></li>';
}


MapEdited.prototype.saveStartMap = function () {
    var _this = this;
    _this.activeToggle(_this.active_btn);
    _this.zipMap();
    if (!_this.zippedKarel.position) {
        alertMessage('You should determine Karel position! Start map cannot be saved :(');
    } else {
        _this.originalMap = {map: _this.zippedMap, karel: _this.zippedKarel};
        $original_map.html(createDomElementLi("start-map", "current start map"));
        $('#start-map').click(function() {
            loadSavedMap({original: _this.originalMap});
        });
        $('#start-map-x').click(function(){
            $('#start-map').remove();
            _this.originalMap = {};
        });
    }
};

//___________________________________________________save final map_____________________________________________________
var idFinalMaps = {};
var number = 0;




MapEdited.prototype.saveFinalMap = function () {
    var _this = this;
    _this.activeToggle(_this.active_btn);
    if (_this.finalMap.length == maxFinalMaps) {
        alertMessage('You can save up to ' + maxFinalMaps + ' final maps. Your first final map will be removed.');
        _this.finalMap.shift();
        removeFinalMap(findIdMatchIdxZero());
    }
    _this.zipMap();
    var idx = _this.finalMap.push({map: _this.zippedMap, karel: _this.zippedKarel}) - 1;
    var  id = Math.random().toString().substr(2, 5);
    $final_maps.append(createDomElementLi(id, 'current final map #' + ++number));
    idFinalMaps[id] = idx;
    $('#' + id + '').click(function() {
        loadSavedMap({original: _this.finalMap[idFinalMaps[id]]});
    });
    $('#' + id + '-x').click(function(){
        _this.finalMap.splice(idFinalMaps[id], 1);
        removeFinalMap(id);
    });
};




function findIdMatchIdxZero() {
    for (var key in idFinalMaps) {
        if (idFinalMaps[key] == 0) {
            return key;
        }
    }
}

function removeFinalMap(id) {
    $('#' + id + '').remove();
    var idx = idFinalMaps[id];
    delete idFinalMaps[id];
    matchIdToIdx(idx);
}

function matchIdToIdx(idx) {
    for (var keyId in idFinalMaps) {
        if (idFinalMaps[keyId] > idx){
            idFinalMaps[keyId]--;
        }
    }
}

//___________________________________________________save all maps______________________________________________________

MapEdited.prototype.completeEdit = function () {
    var _this = this;
    var maps = {};
    _this.activeToggle(_this.active_btn);
    if (!_this.originalMap.map){
        alertMessage('You should save start map!');
    } else if (!_this.finalMap.length > 0) {
        alertMessage('You should save at least one final map!');
    } else {
        $complete.css({"visibility": "visible"});
        $complete.submit(function () {
            _this.name = ($name.val()) ?  $name.val() : _this.name;
            _this.description = ($description.val()) ? $description.val() : _this.description;
            maps.name = _this.name;
            maps.original = _this.originalMap;
            maps.final = _this.finalMap;
            maps.description = _this.description;
            Storage.addMap(_this.name, maps);
            _this.originalMap = {};
            _this.finalMap = [];
            $complete.css({"visibility": "hidden"});
        });
    }
};


// click buttons
//======================================================================================================================

// ___________________________________________resize map _______________________________________________________________

$increment_width.click(function(){
    currentMap.incrementWidth();
});

$decrement_width.click(function() {
    currentMap.decrementWidth();
});

$increment_height.click(function(){
    currentMap.incrementHeight();
});

$decrement_height.click(function(){
    currentMap.decrementHeight();
});

//_______________________________________________________exit__________________________________________________________

$exit_btn.click(function(){
    window.location.href="./play.html";
});

//_______________________________________________________reset__________________________________________________________


$reset_btn.click(function(){
    currentMap.resetMap();
    });

//___________________________________________________save start map_____________________________________________________


$save_start_map.click(function() {
    currentMap.saveStartMap();
});

//___________________________________________________save final map_____________________________________________________

$save_final_map.click(function() {
    currentMap.saveFinalMap();
});

//___________________________________________________save all maps______________________________________________________

$finalize.click(function() {
    currentMap.completeEdit();
});

//___________________________________________________map-edit-buttons___________________________________________________


$wall_cell.click(function(){
    currentMap.activeToggle('#wall');
});

$beeper_cell.click(function(){
    currentMap.activeToggle('#beeper');
});

$karel_cell.click(function(){
    currentMap.activeToggle('#karel');
});

$empty_cell.click(function() {
    currentMap.activeToggle('#empty');
});

var active_backpack = false;

$backpack_cell.click(function() {
    if (active_backpack) {
        hideSlider();
    } else {
        changeNumBeepersInBackpack();
    }
});

function changeNumBeepersInBackpack() {
    active_backpack = true;
    $beepers_count.css({"left": "84.5%"});
    $num_beepers.val($count_beepers.text());
    $num_beepers.keypress( function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == 13) {
            var result = parseInt($num_beepers.val());
            if (result >= 0 && result <= 1000) {
                $count_beepers.text(result);
            }
            $beepers_count.css({"left": "100%"});
            active_backpack = false;
        }
    });

}

function hideSlider() {
    $beepers_count.css({"left": "100%"});
    active_backpack = false;
}

$map_field.mousedown(function() {
    $map_field.draggable();
});


$minus.click(function() {
    currentMap.scaleMap('decrement');
});

$plus.click(function() {
    currentMap.scaleMap('increment');
});

//________________________________________________other functional buttons________________________________________________

function alertMessage(msg) {
    $alert_msg.text(msg);
    $alert.css({"visibility": "visible"});
}

$close_alert.click( function() {
    $alert.css({"visibility": "hidden"});
});

$ok_alert.click( function() {
    $alert.css({"visibility": "hidden"});
});


$close_pop_up.click( function() {
    $complete.css({"visibility": "hidden"});
});


var active_selector = false;
$map_selector_btn.click( function() {
    if (active_selector) {
        $sidebar.css({"right": "-15em"});
        active_selector = false;
    } else {
        $sidebar.css({"right": 0});
        active_selector = true;
    }
});

//_____________________________________________________start edit map___________________________________________________

var editorMapSelector = new MapSelector($map_list);

var emptyCell = new Cell();
var startMap =[[emptyCell]];
var clone = JSON.parse(JSON.stringify(startMap));
var currentMap = new MapEdited(clone);
currentMap.redrawMap();

editorMapSelector.onChange(loadSavedMap);

editorMapSelector.formUlList({
    deleteCallback : function (map) {
        alert('edit button pressed');
    }
});

editorMapSelector.formOptions();

function loadSavedMap(maps) {
    if (maps.name) {
        currentMap.name = maps.name;
    }
    if (maps.description) {
        currentMap.description = maps.description;
    }
    currentMap.unzipMap(maps.original);
    currentMap.redrawMap();
}