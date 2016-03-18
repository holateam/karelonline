var Storage = (function () {
    var storage = {};
    var instance = localStorage;

    storage.get = function (key) {
        return JSON.parse(instance.getItem(key));
    };

    storage.set = function (key, value) {
        instance.setItem(key, JSON.stringify(value));
    };

    storage.append = function (key, value, targetIndex) {
        var data = storage.get(key);
        if(!data) {
            data=[];
        } else if (!data.appandable) {
            data = [data];
        }
        data.appandable = true;
        
        if (!targetIndex) {
            data.push(value);
        } else {
            data['targetIndex'] = value;
        }

        storage.set(key, data);
    }

    storage.clear = function (key) {
        instance.removeItem(key);
    };

    return storage;

})();