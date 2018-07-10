ready = function () {
    try {
        window.plugins.intent.setNewIntentHandler(function (intent) {}, function (e) {});

        window.plugins.intent.getCordovaIntent(function (intent) {
            try {
                intent_handler(intent);
            } catch (e) {
                alert(e);
                navigator.app.exitApp();
            }
        });

    } catch (e) {
        alert("ready fail: " + e);
    }
};