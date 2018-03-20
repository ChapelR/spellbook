// export

function wrapUp (list) {
    try {
        return {
            n : list.name,
            t : list.tags.join(' '),
            s : list.spells
        };
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [beetle].');
    }
}

function stringifyList (obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [canine].');
    }
}

function compressList (json) {
    try {
        return LZString.compressToBase64(json);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [canine].');
    }
}

function exportSpellbook (list /* name or object */) {
    if (typeof list === 'string') {
        list = SpellList.getByName(list);
    }
    if (!SpellList.is(list)) {
        UI.alert('Something went wrong.  Error code: [angel].');
       return;
    }
    
    try {
        return compressList(stringifyList(wrapUp(list)));
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [duck].');
    }
    
}

function decompressList (data) {
    try {
        return LZString.decompressFromBase64(data);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [fox].');
    }
}

function parseList (json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [gorilla].');
    }
}

function reconfigure (obj) {
    try {
        return SpellList.add(obj.n, obj.t.split(' '), obj.s);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [horse].');
    }
}

function importSpellbook (data /* string */) {
    if (typeof data !== 'string') {
        UI.alert('Something went wrong.  Error code: [elephant].');
        return;
    }
    
    try {
        return reconfigure(parseList(decompressList(data)));
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [iguana].');
    }
}

function saveToFile (bookName, string) {
    try {
        saveName = Util.slugify(bookName) + '.spells';
        saveAs(new Blob([string], { type : 'text/plain;charset=UTF-8'}), saveName);
    } catch (err) {
        console.error(err);
        UI.alert('Something went wrong.  Error code: [jackal].');
    }
}
function loadFromFile (e) {
    try {
        var file = e.target.files[0],
            reader = new FileReader();
        
        $(reader).on('load', function (event) {
            try {
                var target = event.currentTarget;
                if (!target.result) {
                    return;
                }
                
                list = SpellList.importList(target.result);
                State.temporary.bookToEdit = list.name;
                State.temporary.spellToAdd = false;
                Dialog.setup('Edit Spellbook', 'edit-book');
                Dialog.wiki(Story.get('Edit').text);
                Dialog.open();
                
            } catch (err) {
                console.error(err);
                UI.alert('Something went wrong.  Error code: [llama].');
            }
            
        });
        
        reader.readAsText(file);
        
    } catch (err) {
        console.error(err);
        UI.alert('Something went wrong.  Error code: [monkey].');
    }
}

setup.share = {
    importFromString : importSpellbook,
    exportToString : exportSpellbook
};