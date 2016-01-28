$(function () {

    var $renderer = $("#renderer");
    var $codeEditor = $("#code-editor");
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
                direction: 1,
            }
        }],
        description: 'problem solving'
    };

    var karelPlayer = null;

    preparePlayer(map);

    var karelCodeEditor = new KarelCodeEditor($codeEditor);
    var karelMapSelector = new MapSelector($mapSelectionList);
    var karelMapEditor = null;

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

    $('#renderer-switch').click(function(){
        console.log(renderer);
        if (renderer == '2D') {
            $('#renderer-switch').text('Use 2D renderer');
            preparePlayer(map);
            renderer = '3D';
        } else {
            $('#renderer-switch').text('Use 3D renderer');
            preparePlayer(map, true);
            renderer = '2D';
        }
    });

    $('#editor-btn').click(function(){
        $('.panel').hide();
        $codeEditor.hide();
        $('#map-editor-controls').show();
        karelMapEditor = new KarelMapEditor($renderer);
    });

    $('#inc-w').click(function(){
        karelMapEditor.incrMapWidth(); 
        $('#map-w').val(parseInt($('#map-w').val())+1);
    });

    $('#inc-h').click(function(){
        karelMapEditor.incrMapHeight(); 
        $('#map-h').val(parseInt($('#map-h').val())+1);
    });

    $('#dec-w').click(function(){
        karelMapEditor.decrMapWidth(); 
        $('#map-w').val($('#map-w').val()-1);
    });

    $('#dec-h').click(function(){
        karelMapEditor.decrMapHeight(); 
        $('#map-h').val($('#map-h').val()-1);
    });

    $('#sel-orig-map').click(function(){
        karelMapEditor.startMap(); 
    });

    $('#sel-final-map').click(function(){
        karelMapEditor.finalMap(); 
    });

    $('#save-map').click(function(){
        karelMapEditor.saveMap();
    });

});

// ---------------------------------------------
// Flat UI controls initialisation
// ---------------------------------------------

$(document).ready(function(){
    // alert('!!');
    // $("select").select2({dropdownCssClass: 'dropdown-inverse'});
});