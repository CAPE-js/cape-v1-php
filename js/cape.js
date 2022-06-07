// format date
Vue.filter('formatDate', function(value) {
    if (value) {
        return moment(value*1000).toISOString();
    }
});

// multiselect
Vue.component('multiselect', window.VueMultiselect.default)

// filter factory
function makeFilter( field ) {
    switch (field.type) {
        case "text":    return new TextFilter( field ); 
        case "integer": return new IntegerFilter( field ); 
        case "enum":    return new EnumFilter( field ); 
        case "date":    return new DateFilter( field ); 
        case "freetext":return new FreeTextFilter( field ); 
        case "ignore":  return false;
    }
    console.warn("Could not create a search filter for field type '"+field.type+"'");
    return false;
}

/*
 *  Filter
 *  abstract base class, should not be instantiated directly
 */
function Filter( field ) {
    this.field = field;
    this.placeholder = { "is":"" };
    if( field["placeholder"] && field["placeholder"]["is"] ) {
        this.placeholder.is = field["placeholder"]["is"];
    }
    this.change_filter_mode = true;
    if( field["change_filter_mode"] === false ) {
        this.change_filter_mode = false;
    }
}

// return true if the field term is set (including a default setting)
Filter.prototype.isSet = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term != '' );
}

// return true if the field term is not the default setting.
Filter.prototype.isDefault = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term == this.default_term);
}

Filter.prototype.reset = function() {
    console.warn( "Filter.prototype.reset  should be overridden. Field info:", this.field );
}

Filter.prototype.matchesValuesIs = function(values) {
    var term = this.term.toLowerCase()
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value.toLowerCase() == term) {
            return true;
        }
    }
    return false;
}
Filter.prototype.matchesValuesContains = function(values) {
    // check that all the terms are found in the record
    
    var terms = this.term.toLowerCase().split(/\s+/);

    for (var i = 0; i < terms.length; i++) {
        var term = make_pattern(terms[i]);
        var term_found = false;
        for (var j = 0; j < values.length; j++) {
            if (values[j].match( term ) ) {
                term_found = true;
                break;
            }
        }

        // has to match all terms
        if (!term_found) {
            return false;
        }

    }

    return true;
}
Filter.prototype.matchesValuesSet = function(values) {
    for (var j = 0; j < values.length; j++) {
        if( values[j] !== null && values[j] !== "" ) {
            return true;
        }
    }
    return false;
}
Filter.prototype.matchesValuesNotSet = function(values) {
    var v = this.matchesValuesSet(values);
    return ! this.matchesValuesSet(values);
}


Filter.prototype.matchesRecord = function(record) {
    /* Assumes that the filter is set */
    
    var values = record[this.field.id].value;
    if ( values === null || (this.field.multiple && values.length==0) ) {
        // special case for not-set where not matching is a success
        if( this.mode=="not-set" ) { return true; }
        return false;
    }

    // to simplify things always work with arrays.
    if (!this.field.multiple) {
        values = [values];
    }

    return this.matchesValues( values );
}

Filter.prototype.matchesValues = function(values) {
    console.log( "matchesValues must be overridden!");
    return false;
}

/*
 *  TextFilter
 *  
 */
function TextFilter( field ) {
    Filter.call( this, field );

    if( field.hasOwnProperty( 'default_filter_mode' ) ) {
        this.default_mode = field['default_filter_mode'];
    } else {
        this.default_mode = "contains";
    }

    if( field.hasOwnProperty( 'default' ) ) {
        this.default_term  = field['default'][0];
    } else {
        this.default_term  = "";
    }

    if( field["placeholder"] && field.placeholder["contains"] ) {
        this.placeholder.contains = field.placeholder.contains;
    } else {
        this.placeholder.contains = "";
    }

    this.reset();
}
TextFilter.prototype = Object.create(Filter.prototype);

TextFilter.prototype.reset = function() {
    this.mode = this.default_mode;
    this.term = this.default_term;
}

TextFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else if( this.mode == "contains" ) {
        return this.matchesValuesContains( values );
    } else if( this.mode == "set" ) {
        return this.matchesValuesSet( values );
    } else if( this.mode == "not-set" ) {
        return this.matchesValuesNotSet( values );
    }
    console.log( "Unknown search mode "+this.mode+" on ", this );
    return false;
}

