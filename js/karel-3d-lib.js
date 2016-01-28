var DEF_CELL_WIDTH = 70;
var DEF_CELL_HEIGHT = 20;
var DEF_KAREL_RADIUS = 20;
var DEF_BEEPER_SIZE = 10;
var DIRECTION_PRESET_ARRAY = [ [0,-1], [1,0], [0,1], [-1,0] ];
var BEEPER_POSITIONS_PRESET_ARRAY = [
    [                                                                                                           ],
    [ [0,0]                                                                                                     ],
    [ [-0.25,-0.25],    [0.25,0.25]                                                                             ],
    [ [-0.3, -0.3],     [0,0],              [0.3, 0.3]                                                          ],
    [ [-0.25,-0.25],    [0.25,0.25],        [0.25,-0.25],       [-0.25,0.25]                                    ],
    [ [-0.3,-0.3],      [0.3,0.3],          [0.3,-0.3],         [-0.3,0.3],         [0,0]                       ],
    [ [-0.25, -0.3],    [-0.25, 0],         [-0.25, 0.3],       [0.25, -0.3],       [0.25, 0],      [0.25, 0.3] ]
];

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function bind(func, context) {
    return function() {
        return func.apply(context, arguments);
    }
}

function nextDirection(dir) {
    return (dir >= 3) ? 0 : dir+1;
}

function prevDirection(dir) {
    return (dir <= 0) ? 3 : dir-1;
}


/**
 * [Karel3DWorld description]
 * Class that represents Karel-The-Robot world 3D
 * Contains graphics engine and event-based player of Karel's moves
 */
function Karel3DWorld() {
    THREE.ImageUtils.crossOrigin = '';
    this.scene      = new THREE.Scene();
    this.tl         = new THREE.TextureLoader();
    this.camera     = null;
    this.renderer   = null;
    this.karel      = null;
    this.map        = null;
    this.animation  = {};
}

/**
 * [loadMap description]
 * Function analize input Karel's world map (array of strings) and genetare 3D-graphics analog
 * @param  {String[]} map -- array of strings, each string is a map row
 */
Karel3DWorld.prototype.loadMap = function(mapObj) {
    this.map = [];
    var map = mapObj.map;
    var karelObj = mapObj.karel;

    for (var y = 0; y < map.length; y++) {
        var row = [];
        for (var x = 0; x < map[y].length; x++) {
            this.createCellBase(x, y);
            if (map[y][x] == 'x') {
                this.createWall(x, y);
                row.push({ amount: -1, beepers: null });
            } 
            else if (parseInt(map[y][x]) > 0) {
                var amount = parseInt(map[y][x]);
                var beepers = this.createBeepers(x, y, amount);
                row.push({ amount: amount, beepers: beepers });
            }
            else {
                row.push({ amount: 0, beepers: null });
            }
        }
        this.map.push(row);
    }

    this.createKarel(
        karelObj.position[0],
        karelObj.position[1],
        karelObj.direction
    );

    var light = new THREE.PointLight(0xffffff, 0.5, 0);
    light.position.set( -300, 100, 500 );
    this.scene.add(light);

    var light = new THREE.AmbientLight( 0x707070 );
    this.scene.add( light );

    this.camera.position.y = this.map.length * DEF_CELL_WIDTH / -1;
}

/**
 * [initializeRenderer description]
 * System client renderer initialization function
 */
Karel3DWorld.prototype.initializeRenderer = function(container) {

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( container.width(), container.height() );
    container.append( this.renderer.domElement );
}

/**
 * [initializeCamera description]
 * Client camera initialization function
 */
Karel3DWorld.prototype.initializeCamera = function(container) {

    this.camera = new THREE.OrthographicCamera(
        container.width()/-2, 
        container.width()/2, 
        container.height()/2, 
        container.height()/-2, 
        1, 
        1000 
    );

    this.camera.rotation.x = degToRad(55);
    this.camera.rotation.y = degToRad(-30);
    this.camera.rotation.z = degToRad(-10);
    // this.camera.position.x = -500;
    this.camera.position.z = 300;

    var self = this;

    container.mousedown(function(e) {
        container.pressed = true;
        container.startX = e.pageX;     
        container.startY = e.pageY;
        container.cameraX = self.camera.position.x;   
        container.cameraY = self.camera.position.y;   
    });

    $(document).mouseup(function(e) {
        container.pressed = false;
    });

    container.mousemove(function(e) {
        if (container.pressed) {
            dX = e.pageX - container.startX;
            dY = e.pageY - container.startY;
            self.camera.position.x = container.cameraX - ( dX * 0.95- dY * 0.65 );
            self.camera.position.y = container.cameraY + ( dX * 0.25 + dY * 1.25 );
        }
    });
}

/**
 * [createCellBase description]
 * Function generates appropriate empty-cell base with mentioned position in a karel's world field
 * @param  {integer} X -- x-coordinate of cell in the field
 * @param  {integer} Y -- y-coordinate of cell in the field
 */
