var FPS = 30;

function Karel2DWorld() {
    this.animationMode = 0;
}

Karel2DWorld.prototype.initialize = function(jqueryObj){
    this.renderer = jqueryObj;
};

Karel2DWorld.prototype.clear = function(){
    this.renderer.html("");
};

Karel2DWorld.prototype.resetKarelData = function () {
    this.karel = {};
    this.karel.x = this.karelStart.position[0];
    this.karel.y = this.karelStart.position[1];
    this.karel.direction = this.karelStart.direction;
};

Karel2DWorld.prototype.loadMap = function(mapObj){

    var _this = this;
    function drawKarel () {
        $("body").append("<div id='mykarel' class='mykarel'></div>");
        _this.$myKarel = $("#mykarel");
        var xy = _this.defineRealPos(_this.karel.x, _this.karel.y);
        _this.$myKarel.offset({left: xy[0], top: xy[1]});
    }

    this.map = mapObj.map;
    this.karelStart = mapObj.karel;

    this.resetKarelData();

    var field = this.createDomMap();
    this.renderer.html(field);

    drawKarel();
};

Karel2DWorld.prototype.defineRealPos = function (x, y) {
    var id = "y" + y + "x" + x;
    var realKarelXY = $("#"+id).offset();
    var res = [];
    res.push(realKarelXY.left);
    res.push(realKarelXY.top);
    return res;
};

Karel2DWorld.prototype.createDomMap = function() {
    var table = '<table id="map">';
    for (var row = 0; row < this.map.length; row++) {
        table = table + '<tr>';
        for (var cell = 0; cell < this.map[row].length; cell++) {
            var domCell = this.analyzeCell(row, cell, this.map[row][cell], this);
            table = table + "<td>" + domCell + "</td>"
        }
        table = table + "</tr>";
    }
    return table + "</table>";
};

Karel2DWorld.prototype.analyzeCell = function (y, x, cell){
    var id = "y" + y + "x" + x;
    if (cell == "x") {
        return '<div class="cell wall" id="' + id + '"></div>';
    }
    var retStr = '<div class="cell" id="'+id+'">';

    var numBeepers = parseInt(cell);
    if (numBeepers > 0) {
        retStr += '<div class="beeper">' + numBeepers + '</div>';
    }
    retStr += '</div>';
    return retStr;
};

Karel2DWorld.prototype.renderKarelDirection = function (direction) {
    if (direction == 0) {
        return "direction-south";
    } else if (direction == 2) {
        return "direction-north";
    } else if (direction == 3) {
        return "direction-west"
    } else {
        return "direction-east";
    }
};

Karel2DWorld.prototype.karelMove = function (duration, cb, cbArgs) {
    var _this=this;
    function defineNextKarelCell() {
        var res = [];
        res[0] = _this.karel.x; res[1] = _this.karel.y;
        if (_this.karel.direction == 1) { // right
            res[0]++;
        } else if (_this.karel.direction == 3) { // right
            res[0]--;
        } else if (_this.karel.direction == 0) { // right
            res[1]++;
        } else if (_this.karel.direction == 2) { // right
            res[1]--;
        }
        return res;
    }

    function animateKarelMove(curKarelPos, nextKarelPos) {
        var numTacts = duration * FPS;
        var refreshInterval = 1000 / FPS;

        var dx = nextKarelPos[0] - curKarelPos[0];
        var dy = nextKarelPos[1] - curKarelPos[1];

        var tact = 0;

        var animFuncID = setInterval(function(){
            if (_this.animationMode == 0) {
                tact ++;
                //console.log("tact", tact);
                if (tact > numTacts) {
                    clearInterval(animFuncID);
                    cb();
                    return;
                }
                _this.$myKarel.offset ({left: curKarelPos[0] + dx * tact/numTacts, top: curKarelPos[1] + dy * tact/numTacts});
            } if (_this.animationMode == 2) { // reserved for stop
                clearInterval(animFuncID);
                cb();
                return;
            }
        }, refreshInterval);
    }

    var curKarelPos = this.defineRealPos (this.karel.x, this.karel.y);

    var nextKarelCell = defineNextKarelCell();
    var nextKarelPos = this.defineRealPos (nextKarelCell[0], nextKarelCell[1]); // yx

    this.karel.x = nextKarelCell[0];
    this.karel.y = nextKarelCell[1];

    animateKarelMove (curKarelPos, nextKarelPos);
};

