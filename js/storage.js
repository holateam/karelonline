var Storage = (function () {
    var storage = {};
    var instance = localStorage;

    storage.get = function (key) {
        var data = instance.getItem(key);
        return (data) ? JSON.parse(data) : null;
    };

    storage.set = function (key, value) {
        instance.setItem(key, JSON.stringify(value));
    };

    storage.addMap = function (title, map) {
        
        var mapList = storage.get('karelMapsIndex');
        if (!mapList) {
            mapList = [];
        }

        if (mapList.indexOf(title) < 0) {
            mapList.push(title);
            storage.set('karelMapsIndex', mapList);
        }
        storage.set(title, map);

    }

    storage.clear = function (key) {
        instance.removeItem(key);
    };

    return storage;

})();