function createSpellDescription (spellObj) {
    return "<span class='descr-type'>//" + spellObj.type.toLowerCase() + "//</span><br /><div class='descr-heading'><br />''Casting Time:'' " + spellObj.casting_time + "<br />''Range:'' " + spellObj.range + "<br />''Classes:'' " + spellObj.classes.join(', ') + "<br />''Components:'' " + spellObj.components.raw + "<br />''Duration:'' " + spellObj.duration + " <br /></div><div class='descr-main'><br />" + spellObj.description + "<br />" + ((spellObj.hasOwnProperty('higher_levels')) ? ('<br />' + spellObj.higher_levels + '<br />') : '') + "</div>";
}

function createSpellDescriptionLink (spellObj, el) {
    return el
        .attr('tabindex', '0')
        .ariaClick({ label : 'View spell description.' }, function (e) {
            if ($(e.target).is('button')) {
                return;
            }
            Dialog.setup(spellObj.name, 'spell-description');
            Dialog.wiki(spells.render.spellDescr(spellObj));
            Dialog.open();
        });
}

function createSpellAddLink (spellObj) {
    
    function confirmButton () {
        return $(document.createElement('button'))
            .addClass('dialog-confirm')
            .attr('tabindex', '0')
            .wiki('Confirm')
            .ariaClick( function () {
                var st = State.temporary,
                    sel = st.selected;
                if (sel === 'New book...') {
                    st.bookToEdit = false;
                    st.spellToAdd = spellObj;
                    Dialog.setup('New Spellbook', 'new-book');
                    Dialog.wiki(Story.get('Edit').text);
                    Dialog.open();
                } else {
                    var list = SpellList.getByName(sel);
                    Dialog.close();
                    list.addSpell(spellObj);
                }
            });
    }
    
    return $(document.createElement('button'))
        .addClass('spell-listing add-link')
        .attr('tabindex', '0')
        .wiki('Add')
        .ariaClick({ label : 'Add this spell to a list.' }, function () {
            Dialog.setup('Add Spell', 'add-selection');
            Dialog.wiki('Add to which list?<br /><br /><<dropdown "_selected" "New book..." $listOfLists>><br /><br />');
            Dialog.append(confirmButton());
            Dialog.open();
        });
}

function createSpellListing (spellObj, inst) {
    var $name = $(document.createElement('span'))
        .append(spellObj.name)
        .addClass('spell-listing spell-name');
    var $type = $(document.createElement('span'))
        .append(spellObj.type.toLowerCase())
        .addClass('spell-listing spell-type');
    var $classes = $(document.createElement('span'))
        .append(spellObj.classes.join(', '))
        .addClass('spell-listing spell-classes');
    
    var $listing = $(document.createElement('div'))
        .append($name, $type, $classes, (inst) ? inst.spellDeleteLink() : createSpellAddLink(spellObj))
        .addClass('spell-listing spell-wrapper');
    
    createSpellDescriptionLink(spellObj, $listing);
    
    return $listing;
}

function renderListOfSpells (list) {
    list = spells.get.checkList(list);
    var $wrapper = $(document.createElement('div'))
        .addClass('spell-list-containter');
    
    list.forEach( function (spell, i, arr) {
        $wrapper.append(createSpellListing(spell));
    });
    
    return $wrapper;
}

function toElement (el) {
    return (typeof el === 'string') ? $(el) : el;
}

function wrapAndRender (target, fn) {
    // show a loading animation if the list takes too long
    var $target = toElement(target), 
        $content;
    
    // give the target the loading element
    setup.loading.show(); // attaches to #story and covers it
    
    if (typeof fn === 'function') {
        $content = fn(); // run the function
    }
    $target.empty().append($content);
    setTimeout(setup.loading.dismiss, 0);
}

window.spells.render = {
    spellDescr : createSpellDescription,
    descrLink : createSpellDescriptionLink,
    addLink : createSpellAddLink,
    listing : createSpellListing,
    listAll : renderListOfSpells,
    load : wrapAndRender
};