Karel3DWorld.prototype.createCellBase = function(X, Y) {

    var geometry = new THREE.BoxGeometry( DEF_CELL_WIDTH, DEF_CELL_WIDTH, DEF_CELL_HEIGHT );
    var texture = this.tl.load( 'img/textures/cellbase.png' );
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = X * DEF_CELL_WIDTH;
    mesh.position.y = -1 * Y * DEF_CELL_WIDTH;

    this.scene.add(mesh);
}

/**
 * [createWall description]
 * Function generates 3D wall object and put it to appropriate field cell
 * @param  {integer} X -- x-coordinate of cell in the field
 * @param  {integer} Y -- y-coordinate of cell in the field
 */
Karel3DWorld.prototype.createWall = function(X, Y) {

    var geometry = new THREE.BoxGeometry( DEF_CELL_WIDTH/2, DEF_CELL_WIDTH/2, DEF_CELL_HEIGHT );
    var texture = this.tl.load( 'img/textures/wall.png' );
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = X * DEF_CELL_WIDTH;
    mesh.position.y = -1 * Y * DEF_CELL_WIDTH;
    mesh.position.z = DEF_CELL_HEIGHT;

    this.scene.add(mesh);

    var geometry = new THREE.BoxGeometry( DEF_CELL_WIDTH/4, DEF_CELL_WIDTH/4, DEF_CELL_HEIGHT/2 );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = X * DEF_CELL_WIDTH;
    mesh.position.y = -1 * Y * DEF_CELL_WIDTH;
    mesh.position.z = DEF_CELL_HEIGHT * 1.75;

    this.scene.add(mesh);
}

/**
 * [createBeepers description]
 * Creates multiple beeper objects (1-6), places them to appropriate cell and returns array of those objects
 * @param  {integer}        X      -- x-coordinate of cell in the field
 * @param  {integer}        Y      -- y-coordinate of cell in the field
 * @param  {integer}        amount -- number of beepers to put to a cell
 * @return {THREE.Mesh[]}          -- array of created object3D beeper-instances
 */
Karel3DWorld.prototype.createBeepers = function(X, Y, amount) {

    var texture = this.tl.load( 'img/textures/beeper.png' );
    var material = new THREE.MeshLambertMaterial( { map: texture } );
    var retVal = [];

    if (amount > 0 && amount < 7) {
        var geometry = new THREE.BoxGeometry( DEF_BEEPER_SIZE, DEF_BEEPER_SIZE, DEF_BEEPER_SIZE );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = X * DEF_CELL_WIDTH;
        mesh.position.y = -1 * Y * DEF_CELL_WIDTH;
        mesh.position.z = DEF_CELL_HEIGHT * 0.5;

        mesh.rotation.x = degToRad(45);
        mesh.rotation.z = degToRad(45);

        for (var i = 0; i < amount; i++) {
            var beeper = mesh.clone();
            beeper.position.x += BEEPER_POSITIONS_PRESET_ARRAY[amount][i][0] * DEF_CELL_WIDTH;
            beeper.position.y -= BEEPER_POSITIONS_PRESET_ARRAY[amount][i][1] * DEF_CELL_WIDTH;
            retVal.push(beeper);
            this.scene.add(beeper);
        }
    } else if (amount >= 7) {
        // var geometry = new THREE.TextGeometry( ''+amount, {

        //     size: DEF_CELL_WIDTH * 0.8,
        //     height: DEF_BEEPER_SIZE,

        //     font: 'helvetiker',
        //     weight: 'bold',
        //     style: 'normal',

        //     material: 1,
        //     extrudeMaterial: 1

        // } )
        // var mesh = new THREE.Mesh( geometry, material )

        // mesh.position.x = X * DEF_CELL_WIDTH
        // mesh.position.y = Y * DEF_CELL_WIDTH
        // mesh.position.z = DEF_CELL_HEIGHT

        // this.scene.add(mesh)
    }

    return retVal;
}

/**
 * [createKarel description]
 * Creates Karel-The-Robot 3D object and placing it to appropriate cell with appropriate facing (direction)
 * @param  {integer} X         -- x-coordinate of cell in the field
 * @param  {integer} Y         -- y-coordinate of cell in the field
 * @param  {integer} direction -- initial facing of the robot, indexing DIRECTION_PRESET_ARRAY
 */