/*
 *  IntegerFilter
 *  
 */
function IntegerFilter( field ) {
    Filter.call( this, field );

    if( this.field.hasOwnProperty( 'default_filter_mode' ) ) {
        this.default_mode = this.field['default_filter_mode'];
    } else {
        this.default_mode = "between";
    }

    if( field.hasOwnProperty( 'default' ) ) {
        this.default_term  = field['default'][0];
        if( field['default'].length >= 2 ) {
            this.default_term2 = field['default'][1];
        } else {
            this.default_term2 = "";
        }
    } else {
        this.default_term  = "";
        this.default_term2  = "";
    }

    if( field["placeholder"] && field.placeholder["between"] && field.placeholder.between[0] && field.placeholder.between[1] ) {
        this.placeholder.between = field.placeholder.between;
    } else {
        this.placeholder.between = ["Minimum "+field.min,"Maximum "+field.max];
    }

    this.reset();
}

IntegerFilter.prototype = Object.create(Filter.prototype);

IntegerFilter.prototype.isDefault = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term == this.default_term && (this.mode != "between" || this.term2 == this.default_term2));
}
Filter.prototype.isSet = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term != '' || (this.mode == "between" && this.term2 != ''));
}

IntegerFilter.prototype.reset = function() {
    this.mode = this.default_mode;
    this.term = this.default_term;
    this.term2 = this.default_term2;
}

IntegerFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else if( this.mode == "between" ) {
        return this.matchesValuesBetween( values );
    } else if( this.mode == "set" ) {
        return this.matchesValuesSet( values );
    } else if( this.mode == "not-set" ) {
        return this.matchesValuesNotSet( values );
    }
    console.log( "Unknown search mode "+this.mode+" on ", this );
    return false;
}

IntegerFilter.prototype.matchesValuesIs = function(values) {
    // is a match if any of the supplied values are exact match
    for(var i = 0; i < values.length; i++) {
        if (values[i] == this.term) {
            return true;
        }
    }

    return false;
}

IntegerFilter.prototype.matchesValuesBetween = function(values) {
    var term = this.term;
    var term2 = this.term2;
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        // null terms are treated as not being bounded so up-to- or from- if only one term is set
        if ((term=="" || value >= term) && (term2=="" || value <= term2 )) {
            return true;
        }
    }
    return false;
}

/*
 *  DateFilter
 *  
 */
function DateFilter( field ) {
    Filter.call( this, field );

    if( this.field.hasOwnProperty( 'default_filter_mode' ) ) {
        this.default_mode = this.field['default_filter_mode'];
    } else {
        this.default_mode = "between";
    }

    if( field.hasOwnProperty( 'default' ) ) {
        this.default_term  = field['default'][0];
        if( field['default'].length >= 2 ) {
            this.default_term2 = field['default'][1];
        } else {
            this.default_term2 = "";
        }
    } else {
        this.default_term  = "";
        this.default_term2  = "";
    }

    if( field["placeholder"] && field.placeholder["between"] && field.placeholder.between[0] && field.placeholder.between[1] ) {
        this.placeholder.between = field.placeholder.between;
    } else {
        this.placeholder.between = ["",""];
    }

    this.reset();
}
DateFilter.prototype = Object.create(Filter.prototype);

DateFilter.prototype.isDefault = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term == this.default_term && (this.mode != "between" || this.term2 == this.default_term2));
}
Filter.prototype.isSet = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    return (this.term != '' || (this.mode == "between" && this.term2 != ''));
}

DateFilter.prototype.reset = function() {
    this.mode = this.default_mode;
    this.term = this.default_term;
    this.term2 = this.default_term2;
}

DateFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else if( this.mode == "between" ) {
        return this.matchesValuesBetween( values );
    } else if( this.mode == "set" ) {
        return this.matchesValuesSet( values );
    } else if( this.mode == "not-set" ) {
        return this.matchesValuesNotSet( values );
    }
    console.log( "Unknown search mode "+this.mode+" on ", this );
    return false;
}
// for dates, date "is" actually is 'starts with' so that 1990-02-02 "is" 1990
DateFilter.prototype.matchesValuesIs = function(values) {
    var term = this.term.toLowerCase()
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value.indexOf(term) == 0 ) {
            return true; 
        }
    }
    return false;
}
DateFilter.prototype.matchesValuesBetween = function(values) {
    // Pad dates if they are missing month and day
    var term = this.term;
    if( term.length == 4 ) { term += "-00"; }
    if( term.length == 7 ) { term += "-00"; }
    var term2 = this.term2.toLowerCase()
    if( term2.length == 4 ) { term2 += "-99"; }
    if( term2.length == 7 ) { term2 += "-99"; }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        // null terms are treated as not being bounded so up-to- or from- if only one term is set
        if ((term=="" || value >= term) && (term2=="" || value <= term2 )) {
            return true;
        }
    }
    return false;
}

