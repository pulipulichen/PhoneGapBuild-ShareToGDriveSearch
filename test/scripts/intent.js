var FILTER_SUBJECT = [
    "Text Scanner"
];

intent_handler = function (intent) {
    //alert("換了 可以嗎？");
    //alert(JSON.stringify(intent));
    if (typeof (intent.action) === "string"
            && intent.action === "android.intent.action.MAIN") {
        return openActivityDefault();
    }

    var _search_items = [];

    var _has_string = function (_item) {
        return (typeof (_item) === "string"
                && _item.trim() !== "");
    };

    var _url = extractURL(intent);
    if (typeof(intent.data) === "string" && intent.data.startsWith("http://gdrive.search/")) {
        var _id = intent.data;
        _id = _id.substring(_id.lastIndexOf("/")+1, _id.length);
        var _url = "https://drive.google.com/drive/mobile/search?q=type:folder%20" + _id;
        window.open(_url, "_system");
        navigator.app.exitApp();
    }
    else if (_url !== undefined && _url.startsWith("https://www.zotero.org/")) {
        // https://www.zotero.org/pulipuli/items/itemKey/B57GG2BF/tag/ToRead
        // 取出 B57GG2BF
        var _parts = _url.split("/");
        var _id = null;
        for (var _i = 0; _i < _parts.length; _i++) {
            var _str = _parts[_i];
            if (_str === "itemKey") {
                _id = _parts[(_i + 1)];
                break;
            }
        }

        // "https://drive.google.com/drive/mobile/search?q=type:folder%20R6WNVF2Z";
        if (_id !== null) {
            var _url = "https://drive.google.com/drive/mobile/search?q=type:folder%20" + _id;
            window.open(_url, "_system");
            navigator.app.exitApp();
        }
    } else if (typeof (intent.extras) === "object") {
        var _extras = intent.extras;

        var _key_list = [
            "android.intent.extra.SUBJECT",
            "android.intent.extra.TEXT",
            "android.intent.extra.PROCESS_TEXT",
        ];

        for (var _i = 0; _i < _key_list.length; _i++) {
            if (_has_string(_extras[_key_list[_i]])) {
                var _subject = _extras[_key_list[_i]].trim();
                for (var _j = 0; _j < FILTER_SUBJECT.length; _j++) {
                    var _needle = FILTER_SUBJECT[_j];
                    if (_subject === _needle) {
                        //_text = _text.substring(_needle.length, _text.length).trim();
                        _subject = null;
                        break;
                    }
                }
                if (null !== _subject) {
                    _search_items.push(_subject);
                }
            }
        }
    }

    var _test_url = _search_items.join(" ");
    _test_url = _test_url.split("\n").join(" ");
    var _url_list = [];

    var _http_list = _test_url.split("http://");
    for (var _i = 1; _i < _http_list.length; _i++) {
        var item = _http_list[_i];
        var pos = item.indexOf(" ");
        if (pos === -1) {
            pos = item.indexOf("\n");
        }
        if (pos === -1) {
            pos = item.length;
        }
        _url_list.push("http://" + item.substring(0, pos));
    }

    var _https_list = _test_url.split("https://");
    for (var _i = 1; _i < _https_list.length; _i++) {
        var item = _https_list[_i];
        var pos = item.indexOf(" ");
        if (pos === -1) {
            pos = item.indexOf("\n");
        }
        if (pos === -1) {
            pos = item.length;
        }
        _url_list.push("https://" + item.substring(0, pos));
    }

    //alert(JSON.stringify(_url_list));
    if (_url_list.length > 0) {
        for (var i = 0; i < _url_list.length; i++) {
            window.open(_url_list[i], "_system");
        }
        navigator.app.exitApp();
        return;

    }

    if (_search_items.length > 0) {
        if (_search_items.length === 1
                && (_search_items[0].startsWith("http://") || _search_items[0].startsWith("https://"))) {
            //alert(encodeURIComponent(_search_items[0]));
            window.open(_search_items[0], "_system");
            navigator.app.exitApp();
        } else {
            var _search_text = _search_items.join(" ");
            _search_text = encodeURIComponent(_search_text);

            var _url = "https://drive.google.com/drive/mobile/search?q=" + _search_text;
            window.open(_url, "_system");
            navigator.app.exitApp();
        }
    } else {
        openActivityDefault();
    }
};

openActivityDefault = function () {
    var _url = "https://drive.google.com/drive/u/0/search?q=";
    window.open(_url, "_system");
    navigator.app.exitApp();
};

extractURL = function (intent) {
    if (typeof (intent.extras) === "object") {
        var _needles = ["http://", "https://"];
        var _needles_foot = [" ", "\n"];
        for (var _key in intent.extras) {
            var _value = intent.extras[_key];
            for (var _i = 0; _i < _needles.length; _i++) {
                var _needle = _needles[_i];
                if (_value.indexOf(_needle) > -1) {
                    var _url = _value.substring(_value.indexOf(_needle), _value.length);
                    for (var _j = 0; _j < _needles_foot.length; _j++) {
                        var _needle_foot = _needles_foot[_j];
                        if (_url.indexOf(_needle_foot) > -1) {
                            _url = _url.substr(0, _url.indexOf(_needle_foot));
                        }
                    }

                    _url = _url.trim();
                    return _url;
                }
            }
        }
    }
};