Karel3DWorld.prototype.createKarel = function(X, Y, direction) {

    var extrPathP1 = new THREE.Vector3( 0, 0, 0 );
    var extrPathP2 = new THREE.Vector3( 0, 0, 10 );

    var extrudeSettings = {
        steps           : 1,
        bevelEnabled    : false,
        extrudePath     : new THREE.LineCurve3 (extrPathP1, extrPathP2)
    };

    var points = [
        new THREE.Vector2 ( -0.3 * DEF_CELL_WIDTH,  -0.25 * DEF_CELL_WIDTH ),
        new THREE.Vector2 (  0 * DEF_CELL_WIDTH,     0.3 * DEF_CELL_WIDTH  ),
        new THREE.Vector2 (  0.3 * DEF_CELL_WIDTH,  -0.25 * DEF_CELL_WIDTH ),
        new THREE.Vector2 (  0 * DEF_CELL_WIDTH,    -0.1 * DEF_CELL_WIDTH  )
    ];

    var shape = new THREE.Shape( points );
    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    var texture = this.tl.load( 'img/textures/beeper.png' );
    var material = new THREE.MeshLambertMaterial( { map: texture } );

    this.karel = new THREE.Mesh( geometry, material );

    this.karel.position.x = X * DEF_CELL_WIDTH;
    this.karel.position.y = -1 * Y * DEF_CELL_WIDTH;
    this.karel.position.z = DEF_CELL_HEIGHT * 1.5;

    this.karel.direction = direction || 0;
    this.karel.rotation.z = degToRad( (-this.karel.direction + 1) * 90 );
    this.karel.x = X;
    this.karel.y = Y;

    this.scene.add(this.karel);
}

/**
 * [karelMove description]
 * Animate Karel-The-Robot to move forward for a one step, according to it's current facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelMove = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = DEF_CELL_WIDTH / frames;
    
    this.karel.x += DIRECTION_PRESET_ARRAY[this.karel.direction][0];
    this.karel.y -= DIRECTION_PRESET_ARRAY[this.karel.direction][1];

    this.animation = {};
    this.animation.px = modidier * DIRECTION_PRESET_ARRAY[this.karel.direction][0];
    this.animation.py = modidier * DIRECTION_PRESET_ARRAY[this.karel.direction][1];
    this.animation.rz = 0;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTurnLeft description]
 * Animate Karel-The-Robot to turn left a 90 degrees and change it's facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTurnLeft = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = degToRad(90) / frames;
    
    this.karel.direction = nextDirection(this.karel.direction);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = modidier;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTurnRight description]
 * Animate Karel-The-Robot to turn Right a 90 degrees and change it's facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTurnRight = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = degToRad(90) / frames;
    
    this.karel.direction = prevDirection(this.karel.direction);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = -modidier;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTakeBeeper description]
 * Animate Karel-The-Robot to pick up one beeper from the cell he stands on
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTakeBeeper = function(callback, args) {

    var X = this.karel.x;
    var Y = this.karel.y;

    this.clearBeepers(this.map[Y][X].beepers);
    if (--this.map[Y][X].amount > 0)
        this.map[Y][X].beepers = this.createBeepers(X, Y, this.map[Y][X].amount);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = 0;
    this.animation.frames = 1;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelPutBeeper description]
 * Animate Karel-The-Robot to put one beeper to the cell he stands on
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelPutBeeper = function(callback, args) {
    
    var X = this.karel.x;
    var Y = this.karel.y;

    this.clearBeepers(this.map[Y][X].beepers);
    this.map[Y][X].beepers = this.createBeepers(X, Y, ++this.map[Y][X].amount);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = 0;
    this.animation.frames = 1;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [clearBeepers description]
 * Removes all beeper objects from the list
 * @param  {THREE.Mesh[]} beeperList -- array of beeper objects to be removed
 */
Karel3DWorld.prototype.clearBeepers = function(beeperList) {
    if (beeperList)
        for (var i = 0; i < beeperList.length; i++)
            this.scene.remove(beeperList[i]);
}

/**
 * [render description]
 * Karel's 3D world rendering function
 */
Karel3DWorld.prototype.render = function() {
    if (!this.stop) {
        if (this.animation) {
            if (this.animation.frames > 0) {
                this.animation.frames--;
                this.karel.position.x += this.animation.px;
                this.karel.position.y += this.animation.py;
                this.karel.rotation.z += this.animation.rz;
            } else {
                fn = this.animation.callback;
                args = this.animation.cbargs;
                this.animation = null;
                if (fn && args)
                    setTimeout(
                        (function(self, args) {
                            return function() {
                                fn.apply(self, args);
                            }
                        })(this, args)
                        ,200
                    );
            }
        }
        this.renderer.render( this.scene, this.camera );
        this.animationFrame = requestAnimationFrame( bind(this.render, this) );
    }
}

Karel3DWorld.prototype.clear = function() {
    this.stopWorld();
    this.karel      = null;
    this.map        = null;
    this.animation  = null;
    for( var i = this.scene.children.length - 1; i >= 0; i--)
        this.scene.remove(this.scene.children[i]);
}

Karel3DWorld.prototype.stopWorld = function() {
    this.stop = true;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
}

Karel3DWorld.prototype.startWorld = function() {
    this.stop = false;
    this.animationFrame = requestAnimationFrame( bind(this.render, this) );
}