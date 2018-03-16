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
    captionSetup('spells', 'books', 'create');
    captionSetup('list-view', 'list', 'filter');
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
        State.temporary.bookToEdit = false;
        State.temporary.spellToAdd = false;
        Dialog.setup('New Spellbook', 'new-book');
        Dialog.wiki(Story.get('Edit').text);
        Dialog.open();
    } else if (whatCaption('list-view')) {
        Dialog.setup('Filter', 'list-view-filter');
        Dialog.wiki(Story.get('Filter').text);
        Dialog.open();
        $('#search').val('Search...');
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
    Dialog.wiki( Story.get('About').text );
    Dialog.open();
});
$('#ui-lists').ariaClick({ label : 'Your spell books.' }, function () {
    Engine.play('Lists');
});
$('#ui-all').ariaClick({ label : 'All spells.' }, function () {
    State.variables.results = spells.get.sort(spells.list);
    Engine.play('Results');
});

/* bottom bar */
var $search = $(document.createElement('input'))
    .attr({
        'id' : 'search',
        'type' : 'text',
        'value' : 'Search...'
    })
    .addClass('list-view-terms')
    .on('focus', function () {
        var $el = $(this);
        if (!$el.val() || $el.val() === 'Search...') {
            $el.val('');
        }
    })
    .on('blur', function () {
        var $el = $(this);
        if (!$el.val()) {
            $el.val('Search...');
        }
    })
    .on('input', function () {
        var term = $(this).val(),
            st = State.temporary,
            sv = State.variables,
            list = (st.filtered.length > 0) ? st.filtered : sv.results;
        var result = spells.get.byName(term, list);
        if (result.length > 0) {
            $('#results').empty().append(spells.render.listAll(result));
        } else {
            $('#results').empty().wiki('No spells match the criteria.');
        }
    });

$('#bottom-bar').append($search).hide();

postdisplay['show-search-bar'] = function (t) {
    if (tags().includes('list-view')) {
        $('#bottom-bar').show();
    } else {
        $('#bottom-bar').hide();
    }
};