$(function () {

    var $renderer = $("#renderer");
    var $codeEditor = $("#code-editor");
    var $mapSelectionList = $("#mapselect");

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
                direction: 1,
            }
        }],
        description: 'problem solving'
    };

    var karelPlayer = null;

    preparePlayer(map);

    var karelCodeEditor = new KarelCodeEditor($codeEditor);
    var karelMapSelector = new MapSelector($mapSelectionList);

    karelCodeEditor.onCodeSubmit(onCodeSubmit);
    karelMapSelector.onChange(preparePlayer);
    karelMapSelector.formOptions();

    function preparePlayer(map, force2D) {
        karelPlayer = (force2D || !window.WebGLRenderingContext) ?
            new Karel2dPlayer($renderer, map.original):
            new Karel3dPlayer($renderer, map.original);
    }

    function onCodeSubmit() {
        var code = karelCodeEditor.getCode();
        var data = KarelCodeCompiler.compile(code, map);
        karelPlayer.play(data.commands, onPlayerFinish);
    }

    function onPlayerFinish() {
        alert('Finished');
    }

    $('#pause-btn').click(function(){
        karelPlayer.pause();
    });

    $('#resume-btn').click(function(){
        karelPlayer.resume(); 
    });

    $('#2d-switch').click(function(){
        preparePlayer(map, true);
    });

    $('#editor-btn').click(function(){
        $('.panel').hide();
        $codeEditor.hide();
        var karelMapEditor = new KarelMapEditor($renderer);
    });
});