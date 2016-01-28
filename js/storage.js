var Storage = (function () {
    var storage = {};
    var instance = localStorage;

    storage.get = function (key) {
        return JSON.parse(instance.getItem(key));
    };

    storage.set = function (key, value) {
        instance.setItem(key, JSON.stringify(value))
    };

    storage.append = function (key, value) {
        var data = storage.get(key);
        if (data[0] == undefined)
            data = [data];
        data.push(value);
        storage.set(key, data);
    }

    storage.clear = function (key) {
        instance.removeItem(key);
    };

    return storage;

})();