$(function () {

    var $renderer = $("#renderer");
    var $codeEditor = $("#code-editor-tab");
    var $mapSelectionList = $("#map-selection-list");

    var renderer = '3D';
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
    
    var greetingsMove = [
        { command: 'rotate', data: {angle: -1} },
        { command: 'rotate', data: {angle: 1} }
    ];
    var karelPlayer = null;

    preparePlayer(map);

    var karelCodeEditor = new KarelCodeEditor($codeEditor);
    var karelMapSelector = new MapSelector($mapSelectionList);
    var sidebarManager = new SidebarSlider($codeEditor);

    var karelMapEditor = null;
    var compileResults = null;
    var playState = true;

    karelCodeEditor.onCodeSubmit(onCodeSubmit);
    karelMapSelector.onChange(preparePlayer);
    karelMapSelector.formOptions();

    function preparePlayer(newMap, forceRenderer) {

        if(map!=newMap){ // detect map changing
            map=newMap; // for compliler
            karelPlayer.setMap(newMap.original);
        } else {
            if (forceRenderer=='2D'||forceRenderer=='3D') {
                karelPlayer = (forceRenderer == '2D' || !window.WebGLRenderingContext) ?
                    new Karel2dPlayer($renderer, newMap.original):
                    new Karel3dPlayer($renderer, newMap.original);
            }
            if (!karelPlayer) {
                karelPlayer = (!window.WebGLRenderingContext) ?
                    new Karel2dPlayer($renderer, newMap.original):
                    new Karel3dPlayer($renderer, newMap.original);
            }
        }
        karelPlayer.play(greetingsMove, null);
    }

    function onCodeSubmit() {
        karelPlayer.resume();
        playState = true;
        $('#play-pause-btn > .button').css('background-image', 'url("img/controls/pause.svg")');
        var code = karelCodeEditor.getCode();
        var data = KarelCodeCompiler.compile(code, map);
        compileResults = data.result;
        console.log(data.commands);
        karelPlayer.play(data.commands, onPlayerFinish);
    }

    function onPlayerFinish() {
        if (compileResults === null) {
            alert('No any compile results.');
        } else {
            console.log(compileResults);
            if (compileResults === true) {
                alert('Task SOLVED!');
            } else {
                alert('Task not solved.');
            }
        }
    }

    $('#menu-btn').click(function() {
        sidebarManager.showTab($('#menu-tab'));
    });

    $('#code-btn').click(function() {
        sidebarManager.showTab($('#code-editor-tab'));
    });

    $('#world-list-btn').click(function() {
        sidebarManager.showTab($('#world-list-tab'));
    });

    $('#play-pause-btn').click(function() {
        if (playState) {
            karelPlayer.pause();
            playState = false;
            $('#play-pause-btn > .button').css('background-image', 'url("img/controls/play.svg")');
        } else { 
            karelPlayer.resume();
            playState = true;
            $('#play-pause-btn > .button').css('background-image', 'url("img/controls/pause.svg")');
        }
    });

    $('#fullscreen-editor-btn').click(function(){
        karelCodeEditor.editor.setOption("fullScreen", true);
    });

    $('body').keydown(function(e){
        if(e.which == 27 && karelCodeEditor.editor.getOption('fullScreen')){
            karelCodeEditor.editor.setOption("fullScreen", false);
        }
    });

    $('#renderer-switch').click(function(){
        console.log(renderer);
        karelPlayer.destroy();
        $renderer.html('');
        if (renderer == '2D') {
            $('#renderer-switch').text('Use 2D renderer');
            renderer = '3D';
        } else {
            $('#renderer-switch').text('Use 3D renderer');
            renderer = '2D';
        }
        preparePlayer(map, renderer);
    });


});