State.variables.lists = [];
State.variables.listOfLists = [];

window.SpellList = function (name, spellArray) {
    if (this instanceof SpellList) {
        this.name = name;
        this.spells = spellArray;
    } else {
        return new SpellList(name, spellArray);
    }
};

SpellList.is = function (inst) {
    // check is passed instance is spell list, and check for taken list names
    return inst instanceof SpellList;
};

SpellList.add = function (name, spells) {
    var sv = State.variables;
    sv.lists.push(new SpellList(name, spells));
    sv.listOfLists.push(name);
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

SpellList.render = function (inst) {
    // render an entire list with all the trimmings
    return inst.renderList();
};

SpellList.prototype = {
    
    rename : function (newName) {
        // rename a list
        var sv = State.variables,
            i = sv.listOfLists.indexOf(this.name);
        
        sv.listOfLists[i] = newName;
        this.name = newName;
    },
    
    hasSpell : function (spellObj) {
        // bug: only works once!!!
        var ret = false;
        this.spells.forEach( function (obj) {
            if (spellObj.name === obj.name) {
                ret = true;
            }
        });
        return ret;
    },
    
    addSpell : function (spellObj) {       
        if (this.hasSpell(spellObj)) {
            UI.alert('<strong>' + spellObj.name + '</strong> is already in the [' + this.name + '] spell book.');
            return this;
        }
        this.spells.push(spellObj);
        return this;
    },
    
    deleteSpell : function (i /* index or object */) {
        if (typeof i === 'number' && Number.isInteger(i)) {
            this.spells.deleteAt(i);
            return this;
        }
        if (typeof i === 'object' && i.hasOwnProperty('school')) {
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
            .wiki('Delete')
            .ariaClick({ label : 'Remove this spell from the list.' }, function () {
                Dialog.setup('Delete Spell', 'delete-warning');
                Dialog.wiki('Are you sure?<br /><br />');
                Dialog.append($yes, $no);
                Dialog.open();
            });
    },
    
    spellListing : function (idx) {
        return spells.render.listing(this.spells[idx], this);
    },
    
    renderList : function () {
        var list = this.spells,
            $wrapper = $(document.createElement('div'))
                .addClass('spell-list-containter');
        
        list.forEach( function (spell, i, arr) {
            $wrapper.append(spellListing(i));
        });
        
        return $wrapper;
    },
    
    exportList : function () {
        // for sharing
        return JSON.stringify(this.spells);
    },
    
    importList : function (name, enc) {
        // to get it into your app; needs a name, though
        SpellList.add(name, JSON.parse(enc));
        return State.variables.lists[name];
    },
    
    // for SugarCube's state system
    constructor : window.SpellList,
    toJSON : function () {
        return JSON.reviveWrapper('new SpellList(' + this.name + ', ' + JSON.stringify(this.spells));
    },
    clone : function () {
        return new SpellList(this.name, this.spells);
    }
};

SpellList.add('default', [spells.list[0], spells.list[10]]);