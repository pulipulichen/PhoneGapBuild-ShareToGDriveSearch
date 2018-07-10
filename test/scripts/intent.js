var FILTER_SUBJECT = [
    "Text Scanner"
];

var FILTER_TEXT_PREFIX = [
    "固定\n延後\n移至收件匣\n移至...",
    "固定\n延後\n刪除\n移至..."
];

intent_handler = function (intent) {
    alert("成功改用local端");
    
    if (intent_handler_timer !== undefined) {
        clearTimeout(intent_handler_timer);
    }

    var _calendar_extras = {};
    if (typeof (intent.action) === "string"
            && intent.action === "android.intent.action.MAIN") {
        // 單純開啟Google Drive搜尋
    }

    if (typeof (intent.extras) === "object") {
        var _extras = intent.extras;
        //alert(JSON.stringify(_extras));
        
        if (typeof (_extras["android.intent.extra.SUBJECT"]) === "string") {
            var _subject = _extras["android.intent.extra.SUBJECT"];
            for (var _i = 0; _i < FILTER_SUBJECT.length; _i++) {
                var _needle = FILTER_SUBJECT[_i];
                if (_subject === _needle) {
                    //_text = _text.substring(_needle.length, _text.length).trim();
                    _subject = null;
                    break;
                }
            }
            if (null !== _subject) {
                _calendar_extras.title = _subject;
            }
        }
        if (typeof (_extras["android.intent.extra.PROCESS_TEXT"]) === "string") {
            if (typeof(_calendar_extras.title) === "undefined") {
                _calendar_extras.title = "";
            }
            else {
                _calendar_extras.title = _calendar_extras.title + " ";
            }
            _calendar_extras.title = _calendar_extras.title + _extras["android.intent.extra.PROCESS_TEXT"];
        }
        if (typeof (_extras["android.intent.extra.TEXT"]) === "string") {
            var _text = _extras["android.intent.extra.TEXT"];
            for (var _i = 0; _i < FILTER_TEXT_PREFIX.length; _i++) {
                var _needle = FILTER_TEXT_PREFIX[_i];
                //alert(JSON.stringify([_text.substr(0, _needle.length), _needle]));
                if (_text.substr(0, _needle.length) === _needle) {
                    _text = _text.substring(_needle.length, _text.length).trim();
                    break;
                }
            }
            //alert(_text);
            _calendar_extras.description = _text;
        }
    }

    if (typeof (_calendar_extras.title) === "undefined"
            && typeof (_calendar_extras.description) === "string") {
        _calendar_extras.title = _calendar_extras.description;
        delete _calendar_extras.description;
    }

    // 對付feedly的操作
    if (typeof (_calendar_extras.title) === "string"
            && typeof (_calendar_extras.description) === "undefined") {
        var _title = _calendar_extras.title.trim();
        var _last_space = _title.lastIndexOf(" ");
        if (_last_space > -1) {
            var _last_segment = _title.substring(_last_space + 1, _title.length).trim();
            if (_last_segment.substr(0, 7) === "http://"
                    || _last_segment.substr(0, 8) === "https://") {
                // 是feedly模式
                _calendar_extras.title = _title.substr(0, _last_space);
                _calendar_extras.description = _last_segment;
            }
        }
    }
    
    if (typeof (_calendar_extras.title) === "string"
            && _calendar_extras.title.indexOf("\n") > 0) {
        
        var  _desc = "";
        if (typeof(_calendar_extras.description) === "string") {
            _desc = "\n\n" + _calendar_extras.description;
        }
        
        var _title = _calendar_extras.title;
        var _title1 = _title.substr(0, _title.indexOf("\n")).trim();
        var _title2 = _title.substring(_title.indexOf("\n")+1, _title.length).trim();
        
        _calendar_extras.title = _title1;
        _desc = _title2 + _desc;
        
        _calendar_extras.description = _desc;
    }
    
    //alert(JSON.stringify(_calendar_extras));
    
    if (typeof(_calendar_extras.title) === "string" 
            && typeof (_calendar_extras.description) === "undefined"
            && _calendar_extras.title.indexOf(" ") === -1
            && (_calendar_extras.title.startsWith("http://") || _calendar_extras.title.startsWith("https://"))) {
        var _link = _calendar_extras.title;
        //alert(_link);
        $.get(_link, function (_html) {
            if (_html === undefined) {
                //alert(1);
            }
            else if (_html.indexOf("<title>") === -1) {
                if (_html.trim() !== "") {
                    _calendar_extras.title = _html;
                    _calendar_extras.description = _link;
                }
                //alert(2);
            }
            else {
                try {
                    
                    var _title = _html.substring(_html.indexOf("<title>") + 7, _html.indexOf("</title>")).trim();
                    //alert([_title, _html_obj.find("title").length, _html_obj.find("title").html()]);
                    
                    _calendar_extras.title = decodeURIComponent(_title);
                    _calendar_extras.description = _link;
                } catch (e) {
                    _calendar_extras.title = _html;
                    _calendar_extras.description = _link;
                }
                //alert(_html);
            }
            _start_activity(_calendar_extras);
        });
    }
    else {
        _start_activity(_calendar_extras);
    }
};

var _start_activity = function (_calendar_extras) {
    
    var _config = {
        action: "android.intent.action.EDIT",
        type: "vnd.android.cursor.item/event",
    };
    
    if (typeof(_calendar_extras.title) === "string") {
        _config.extras = _calendar_extras;
    }

    window.plugins.webintent.startActivity(_config,
            function () {
                navigator.app.exitApp();
            },
            function () {
                alert('Failed:' + JSON.stringify(_calendar_extras, null, 2));
                navigator.app.exitApp();
            }
    );
};

intent_handler_timer = undefined;