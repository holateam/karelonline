function KarelCodeEditor(elem) {
    this.element = elem;
    this.init();
    this.modes = {
        'cpp' : 'text/x-c++src',
        'java': 'text/x-java',
        'js'  : 'text/javascript'
    }
}

KarelCodeEditor.prototype.init = function () {

    var self = this;

    this.element.html(this.template());
    // this.$form = this.element.find('form');
    this.$codeArea = this.element.find('.karel-code-editor-code-area');

    this.editor = CodeMirror.fromTextArea(this.$codeArea.get(0), {
        lineNumbers : true,
        lineWrapping: true,
        theme       : "material-dark",
        mode        : "text/javascript",
        keyMap      : "sublime",
        indentUnit  : 4
    });

    // this.$form.on('submit', this.submit.bind(this));
};

KarelCodeEditor.prototype.submit = function (e) {
    if (this.onCodeSubmitCallback && typeof this.onCodeSubmitCallback === 'function') {
      this.onCodeSubmitCallback.call(null);
    }
    e.preventDefault();
};

KarelCodeEditor.prototype.template = function () {
    return '' +
            '<div class="code-block">' +
                '<textarea class="karel-code-editor-code-area">// Function `run` is the progtamm entry point.\n// It would be executed as a programm start\n\nfunction run() {\n\tmove();\n\tputBeeper();\n\tturnLeft();\n\tturnLeft();\n\tmove();\n}\n</textarea>' +
            '</div>' +
        '';
};

KarelCodeEditor.prototype.getCode = function () {
    // console.log(this.$codeArea.val());
    // return this.$codeArea.val().replace(/(\r\n|\n|\r|[ ])/gm,"");
    return this.editor.getValue();
};

KarelCodeEditor.prototype.onCodeSubmit = function (callback) {
    this.onCodeSubmitCallback = callback;
};

KarelCodeEditor.prototype.setMode = function (mode) {
    if (this.modes[mode]) {
        this.editor.setOption("mode", this.modes[mode]);
    }
}