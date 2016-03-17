function KarelCodeEditor(elem) {
    this.element = elem;
    this.init();
}

KarelCodeEditor.prototype.init = function () {

    var self = this;

    this.element.html(this.template());
    this.$form = this.element.find('form');
    this.$codeArea = this.element.find('.karel-code-editor-code-area');

    this.editor = CodeMirror.fromTextArea(this.$codeArea.get(0), {
        lineNumbers : true,
        lineWrapping: true,
        theme       : "mdn-like",
        mode        : "clike",
        indentUnit  : 4
    });

    this.$form.on('submit', this.submit.bind(this));
};

KarelCodeEditor.prototype.submit = function (e) {
    if (this.onCodeSubmitCallback && typeof this.onCodeSubmitCallback === 'function') {
      this.onCodeSubmitCallback.call(null);
    }
    e.preventDefault();
};

KarelCodeEditor.prototype.template = function () {
    return '' +
        '<div id="fullscreen-editor-btn" class="vertical-text">Full screen</div>' +
        '<div class="karel-code-editor">' +
            '<form>' +
                '<div class="code-block">' +
                    '<textarea class="karel-code-editor-code-area">// Function Run is the progtamm entry point.\n// It would be executed as a programm start\n\nvoid Run() {\n\t// Your code here.\n}</textarea>' +
                '</div>' +
                '<input type="submit" value="Send">' +
            '</form>' +
        '</div>' +
        '';
};

KarelCodeEditor.prototype.getCode = function () {
    return this.$codeArea.val().replace(/(\r\n|\n|\r|[ ])/gm,"");
};

KarelCodeEditor.prototype.onCodeSubmit = function (callback) {
    this.onCodeSubmitCallback = callback;
};