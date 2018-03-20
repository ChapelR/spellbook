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
        $('#enter-link button, #enter-link a').focus().trigger('click');
    }
});


/*    MISC FUNCTIONS    */


/*    USER INTERFACE    */


/* menu bar */
$('#ui-restart').ariaClick({ label : 'Restart the app.' }, function () {
    UI.restart();
});
$('#ui-data').ariaClick({ label : 'Import and export lists.' }, function () {
    Dialog.setup('Share', 'share-spellbooks');
    Dialog.wiki(Story.get('Share').text);
    Dialog.open();
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
    $('#story').attr('data-ctx', '');
    setup.results = spells.get.sort(spells.list);
    State.variables.listName = 'All Spells';
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
            inst, mainList, list;
        
        if (sv.ctx) {
            inst = SpellList.getByName(sv.ctx);
            mainList = inst.spells;
        } else {
            inst = null;
            mainList = setup.results;
        }
        
        list = (st.filtered.length > 0) ? st.filtered : mainList;
        var result = spells.get.byName(term, list);
        if (result.length > 0) {
            if (inst && sv.ctx) {
                $('#results').empty().append(spells.render.listAll(result, inst));
            } else {
                $('#results').empty().append(spells.render.listAll(result));
            }
        } else {
            $('#results').empty().wiki('No spells match the criteria.');
        }
    });

$('#bottom-bar').append($search).hide();

/* side options */

var $addAll = $(document.createElement('button')) 
    .attr('id', 'add-all')
    .addClass('closed')
    .wiki('Add all.')
    .ariaClick({ label : 'Add all the selected spells to a list.' }, function () {
        var st = State.temporary,
            sv = State.variables,
            inst, mainList, list,
            spellsToAdd;
        if (sv.ctx) {
            inst = SpellList.getByName(sv.ctx);
            mainList = inst.spells;
        } else {
            inst = null;
            mainList = setup.results;
        }
        if (st.selectedSpells && Array.isArray(st.selectedSpells) && st.selectedSpells.length > 0) {
            spellsToAdd = st.selectedSpells;
        } else {
            spellsToAdd = (st.filtered.length > 0) ? st.filtered : mainList;
        }
        
        st.listsToShow = sv.listOfLists.filter( function (listName) {
            return listName !== sv.ctx;
        });
        
        function addAllConfirm () {
            return $(document.createElement('button'))
                .addClass('dialog-confirm')
                .attr('tabindex', '0')
                .wiki('Confirm')
                .ariaClick( function () {
                    var st = State.temporary,
                        sel = st.selected;
                    if (sel === 'New book...') {
                        st.bookToEdit = false;
                        st.spellToAdd = spellsToAdd;
                        Dialog.setup('New Spellbook', 'new-book');
                        Dialog.wiki(Story.get('Edit').text);
                        Dialog.open();
                    } else {
                        var list = SpellList.getByName(sel);
                        Dialog.close();
                        spellsToAdd.forEach( function (spellObj) {
                            list.addSpell(spellObj, true);
                        });
                    }
            });
        }
        
        Dialog.setup('Add Spells', 'add-selection');
        Dialog.wiki('Add all of these spells to which list?<br /><br /><<dropdown "_selected" "New book..." _listsToShow>><br /><br />');
        Dialog.append(addAllConfirm());
        Dialog.open();
    })
    .appendTo('#story');

var $removeAll = $(document.createElement('button')) 
    .attr('id', 'remove-all')
    .addClass('closed')
    .wiki('Remove all.')
    .ariaClick({ label : 'Remove all the selected spells from this list.' }, function () {
        var st = State.temporary,
            sv = State.variables,
            inst, mainList,
            spellsToRemove;
        if (sv.ctx) {
            inst = SpellList.getByName(sv.ctx);
            mainList = inst.spells;
        } else {
            inst = null;
            mainList = setup.results;
        }
        
        if (st.selectedSpells && Array.isArray(st.selectedSpells) && st.selectedSpells.length > 0) {
            spellsToRemove = st.selectedSpells;
        } else {
            spellsToRemove = (st.filtered.length > 0) ? st.filtered : mainList;
        }
        
        function removeAllConfirm () {
            return $(document.createElement('button'))
                .addClass('dialog-confirm')
                .attr('tabindex', '0')
                .wiki('Confirm')
                .ariaClick( function () {
                    spellsToRemove.forEach( function (spellObj) {
                        inst.deleteSpell(spellObj);
                    });
                    Dialog.close();
                    Engine.play(passage());
            });
        }
        
        Dialog.setup('Remove Spells', 'remove-selection');
        Dialog.wiki('Remove all of these spells from the list?<br /><br />');
        Dialog.append(removeAllConfirm());
        Dialog.open();
    })
    .appendTo('#story');

function showControls () {
    $addAll.removeClass('closed');
    $addAll.empty().wiki('Add all.');
    if (State.variables.ctx) {
        //$removeAll.removeClass('closed');
        //$removeAll.empty().wiki('Remove all.');
    }
}
function hideControls () {
    $addAll.addClass('closed');
    $removeAll.addClass('closed');
}

// todo: add remove all / remove selected

/* checked system */
$(document).on(':select-spell', function (e) {
    var pool = State.temporary.selectedSpells || [], 
        del;
    if (e.selected) {
        pool.push(e.spell);
    } else {
        del = pool.findIndex( function (spell) {
            return e.spell.name === spell.name;
        });
        pool.deleteAt(del);
    }
    // update add all / remove all to add selected / remove selected
    if (pool.length < 1) {
        // add all and remove all
        $addAll.empty().wiki('Add all.');
        $removeAll.empty().wiki('Remove all.');
    } else {
        // add selected and remove selected
        $addAll.empty().wiki('Add selected.');
        $removeAll.empty().wiki('Remove selected.');
    }
    State.temporary.selectedSpells = pool;
});

postdisplay['show-goodies'] = function (t) {
    if (tags().includes('list-view')) {
        $('#bottom-bar').show();
        showControls();
    } else {
        $('#bottom-bar').hide();
        hideControls();
    }
};