$(function () {

    var $renderer = $("#renderer");
    var $codeEditor = $("#karel-code-editor");
    var $mapSelectionList = $("#world-list-tab");
    var $languageList = $("#language-list"); 
    var $speedSlider = $('#speed-slider');

    var renderer = '3D';
    var language = 'cpp';

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

    Storage.addMap('Demonstrative Karel Map', map);

    var greetingsMove = [
        { command: 'rotate', data: {angle: -1} },
        { command: 'rotate', data: {angle: 1} }
    ];
    var karelPlayer = null;

    preparePlayer(map);

    var karelCodeEditor = new KarelCodeEditor($codeEditor);
    var karelMapSelector = new MapSelector($mapSelectionList);
    var sidebarManager = new SidebarSlider($('#code-editor-tab'));

    var karelMapEditor = null;
    var compileResults = null;
    var playState = true;

    karelCodeEditor.onCodeSubmit(onCodeSubmit);
    karelMapSelector.onChange(preparePlayer);
    karelMapSelector.formUlList({
        editCallback : function (map) {
            alert('edit button pressed');
        }
    });

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
        karelCodeEditor.editor.setOption("fullScreen", false);
        playState = true;
        $('#play-pause-btn > .button').css('background-image', 'url("img/controls/pause.svg")');
        var code = karelCodeEditor.getCode();
        var data = KarelCodeCompiler.compile(code, map);
        compileResults = data.result;
        karelPlayer.play(data.commands, onPlayerFinish);
    }

    function onPlayerFinish() {
        if (compileResults === null) {
            alert('No any compile results.');
        } else {
            console.log('compileResults', compileResults);
            if (compileResults === true) {
                alert('Task SOLVED!');
            } else {
                alert('Task not solved.');
            }
        }
    }

    function editorFont(param) {
        var fontStep = 2;
        var mod = (param == 'increese') ? fontStep : -1 * fontStep;
        var oldFontSize = parseInt($('.CodeMirror-line').css('font-size'));
        var newFontSize = oldFontSize + mod;
        $('.CodeMirror-line, .CodeMirror-linenumber').css('font-size', newFontSize);
    }

    function changeSpeed( event, ui ) {
        karelPlayer.setSpeed(ui.value);
    }

    $speedSlider.slider({
        min     : 0.5,
        max     : 5,
        value   : 1,
        step    : 0.5,
        change: changeSpeed
    });

    $languageList.change(function() {
        var selected = $(this).val();
        if (language != selected) {
            language = selected;
            karelCodeEditor.setMode(language);
        }
    });

    $('#compile-btn').click(function(){
        onCodeSubmit();
    });

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
        } else if (e.which == 13 && e.ctrlKey) {
            onCodeSubmit();
        } else if (e.which == 33 && e.ctrlKey) {
            editorFont('increese');
        } else if (e.which == 34 && e.ctrlKey) {
            editorFont('decreese');
        }
    });

    $('#renderer-switch').click(function(){
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