/*
 *  EnumFilter
 *  
 */
function EnumFilter( field ) {
    Filter.call( this, field );

    if( this.field.hasOwnProperty( 'default_filter_mode' ) ) {
        this.default_mode = this.field['default_filter_mode'];
    } else {
        this.default_mode = "one-of";
    }

    if( field.hasOwnProperty( 'default' ) ) {
        this.default_term  = field['default'][0];
        this.default_terms = [];
        field['default'].forEach( (term) => { this.default_terms.push( { 'name': term } ); } );
    } else {
        this.default_term  = "";
        this.default_terms = [];
    }

    // prep options just the way multiselect likes them
    this.field.multiselectOptions = [];
    for( var i=0;i<field.options.length;i++ ) {
        this.field.multiselectOptions.push( { name: field.options[i] } );
    }

    this.reset();
}

EnumFilter.prototype = Object.create(Filter.prototype);

EnumFilter.prototype.isDefault = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    if (this.mode == "is") {
        return this.term == this.default_term;
    } else if (this.mode == "one-of") {
        // this one is the pain. We need to compare the name properties of two unordered object lists
        let current_terms_code = this.terms.map( item => item["name"] ).sort().join(":");
        let default_terms_code = this.default_terms.map( item => item["name"] ).sort().join(":");
        return current_terms_code == default_terms_code;
    }
}
Filter.prototype.isSet = function() {
    if( this.mode == "set" || this.mode == "not-set" ) { return true; }
    if (this.mode == "is") {
        return this.term != '';
    } else if (this.mode == "one-of") {
        return this.terms.length > 0;
    }
}

EnumFilter.prototype.reset = function() {
    this.mode  = this.default_mode;
    this.term  = this.default_term;
    // need to ensure it's not the same actual list reference
    this.terms = this.default_terms.map( item=>item );
}

EnumFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        // find a value that matches the term
        for(var i = 0; i < values.length; i++) {
            if (values[i] == this.term) {
                return true;
            }
        }
        return false;
    } else if( this.mode == "one-of" ) {
        // do any of the terms match any of the values?
        for(var i = 0; i < values.length; i++) {
            for(var j = 0; j < this.terms.length; j++)
            // nb terms works differently in multiselect and is a list of objects
            if (values[i] == this.terms[j].name) {
                return true;
            }
        }
        return false;
    } else if( this.mode == "set" ) {
        return this.matchesValuesSet( values );
    } else if( this.mode == "not-set" ) {
        return this.matchesValuesNotSet( values );
    }

    console.log( "Unknown search mode "+this.mode+" on ", this );
    return false;
}

/*
 *  FreeTextFilter
 *  
 */
function FreeTextFilter( field ) {
    Filter.call( this, field );

    if( field.hasOwnProperty( 'default_filter_mode' ) ) {
        this.default_mode = field['default_filter_mode'];
    } else {
        this.default_mode = "contains";
    }

    if( field.hasOwnProperty( 'default' ) ) {
        this.default_term  = field['default'][0];
    } else {
        this.default_term  = "";
    }

    this.reset();
}
FreeTextFilter.prototype = Object.create(Filter.prototype);

FreeTextFilter.prototype.reset = function() {
    this.mode = this.default_mode;
    this.term = this.default_term;
}

