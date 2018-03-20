// configuration settings
Config.history.controls  = false;
Config.history.maxStates = 1;
Config.saves.autosave    = true;
Config.saves.autoload    = true;
Config.saves.version     = '1.0.0';
Config.debug             = false;
Config.loadDelay         = 200;
Config.saves.onLoad = function (save) {
    var lock = LoadScreen.lock();
    postdisplay['goto-start'] = function (t) {
        delete postdisplay[t];
        Engine.play('Start');
        LoadScreen.unlock(lock);
    }
};