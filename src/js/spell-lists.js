State.variables.lists = [];
State.variables.listOfLists = [];

window.SpellList = function (name, tags, spellArray) {
    if (this instanceof SpellList) {
        this.name = name;
        this.tags = tags || [];
        this.spells = spellArray || [];
    } else {
        return new SpellList(name, tags, spellArray);
    }
};

SpellList.is = function (inst) {
    // check is passed instance is spell list, and check for taken list names
    return inst instanceof SpellList;
};

SpellList.add = function (name, tags, spells) {
    var sv = State.variables;
    sv.lists.push(new SpellList(name, tags, spells));
    sv.listOfLists.push(name);
    return sv.lists[sv.lists.length - 1]; // return the spellbook
};

SpellList.getByName = function (name, includeIndex) {
    var sv = State.variables,
        inst = sv.lists.find( function (entry, idx) {
            if (entry.name === name) {
                return (includeIndex) ? [entry, idx] : entry;
            }
        });
    return inst;
};

SpellList.search = function (term, list) {
    // search by name and tags
    var sv = State.variables;
    term = setup.get.cleanText(term);
    if (!list || !Array.isArray(list) || list.length < 1 || !SpellList.is(list[0])) {
        list = State.variables.lists;
    }
    return setup.get.sortList(list.filter( function (list) {
        var check = list.name + list.tags.join(' ');
        return check.includesAny(term.split(' '));
    }));
};

SpellList.del = function (name) {
    var sv = State.variables,
        del = SpellList.getByName(name, true)[1];
    
    sv.lists.deleteAt(del);
    
    del = sv.listOfLists.find( function (entry, idx) {
        if (entry === name) {
            return [entry, idx];
        }
    });
    
    sv.listOfLists.deleteAt(del[1]);
};

SpellList.listify = function (list) {
    // render all spell book cards in a filtered or non-filtered list
    if (!list || !Array.isArray(list) || list.length < 1 || !SpellList.is(list[0])) {
        list = State.variables.lists;
    }
    var $wrapper = $((document).createElement('span'))
        .addClass('book-wrapper');
    
    list.forEach( function (book) {
        $wrapper.append(book.listing());
    });
    
    return $wrapper;
};

SpellList.render = function (el, list) {
    spells.render.load(false, el, function () {
        return SpellList.listify(list);
    });
};

SpellList.update = function (el, list) {
    spells.render.load(true, el, function () {
        // for when search is added
        return SpellList.listify(list);
    });
};

SpellList.importList = function (enc) {
    // to get it into your app
    return setup.share.importFromString(enc);
};

SpellList.prototype = {
    
    listing : function () {
        var inst = this;
        
        var displayName = inst.name, 
            displayTags = inst.tags.join(' ');
        if (displayTags.length < 1) {
            displayTags = ' [ no tags ] ';
        }
        
        var $name = $(document.createElement('div'))
            .addClass('book-listing card-name')
            .append(displayName); // to ensure no markup
        
        var $tags = $(document.createElement('div'))
            .addClass('book-listing card-tags')
            .append(displayTags);
            
        var $edit = $(document.createElement('div'))
            .addClass('book-listing card-edit-btn')
            .attr('data-book', inst.name)
            .ariaClick({ label : 'Change spell book information.' }, function () {
                State.temporary.bookToEdit = inst.name;
                State.temporary.spellToAdd = false;
                Dialog.setup('Edit Spellbook', 'edit-book');
                Dialog.wiki(Story.get('Edit').text);
                Dialog.open();
            });
        
         var $card = $(document.createElement('div'))
            .addClass('book-listing card')
            .attr('data-book', inst.name)
            .append($name, $tags, $edit)
            .ariaClick({ label : 'View spell book.' }, function (e) {
                if ($(e.target).hasClass('card-edit-btn')) {
                    return;
                }
                State.variables.ctx = inst.name;
                State.variables.listName = 'Spell Book: ' + inst.name;
                Engine.play('BookList');
            });
        
        return $card;
    },
    
    rename : function (newName, newTags) {
        // rename a list
        var sv = State.variables,
            i = sv.listOfLists.indexOf(this.name);
        
        sv.listOfLists[i] = newName;
        this.name = newName;
        this.tags = newTags;
    },
    
    hasSpell : function (spellObj) {
        // bug: only works once!!!
        var ret = false;
        var list = clone(this.spells);
        list.forEach( function (obj) {
            if (spellObj.name === obj.name) {
                ret = true;
            }
        });
        return ret;
    },
    
    addSpell : function (spellObj, suppressError) {       
        if (this.hasSpell(spellObj)) {
            if (!suppressError) {
                UI.alert('<strong>' + spellObj.name + '</strong> is already in the [' + this.name + '] spell book.');
            }
            return false;
        }
        this.spells.push(spellObj);
        return true;
    },
    
    deleteSpell : function (i /* index or object */) {
        if (typeof i === 'number' && Number.isInteger(i)) {
            this.spells.deleteAt(i);
            return this;
        }
        if (typeof i === 'object') {
            var del = this.spells.find( function (entry, idx) {
                if (i.name === entry.name) {
                    return [entry, idx];
                }
            });
            
            this.spells.deleteAt(del);
            return this;
        }
        console.warn('Spell "' + i + '" could not be deleted by <spelllist>.deleteSpell().');
        return this;
    },
    
    spellDescriptionLink : function (idx, el) {
        // a SugarCube Dialog link for spells (an array of links)
        return spells.render.descrLink(this.spells[idx], el);
    },
    
    spellDeleteLink : function (idx) {
        // a link for deleting spells from the list (an array of links)
        var inst = this;
        
        var $yes = $(document.createElement('button'))
            .css('float', 'left')
            .addClass('dialog-confirm')
            .attr('tabindex', '0')
            .wiki('Yes')
            .ariaClick( function () {
                inst.deleteSpell(idx);
                Dialog.close();
                Engine.play(passage());
            });
        
        var $no = $(document.createElement('button'))
            .css('float', 'right')
            .addClass('dialog-cancel')
            .attr('tabindex', '0')
            .wiki('No')
            .ariaClick( function () {
                Dialog.close();
            });
        
        return $(document.createElement('button'))
            .addClass('spell-listing delete-link')
            .attr('tabindex', '0')
            .wiki('Remove')
            .ariaClick({ label : 'Remove this spell from the list.' }, function () {
                Dialog.setup('Delete Spell', 'delete-warning');
                Dialog.wiki('Are you sure?<br /><br />');
                Dialog.append($yes, $no);
                Dialog.wiki('<br />');
                Dialog.open();
            });
    },
    
    spellListing : function (idx) {
        return spells.render.listing(this.spells[idx], this);
    },
    
    renderList : function () {
        var inst = this,
            list = inst.spells,
            $wrapper = $(document.createElement('div'))
                .addClass('spell-list-containter');
        
        list.forEach( function (spell, i, arr) {
            $wrapper.append(inst.spellListing(i));
        });
        
        return $wrapper;
    },
    
    exportList : function () {
        // for sharing
        return setup.share.exportToString(this);
    },
    
    // for SugarCube's state system
    constructor : window.SpellList,
    toJSON : function () {
        return JSON.reviveWrapper('new SpellList(' + JSON.stringify(this.name) + ', ' + JSON.stringify(this.tags) + ',' + JSON.stringify(this.spells) + ')');
    },
    clone : function () {
        return new SpellList(this.name, this.tags, this.spells);
    }
};

// SpellList.add('default', [spells.list[0], spells.list[10]]);