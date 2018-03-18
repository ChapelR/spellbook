// not for beta

State.variables.custom = [];

function createCustomSpell ( obj /* object */ ) {
    var spellObj = {
        // the base object to build off of
        "casting_time": "1 action",
        "classes": [
            "bard"
        ],
        "components": { // generate
            "material": true,
            "materials_needed": [
                "something"
            ],
            "raw": "V, S, M (something)",
            "somatic": true,
            "verbal": true
        },
        "description": "You do something ''amazing''.",
        "duration": "Instantaneous",
        "level": "cantrip",
        "name": "Custom Spell",
        "range": "Touch",
        "ritual": false,
        "school": "evocation",
        "tags": [ // generate
            "cleric",
            "cantrip"
        ],
        "type": "Evocation cantrip" // generate
    };
    if (obj && typeof obj === 'object') {
        
        obj.components = {
            material : (obj.comp.array.includes('m')) ? true : false,
            somatic : (obj.comp.array.includes('s')) ? true : false,
            verbal : (obj.comp.array.includes('v')) ? true : false,
            materials_needed : [ ((obj.comp.mat) ? String(obj.comp.mat) : '') ],
            raw : obj.comp.array.join(', ') + (obj.comp.mat) ? '(' + String(obj.comp.mat) + ')' : ''
        };
        
        obj.tags = [];
        obj.classes.forEach( function (className) {
            obj.tags.push(String(className.trim().toLowerCase()));
        });
        obj.classes = clone(obj.tags);
        obj.tags.push((obj.level = 'cantrip') ? 'cantrip' : (obj.level[0] + 'level'));
        obj.type = String(obj.school + ' ' + obj.level + ((obj.ritual) ? ' (ritual)' : '')).toLowerCase().toUpperFirst();
        
        var props = Object.keys(obj);
        props.forEach( function (prop) {
            if (spellObj.hasOwnProperty(prop)) {
                spellObj[prop] = obj[prop];
                console.log(spellObj);
            }
        });
        
        return spellObj;
        
    } else {
        console.error('Invalid spell object in custom spell definition.');
        return false;
    }
}

function customSpell (obj) {
    var newSpell = createCustomSpell(obj);
    State.variables.custom.push(newSpell);
}

setup.custom = {
    create : customSpell
};