Karel2DWorld.prototype.karelTurnRight = function (duration, cb, cbArgs){
    setTimeout(function(){
        cb();
    }, duration*1000);
};

Karel2DWorld.prototype.karelTurnLeft = function (duration, cb, cbArgs) {
    setTimeout(function(){
        cb();
    }, duration*1000);
};

Karel2DWorld.prototype.redrawMap = function () {
    $map_field.html(this.createDomMap());
    //var _this = this;
    //$map_field.css( 'transform', 'scale(' + _this.scale + ', ' + _this.scale + ')' );
};

Karel2DWorld.prototype.karelPutBeeper = function (duration, cb, cbArgs){
    var beepersInCell = parseInt(this.map[this.karel.y][this.karel.x]);
    if (!beepersInCell){
        beepersInCell = 0;
    }
    beepersInCell++;
    this.map[this.karel.y][this.karel.x] = beepersInCell;
    var _this = this;
    setTimeout(function(){
        _this.redrawMap();
        setTimeout(function(){
            cb();
        }, duration/2*1000);
    }, duration/2*1000);
};

Karel2DWorld.prototype.karelTakeBeeper = function (duration, cb, cbArgs){
    var beepersInCell = parseInt(this.map[this.karel.y][this.karel.x]);
    if (!beepersInCell){
        beepersInCell = 0;
    }
    beepersInCell--;
    this.map[this.karel.y][this.karel.x] = beepersInCell;
    var _this = this;
    setTimeout(function(){
        _this.redrawMap();
        setTimeout(function(){
            cb();
        }, duration/2*1000);
    }, duration/2*1000);
};

Karel2DWorld.prototype.setSpeed = function (speedCOeficient){
// ???
};

Karel2DWorld.prototype.stopWorld = function () {
    this.animationMode = 1;
};
Karel2DWorld.prototype.startWorld =function() {
    this.animationMode = 0;
};

var k2dw = new Karel2DWorld();
var $map_field = $('#map-field');
k2dw.initialize($map_field);

var map =  {
    name: 'some map name',
    original: {
        map:[
            ['x', '', '', 3, '', 2, 3],
            ['x', '', 4, 3, 'x', 1, ''],
            ['', '', 'x', 1, 'x', '', ''],
            ['', 'x', 3, 'x', 2, '', 5],
            ['', 'x', '', 1, 'x', 'x', ''],
            [2,  '',   1, 3, 'x', 'x', ''],
            ['x', '', 'x', 3, '', 1, '']
        ],
        karel: {
            position: [0, 5],
            direction: 1,
            beepers: 1000
        }
    },
    final:  [{
        map:[
            ['x', '', '', 3, '', 2, 3],
            ['x', '', 4, 3, 'x', 1, ''],
            ['', '', 'x', 1, 'x', '', ''],
            ['', 'x', 1, 'x', 2, '', 5],
            ['', 'x', 1, 1, 'x', 'x', ''],
            [1, 1, 1, 1, 'x', 'x', ''],
            ['x', '', 'x', 3, '', 1, '']
        ],
        karel: {
            position: [0, 5],
            direction: 1
        }
    }],
    description: 'problem solving'
};

k2dw.loadMap(map.original);
k2dw.karelMove(2, function(){
    k2dw.karelPutBeeper(2, function(){
        k2dw.karel.direction++;
        k2dw.karelMove(1, function(){
            k2dw.karel.direction++;
        });
    })
});