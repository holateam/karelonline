// ---------------------------------------------------------------
// ------------------- Map Selector class ------------------------
// ---------------------------------------------------------------

var MapSelector = function(element) {
    this.element = element;
    this.callback = null;
};

MapSelector.prototype.onChange = function(callback) {
    this.callback = callback
};

MapSelector.prototype.formOptions = function() {

    var list = Storage.get('maps') || [];
    var self = this;

    for (var i = 0; i < list.length; i++) {
        var option = $('<option></option>');
        option.text(list[i].name);
        option.val(i);
        this.element.append(option);
    }

    this.element.change(function() {
        if (self.callback)
            self.callback( list[self.element.find('option:selected').val()] );
    });

};

// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ---------------------------------------------------------------