FreeTextFilter.prototype.matchesRecord = function(record) {
    // check that all the terms are found in the record
    
    var terms = this.term.toLowerCase().split(/\s+/);

    termloop: for (var i = 0; i < terms.length; i++) {
        var term = make_pattern(terms[i]);
        var term_found = false;
        var fieldnames = Object.keys( record );
        fieldloop: for( var j=0; j<fieldnames.length; j++ ) {

            var values = record[fieldnames[j]].value;
            if (values == undefined) {
                continue;
            }
            if (!record[fieldnames[j]].field.multiple) {
                values = [values];
            }
            valueloop: for (var k = 0; k < values.length; k++) {
                var value = "" + values[k]; // force it into a string
                if (value.match(term)) {
                    term_found = true;
                    break fieldloop;
                }
            }
        }

        // has to match all terms
        if (!term_found) {
            return false;
        }

    }

    return true;
}







/*
 *  Vue Components
 */

Vue.component("intro", {
    template: "#templateIntro"
});

Vue.component("index-card", {
    props: ["record"],
    template: "#templateIndexCard",
    mounted: function() {
        // enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    }
});

Vue.component("summary-card", {
    props: ["record"],
    template: "#templateSummaryCard",
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    methods: {
        showIndexCard: function() {
            var record_id = this.record[this.dataset.config.id_field].value;
            this.$router.push({name: "record", params: { id: record_id }})
        }
    }
});

Vue.component("field-value", {
    props: {"typedValue": Object, "linkValue":{type:Boolean,default:true}},
    render: function (createElement) {
        var rendered_value;
        var classList = ["field-value"];
        if (!this.typedValue.value || (this.typedValue.field.multiple===true&&this.typedValue.value.length==0)) {
            rendered_value = "unspecified";
            classList.push( "field-null" );
        } else if (this.typedValue.field.multiple === true) {
            rendered_value = [];
            for (var i = 0; i < this.typedValue.value.length; ++i) {
                if (rendered_value.length) {
                    rendered_value.push("; ");
                }
                rendered_value.push( this.renderSingleValue( createElement, this.typedValue.value[i] ) );
            }
        } else {
            rendered_value = [this.renderSingleValue( createElement, this.typedValue.value )];
        }
        return createElement("div", {class: classList }, rendered_value);
    },
    methods: {
        renderSingleValue: function( createElement, value ) {
            var rvalue = value;
            if( this.typedValue.field.type == 'date' ) {
                var day = moment( rvalue );
                rvalue = day.format("dddd, D MMMM  YYYY");
            }
            if( this.linkValue ) {
                var path = "/browse/" + this.typedValue.field.id + "/" + value;
                rvalue = createElement( "router-link", {attrs:{to: path}}, rvalue );
            }
            return rvalue;
        }
    }
});

Vue.component("no-record", {
    template: "#templateNoRecord"
});





// utility functions

function is_object(value) {
    return value && typeof value === 'object' && value.constructor === Object;
}

// this can take a dataset or a vue component with the same properties
function records_to_table( fields, records ) {
    var table = [[]];
    
    for( var i=0; i<fields.length; ++i ) {
        table[0].push( fields[i].id );
    }
    for( var i=0; i<records.length; ++i ) {
        var record = records[i];
        var row = [];
        for( var j=0; j<fields.length; ++j ) {
            var field = fields[j];
            var v = record[field.id].value;
            if( field.multiple && v!=null ) {
                v = v.join( "; " );
            }
            row.push( v );
        }
        table.push( row );
    }
    return table;
}


function table_to_csv( table ) {
    var csv_rows = table.map( (row) => {
        var csv_cells = row.map( (cell) => {
            var csv_cell = '';
            if( cell !== null && cell !== undefined) {
                if (cell instanceof Date) {
                    csv_cell = cell.toLocaleString();
                } else {
                    csv_cell = cell.toString();
                }
            }
            return csv_cell.replace(/"/g, '""').replace(/\r\n/g, "\n");
        });
        return '"'+csv_cells.join( "\",\"" )+"\"\n";
    });
    return csv_rows.join( '' );
}

/* this function creates a download of a file with a given filename and mimetype. */
function download(filename, data, mimetype) {
    // create a blob starting with a utf8 BOM (you did want utf-8, right)
    var blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]),data], {type: mimetype});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}



/**
 * Creates a RegExp that matches the words in the search string.
 * Case and accent insensitive.
 * modified from https://stackoverflow.com/questions/227950/programatic-accent-reduction-in-javascript-aka-text-normalization-or-unaccentin
 */
