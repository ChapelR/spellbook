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
        compressList(stringifyList(wrapUp(list)));
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [duck].');
    }
    
}

function decompressList (data) {
    try {
        return LZString.decompressToBase64(data);
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
        SpellList.add(obj.n, obj.t.split(' '), obj.s);
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [horse].');
    }
}

function importSpellbook (data /* string */) {
    if (typeof data !== 'string') {
        UI.alert('Something went wrong.  Error code: [elephant].')
        return;
    }
    try {
        reconfigure(parseList(decompressList));
    } catch (e) {
        console.error(e);
        UI.alert('Something went wrong.  Error code: [iguana].');
    }
}