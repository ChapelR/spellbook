// interface.js: ui controls, among other things


/*    CAPTION API    */


/* caption interface */
setup.caption = {
    
    $el : $('#caption'),
    
    $title : $('#caption-text'),
    
    $main : $('#caption-link'),
    
    open : function () {
        setup.caption.$el.addClass('open');
    },
    
    close : function () {
        setup.caption.$el.removeClass('open');
    },
    
    toggle : function () {
        setup.caption.$el.toggleClass('open');
    },
    
    setTitle : function (str) {
        if (!str || typeof str !== 'string') {
            str = 'menu';
        }
        setup.caption.$title.empty().wiki(str);
    },
    
    setContent : function (str) {
        if (!str || typeof str !== 'string') {
            str = 'return';
        }
        setup.caption.$main.empty().wiki(str);
    },
    
    stripClasses : function ( /* class list */ ) {
        // cache the 'open' class
        var openClass = setup.caption.$el.hasClass('open');
        setup.caption.$el.removeClass();
        if (openClass) {
            setup.caption.$el.addClass('open');
        }
    },
    
    setClasses : function ( /* class list */ ) {
        // pull classes from args
        var classes = [].slice.call(arguments);
        classes = classes.flatten().join(' ');
        // do the thing
        setup.caption.stripClasses();
        setup.caption.$el.addClass(classes);
    },
    
    opts : function (title, main, classes) {
        if (classes) {
            classes = [].slice.call(arguments);
            classes = classes.slice(2).flatten();
            setup.caption.setClasses(classes);
        }
        setup.caption.setContent(main);
        setup.caption.setTitle(title);
    }
};

/* handle tag-based captions */
function captionSetup (tag, title, content) {
    if (tags().includes(tag)) {
        setup.caption.opts(title, content, tag);
        setup.caption.open();
    }
}
postdisplay['caption-link'] = function (t) {
    setup.caption.close();
    captionSetup('search', 'search', 'Return');
    captionSetup('spells', 'books', 'return');
};

function whatCaption (cls) {
    return (setup.caption.$el.hasClass(cls));
}

/* caption listener */
$('#caption').ariaClick( function (e) {
    
    // menu handler
    if (whatCaption('search')) {
        Engine.play('Start');
    } else if (whatCaption('spells')) {
        Engine.play('Start');
    }
});

/*    KEYBOARD CONTROLS    */


$(document).on('keyup', function (e) {
    if (e.which == 27 || e.which == 81) { // esc or Q
        if (Dialog.isOpen()) {
            // dialog window
            $('#ui-dialog-close').trigger('click');
        } else if (setup.caption.$el.hasClass('open')) {
            // caption-based controls
            setup.caption.$el.trigger('click');
        } else {
            // widget-based return links
            $('#return-link a').trigger('click');
            $('#return-link button').trigger('click');
        }
    } else if (e.which == 32 || e.which == 17) { // space bar / ctrl 
        if ($('#main-talk-action').length) {
            $('#main-talk-action').trigger('click');
        } else {
            $('#space-link button, #space-link a').trigger('click');
        }
    } else if (e.which == 13) { // enter
        $('#enter-link button, #enter-link a').trigger('click');
    }
});


/*    MISC FUNCTIONS    */


/*    USER INTERFACE    */


/* menu bar */
$('#ui-restart').ariaClick({ label : 'Restart the app.' }, function () {
    UI.restart();
});
$('#ui-data').ariaClick({ label : 'Import and export lists.' }, function () {
    UI.saves();
});
$('#ui-settings').ariaClick({ label : 'Configure settings.' }, function () {
    UI.settings();
});
$('#ui-about').ariaClick({ label : 'About.' }, function () {
    Dialog.setup('About', 'about-dialog');
    Dialog.wiki( Story.get('about').text );
    Dialog.open();
});
$('#ui-lists').ariaClick({ label : 'Your spell books.' }, function () {
    Engine.play('Lists');
});
$('#ui-search').ariaClick({ label : 'Search and filter spells.' }, function () {
    Engine.play('Search');
});