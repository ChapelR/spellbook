function createSpellDescription (spellObj) {
    return `<span class='descr-type'>//${spellObj.type.toLowerCase()}//</span>
        <div class='descr-heading'>\
        ''Casting Time:'' ${spellObj.casting_time}
        ''Range:'' ${spellObj.range}
        ''Classes:'' ${spellObj.classes.join(', ')}
        ''Components:'' ${spellObj.components.raw}
        ''Duration:'' ${spellObj.duration} 
        </div><div class='descr-main'>
        ${spellObj.description}
        ${(spellObj.hasOwnProperty('higher_levels')) ? '\n' + spellObj.higher_levels + '\n' : ''}</div>`;
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
                var sel = State.temporary.selected,
                    list = SpellList.getByName(sel);
                Dialog.close();
                list.addSpell(spellObj);
            });
    }
    
    return $(document.createElement('button'))
        .addClass('spell-listing add-link')
        .attr('tabindex', '0')
        .wiki('Add')
        .ariaClick({ label : 'Add this spell to a list.' }, function () {
            Dialog.setup('Add Spell', 'add-selection');
            Dialog.wiki('Add to which list?<br /><br /><<dropdown "_selected" $listOfLists>><br /><br />');
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

window.spells.render = {
    spellDescr : createSpellDescription,
    descrLink : createSpellDescriptionLink,
    addLink : createSpellAddLink,
    listing : createSpellListing,
    listAll : renderListOfSpells
};