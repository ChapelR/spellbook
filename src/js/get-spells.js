function getList (arg) {
    if (!arg || !Array.isArray(arg) || arg.length === 0) {
        return window.spells.list;
    }
    return arg;
}

function clean (str) {
    var ret = String(str);
    ret = str.trim().toLowerCase();
    ret = ret.replace(/\s\s+/g, ' ');
    
    return ret;
}

function compare (a, b) {
    if (clean(a.name) < clean(b.name)) {
        return -1;
    }
    if (clean(a.name) > clean(b.name)) {
        return 1;
    }
    return 0;
}

function sortList (list, term) {
    if (term) {
        var first = [], others = [];
        for (var i = 0; i < list.length; i++) {
            if (clean(list[i].name).indexOf(term) === 0) {
                first.push(list[i]);
            } else {
                others.push(list[i]);
            }
        }
        first = sortList(first);
        others = sortList(others);
        return first.concat(others);
    }
    var ret = clone(list);
    return ret.sort(compare);
    
}

function getSpellsByName (name, list) {
    // return array of matching spells with similar names
    list = getList(list);
    
    name = clean(name);
    return sortList(list.filter( function (spellObj, idx, arr) {
        var spellName = clean(spellObj.name);
        return spellName.includes(name);
    }), name);
}

function getSpellsByTag (tagName, list) {
    // return array of spells matching a class or tag
    list = getList(list);
    
    tagName = clean(tagName);
    return sortList(list.filter( function (spellObj, idx, arr) {
        var spellTags = spellObj.tags;
        return spellTags.includes(tagName);
    }));
}

function getSpellsByLevel (level, list) {
    // get array of spells by level
    list = getList(list);
    
    var levelStr = Math.trunc(Number(level));
    if (!Number.isInteger(level) || level < 0 || level > 9) {
        console.warn('Invalid level "' + level + '" in getSpellsByLevel().');
        return list;
    }
    
    if (levelStr === 0) {
        levelStr = 'cantrip';
    } else {
        levelStr = 'level' + levelStr;
    }
    
    return getSpellsByTag(levelStr, list);
}

function getSpellsByComponent (compArray, list) {
    // checklist
    list = getList(list);
    
    if (!Array.isArray(compArray) && compArray.length < 1) {
        console.warn('Invalid component array in getSpellsByComponent().');
        return list;
    }
    return sortList(list.filter( function (spellObj, idx, arr) {
        var spellComp = spellObj.components;
        var ret = [];
        compArray.forEach( function (comp) {
            if (spellComp[comp]) {
                ret.push(true);
            } else {
                ret.push(false);
            }
        });
        if (ret.includes(false)) {
            return false;
        }
        return true;
    }));
}

function getSpellsBySchool (school, list) {
    list = getList(list);
    
    if (!school) {
        return list;
    }
    return sortList(list.filter( function (spellObj, idx, arr) {
        var spellSchool = spellObj.school;
        return school === spellSchool;
    }));
}

function getSpellsByRitual (list) {
    list = getList(list);
    
    return sortList(list.filter( function (spellObj, idx, arr) {
        return spellObj.ritual;
    }));
}

// exports
window.spells.get = {
    cleanText : clean,
    checkList : getList,
    sort : sortList,
    byName : getSpellsByName,
    byTag : getSpellsByTag,
    byLevel : getSpellsByLevel,
    byComponent : getSpellsByComponent,
    bySchool : getSpellsBySchool,
    byRitual : getSpellsByRitual
};