function make_pattern(search_string) {
    var accented = {
        'A': '[Aa\xaa\xc0-\xc5\xe0-\xe5\u0100-\u0105\u01cd\u01ce\u0200-\u0203\u0226\u0227\u1d2c\u1d43\u1e00\u1e01\u1e9a\u1ea0-\u1ea3\u2090\u2100\u2101\u213b\u249c\u24b6\u24d0\u3371-\u3374\u3380-\u3384\u3388\u3389\u33a9-\u33af\u33c2\u33ca\u33df\u33ff\uff21\uff41]',
        'B': '[Bb\u1d2e\u1d47\u1e02-\u1e07\u212c\u249d\u24b7\u24d1\u3374\u3385-\u3387\u33c3\u33c8\u33d4\u33dd\uff22\uff42]',
        'C': '[Cc\xc7\xe7\u0106-\u010d\u1d9c\u2100\u2102\u2103\u2105\u2106\u212d\u216d\u217d\u249e\u24b8\u24d2\u3376\u3388\u3389\u339d\u33a0\u33a4\u33c4-\u33c7\uff23\uff43]',
        'D': '[Dd\u010e\u010f\u01c4-\u01c6\u01f1-\u01f3\u1d30\u1d48\u1e0a-\u1e13\u2145\u2146\u216e\u217e\u249f\u24b9\u24d3\u32cf\u3372\u3377-\u3379\u3397\u33ad-\u33af\u33c5\u33c8\uff24\uff44]',
        'E': '[Ee\xc8-\xcb\xe8-\xeb\u0112-\u011b\u0204-\u0207\u0228\u0229\u1d31\u1d49\u1e18-\u1e1b\u1eb8-\u1ebd\u2091\u2121\u212f\u2130\u2147\u24a0\u24ba\u24d4\u3250\u32cd\u32ce\uff25\uff45]',
        'F': '[Ff\u1da0\u1e1e\u1e1f\u2109\u2131\u213b\u24a1\u24bb\u24d5\u338a-\u338c\u3399\ufb00-\ufb04\uff26\uff46]',
        'G': '[Gg\u011c-\u0123\u01e6\u01e7\u01f4\u01f5\u1d33\u1d4d\u1e20\u1e21\u210a\u24a2\u24bc\u24d6\u32cc\u32cd\u3387\u338d-\u338f\u3393\u33ac\u33c6\u33c9\u33d2\u33ff\uff27\uff47]',
        'H': '[Hh\u0124\u0125\u021e\u021f\u02b0\u1d34\u1e22-\u1e2b\u1e96\u210b-\u210e\u24a3\u24bd\u24d7\u32cc\u3371\u3390-\u3394\u33ca\u33cb\u33d7\uff28\uff48]',
        'I': '[Ii\xcc-\xcf\xec-\xef\u0128-\u0130\u0132\u0133\u01cf\u01d0\u0208-\u020b\u1d35\u1d62\u1e2c\u1e2d\u1ec8-\u1ecb\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216a\u216b\u2170-\u2173\u2175-\u2178\u217a\u217b\u24a4\u24be\u24d8\u337a\u33cc\u33d5\ufb01\ufb03\uff29\uff49]',
        'J': '[Jj\u0132-\u0135\u01c7-\u01cc\u01f0\u02b2\u1d36\u2149\u24a5\u24bf\u24d9\u2c7c\uff2a\uff4a]',
        'K': '[Kk\u0136\u0137\u01e8\u01e9\u1d37\u1d4f\u1e30-\u1e35\u212a\u24a6\u24c0\u24da\u3384\u3385\u3389\u338f\u3391\u3398\u339e\u33a2\u33a6\u33aa\u33b8\u33be\u33c0\u33c6\u33cd-\u33cf\uff2b\uff4b]',
        'L': '[Ll\u0139-\u0140\u01c7-\u01c9\u02e1\u1d38\u1e36\u1e37\u1e3a-\u1e3d\u2112\u2113\u2121\u216c\u217c\u24a7\u24c1\u24db\u32cf\u3388\u3389\u33d0-\u33d3\u33d5\u33d6\u33ff\ufb02\ufb04\uff2c\uff4c]',
        'M': '[Mm\u1d39\u1d50\u1e3e-\u1e43\u2120\u2122\u2133\u216f\u217f\u24a8\u24c2\u24dc\u3377-\u3379\u3383\u3386\u338e\u3392\u3396\u3399-\u33a8\u33ab\u33b3\u33b7\u33b9\u33bd\u33bf\u33c1\u33c2\u33ce\u33d0\u33d4-\u33d6\u33d8\u33d9\u33de\u33df\uff2d\uff4d]',
        'N': '[Nn\xd1\xf1\u0143-\u0149\u01ca-\u01cc\u01f8\u01f9\u1d3a\u1e44-\u1e4b\u207f\u2115\u2116\u24a9\u24c3\u24dd\u3381\u338b\u339a\u33b1\u33b5\u33bb\u33cc\u33d1\uff2e\uff4e]',
        'O': '[Oo\xba\xd2-\xd6\xf2-\xf6\u014c-\u0151\u01a0\u01a1\u01d1\u01d2\u01ea\u01eb\u020c-\u020f\u022e\u022f\u1d3c\u1d52\u1ecc-\u1ecf\u2092\u2105\u2116\u2134\u24aa\u24c4\u24de\u3375\u33c7\u33d2\u33d6\uff2f\uff4f]',
        'P': '[Pp\u1d3e\u1d56\u1e54-\u1e57\u2119\u24ab\u24c5\u24df\u3250\u3371\u3376\u3380\u338a\u33a9-\u33ac\u33b0\u33b4\u33ba\u33cb\u33d7-\u33da\uff30\uff50]',
        'Q': '[Qq\u211a\u24ac\u24c6\u24e0\u33c3\uff31\uff51]',
        'R': '[Rr\u0154-\u0159\u0210-\u0213\u02b3\u1d3f\u1d63\u1e58-\u1e5b\u1e5e\u1e5f\u20a8\u211b-\u211d\u24ad\u24c7\u24e1\u32cd\u3374\u33ad-\u33af\u33da\u33db\uff32\uff52]',
        'S': '[Ss\u015a-\u0161\u017f\u0218\u0219\u02e2\u1e60-\u1e63\u20a8\u2101\u2120\u24ae\u24c8\u24e2\u33a7\u33a8\u33ae-\u33b3\u33db\u33dc\ufb06\uff33\uff53]',
        'T': '[Tt\u0162-\u0165\u021a\u021b\u1d40\u1d57\u1e6a-\u1e71\u1e97\u2121\u2122\u24af\u24c9\u24e3\u3250\u32cf\u3394\u33cf\ufb05\ufb06\uff34\uff54]',
        'U': '[Uu\xd9-\xdc\xf9-\xfc\u0168-\u0173\u01af\u01b0\u01d3\u01d4\u0214-\u0217\u1d41\u1d58\u1d64\u1e72-\u1e77\u1ee4-\u1ee7\u2106\u24b0\u24ca\u24e4\u3373\u337a\uff35\uff55]',
        'V': '[Vv\u1d5b\u1d65\u1e7c-\u1e7f\u2163-\u2167\u2173-\u2177\u24b1\u24cb\u24e5\u2c7d\u32ce\u3375\u33b4-\u33b9\u33dc\u33de\uff36\uff56]',
        'W': '[Ww\u0174\u0175\u02b7\u1d42\u1e80-\u1e89\u1e98\u24b2\u24cc\u24e6\u33ba-\u33bf\u33dd\uff37\uff57]',
        'X': '[Xx\u02e3\u1e8a-\u1e8d\u2093\u213b\u2168-\u216b\u2178-\u217b\u24b3\u24cd\u24e7\u33d3\uff38\uff58]',
        'Y': '[Yy\xdd\xfd\xff\u0176-\u0178\u0232\u0233\u02b8\u1e8e\u1e8f\u1e99\u1ef2-\u1ef9\u24b4\u24ce\u24e8\u33c9\uff39\uff59]',
        'Z': '[Zz\u0179-\u017e\u01f1-\u01f3\u1dbb\u1e90-\u1e95\u2124\u2128\u24b5\u24cf\u24e9\u3390-\u3394\uff3a\uff5a]'
    };

    // escape meta characters
    search_string = search_string.replace(/([|()[{.+*?^$\\])/g,"\\$1");

    // replace characters by their compositors
    var accent_replacer = function(chr) {
        return accented[chr.toUpperCase()] || chr;
    }
    search_string = search_string.replace(/\S/g,accent_replacer);

    return new RegExp(search_string,'g');
}


//# sourceURL=js/cape.js
