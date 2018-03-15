/* appearance */

// mobile mode... see mobile-mode.js

function themeHandler () {
    var $html = $(document.documentElement);
    $html.removeClass('light');
    if (!settings.theme) {
        $html.addClass('light');
    }
}

function fontInit () {
    var $html = $(document.documentElement);
    $html.removeClass('small large very-large');
    if (settings.fonts !== 'Medium') {
        $html.addClass(Util.slugify(settings.fonts));
    }
}

function fontHandler () {
    fontInit();
    if (Dialog.isOpen()) {
        Dialog.close();
        UI.settings();
    }
}

/* setting definitions */

Setting.addToggle('theme', {
    label    : 'Night mode:',
    onInit   : themeHandler,
    onChange : themeHandler
});

Setting.addList('fonts', {
    label    : 'Font size:',
    list     : ['Small', 'Medium', 'Large', 'Very Large'],
    default  : 'Medium',
    onInit   : fontInit,
    onChange : fontHandler
});