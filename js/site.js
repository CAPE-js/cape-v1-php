// filter factory
function makeFilter( field ) {
    switch (field.type) {
        case "text":    return new TextFilter( field ); 
        case "integer": return new IntegerFilter( field ); 
        case "enum":    return new EnumFilter( field ); 
        case "date":    return new DateFilter( field ); 
        case "freetext":return new FreeTextFilter( field ); 
    }
    console.log("No filter for field type "+field.type);
}

/*
 *  Filter
 *  abstract base class, should not be instantiated directly
 */
function Filter( field ) {
    this.reset();
    this.field = field;
}

Filter.prototype.isSet = function() {
    return (this.term != "");
}

Filter.prototype.reset = function() {
    this.term = "";
    this.mode = "contains";
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
        var term = terms[i];
        var term_found = false;
        for (var j = 0; j < values.length; j++) {

            var value = values[j];
            if (value.toLowerCase().indexOf(term) > -1) {
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
Filter.prototype.matchesRecord = function(record) {
    /* Assumes that the filter is set */
    
    var values = record[this.field.id].value;
    if (values === null) {
        return false;
    }
    if (this.field.multiple && values.length==0) {
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
}
TextFilter.prototype = Object.create(Filter.prototype);
TextFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else {
        // not 'is' so must be a 'contains' search
        return this.matchesValuesContains( values );
    }
}

/*
 *  IntegerFilter
 *  
 */
function IntegerFilter( field ) {
    Filter.call( this, field );
}

IntegerFilter.prototype = Object.create(Filter.prototype);

IntegerFilter.prototype.isSet = function() {
    return (this.term != "" || (this.mode == "between" && this.term2 != ""));
}

IntegerFilter.prototype.reset = function() {
    this.mode = "between";
    this.term = "";
    this.term2 = "";
}

IntegerFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else {
        // not 'is' so must be a 'between' search
        return this.matchesValuesBetween( values );
    }
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
    this.mode = "between";
    this.term2 = "";
}
DateFilter.prototype = Object.create(Filter.prototype);

DateFilter.prototype.isSet = function() {
    return (this.term != "" || (this.mode == "between" && this.term2 != ""));
}

DateFilter.prototype.reset = function() {
    this.mode = "between";
    this.term = "";
    this.term2 = "";
}

DateFilter.prototype.matchesValues = function(values) {
    if( this.mode == "is" ) {
        return this.matchesValuesIs( values );
    } else {
        // not 'is' so must be a 'between' search
        return this.matchesValuesBetween( values );
    }
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
}

EnumFilter.prototype = Object.create(Filter.prototype);

EnumFilter.prototype.isSet = function() {
    if (this.mode == "is") {
        return this.term != "";
    } else if (this.mode == "one-of") {
        return this.terms.length != 0;
    }
}

EnumFilter.prototype.reset = function() {
    this.mode = "is";
    this.term = "";
    this.terms = [];
}

EnumFilter.prototype.matchesValues = function(values) {

    if (this.mode=='is') {
        // find a value that matches the term
        for(var i = 0; i < values.length; i++) {
            if (values[i] == this.term) {
                return true;
            }
        }
        return false;

    } else if (this.mode == 'one-of') {
        // do any of the terms match any of the values?
        for(var i = 0; i < values.length; i++) {
            for(var j = 0; j < this.terms.length; j++)
            if (values[i] == this.terms[j]) {
                return true;
            }
        }
        return false;
    }

    return this.matchesValuesIs( values );
}

/*
 *  FreeTextFilter
 *  
 */
function FreeTextFilter( field ) {
    Filter.call( this, field );
}
FreeTextFilter.prototype = Object.create(Filter.prototype);
FreeTextFilter.prototype.matchesRecord = function(record) {
    // check that all the terms are found in the record
    
    var terms = this.term.toLowerCase().split(/\s+/);

    termloop: for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var term_found = false;
        var fieldnames = Object.keys( record );
        fieldloop: for( var j=0; j<fieldnames.length; j++ ) {
             var values = record[fieldnames[j]].value;
             if( values == undefined ) { break; }
             if( !record[fieldnames[j]].field.multiple ) {
                 values = [values];
             }
             valueloop: for (var k = 0; k < values.length; k++) {
                  var value = ""+values[k]; // force it into a string
                  if (value.toLowerCase().indexOf(term) > -1) {
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

var HomePage = Vue.component("home-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        data.filters_by_id = {};
        data.filters = [];
        data.show_all_filters = false;

        var free_text_filter = makeFilter( { label:"Search", quick_search:true, type:"freetext" } );
        data.filters.push(free_text_filter);

        for (field_i = 0; field_i < data.dataset.config.fields.length; ++field_i) {
            var field = data.dataset.config.fields[field_i];
            if( field.filter === undefined ) { field.filter = true; };
            if( field.filter ) {
                var filter = makeFilter( field );
                data.filters_by_id[field.id] = filter;
                data.filters.push(filter);
            }
        }

        // expand sort field names into actual field objects for MVC
        data.sort_dir = "asc"; // or desc
        data.sort_fields = [];
        for( var i=0; i<data.dataset.config.sort.length; ++i ) {
             var field = data.dataset.fields_by_id[ data.dataset.config.sort[i] ];
             data.sort_fields.push( field );
        }
        data.sort_field = data.sort_fields[0].id;

        if( this.$route.name=="browse" && this.$route.params.field != null && this.$route.params.value != null ) {
            data.browse= { field:this.$route.params.field, value:this.$route.params.value };
            data.filters_by_id[ data.browse.field ].mode = "is";
            data.filters_by_id[ data.browse.field ].term = data.browse.value;
        } else {
            data.browse = null;
        }

        data.visible_filters = [];

        return data;
    },
    beforeRouteUpdate: function(to, from, next) {
        // triggered when the params to the current route changes
        this.onRouteUpdate( to );
    },
    mounted: function() { 
        // triggered when the template dom is rendered the first time
        this.setVisibleFilters();
    },
    watch: {
        '$route' (to, from) {
            // triggered when we move between named routes
            this.onRouteUpdate( to );
        }
    },
    methods: {
        onRouteUpdate: function(to) {
            // when the route is updated, update the filters
            if( to.name=="browse" && to.params.field != null && to.params.value != null ) {
                this.show_all_filters = false;
                this.resetFilters();
                this.browse= { field: to.params.field, value: to.params.value };
                this.filters_by_id[ this.browse.field ].mode = "is";
                this.filters_by_id[ this.browse.field ].term = this.browse.value;
            } else {
                this.browse = null;
            }
            this.setVisibleFilters();
        },
 
        setVisibleFilters: function() {
            this.visible_filters = [];
            for (var i = 0; i < this.filters.length; i++) {
                var filter = this.filters[i];
                if (( this.show_all_filters 
                   || filter.field.quick_search 
                   || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    this.visible_filters.push( filter );
                }
            } 
        },
        filteredAndSortedResults: function() {
            var results = this.filterResults();
            results = this.sortResults(results);
            return results;
        },
        filterResults: function() {
            // build a list of filters to be applied
            var active_filters = [];
            for (var i = 0; i < this.filters.length; i++) {
                // does the filter pass?
                var filter = this.filters[i];
                if (filter.isSet() && ( this.show_all_filters 
                                     || filter.field.quick_search 
                                     || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    active_filters.push(filter);
                }
            }

            // iterate over each record
            var records_to_show = [];
            for (var i = 0; i < this.dataset.records.length; i++) {
                var record = this.dataset.records[i];

                // iterate over each active filter
                var all_match = true;
                for (var j = 0; j < active_filters.length; j++) {
                    // does the filter pass?
                    var filter = active_filters[j];
                    if (!filter.matchesRecord(record)) {
                        all_match = false;
                        break;
                    }
                }

                // if all filters pass then add to array of matching records
                if (all_match) {
                    records_to_show.push(record);
                }
            }

            return records_to_show;
        },
        sortResults: function(results) {
            // sort records based on sort field
            var dataset = this;
            results.sort( function(a,b) {
                var av = a[dataset.sort_field].value;
                var bv = b[dataset.sort_field].value;
                if(typeof av === 'array') { av = av[0]; }
                if(typeof bv === 'array') { bv = bv[0]; }
                if( av == null ) { av = ""; }
                if( bv == null ) { bv = ""; }
                av = av.toLowerCase();
                bv = bv.toLowerCase();
                if( av==bv ) { return 0; }
                if( dataset.sort_dir == 'asc'  && av>bv ) { return 1; }
                if( dataset.sort_dir == 'desc' && av<bv ) { return 1; }
                return -1;
            });
            return results;
        },
        resetFilters: function() {
            for (var i = 0; i < this.filters.length; i++) {
                this.filters[i].reset();
            }
        }
    },
    template: "#templateHome",
});

var DataPage = Vue.component("data-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: "#templateData",
    methods: {
        downloadJSON: function() {
            var filename = this.dataset.config.id+".json";
            download( filename, JSON.stringify(this.raw_records), "application/json" );
        },
        downloadCSV: function() {
            var table = records_to_table( this.dataset.config.fields, this.dataset.records );
            var csv = table_to_csv( table );
            var filename = this.dataset.config.id+".csv";
            download( filename, csv, "text/csv;charset=utf-8" );
        }
    }
});

var RecordPage = Vue.component("record-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: "#templateRecord"
});

Vue.component("dataset", {
    template: "#templateDataset",
    props: ["dataset"]
});

Vue.component("filter-form", {
    data: function () {
        return {filter: this.$root.defaultDataset.filter};
    },
    props: ["filters"],
    template: "#templateFilterForm",
});

Vue.component("results", {
    template: "#templateResults",
    props: ["results"],
    data: function() {
        return {
            options:{show_all_results: false},
        }
    },
    computed: {
        visible_records: function() {
            if (this.options.show_all_results) {
                return this.results;
            } else {
                return this.results.slice(0, 50);
            }
        }
    }
});

Vue.component("results-summary", {
    template: "#templateResultsSummary",
    props: ["results", "visible_records_count", "options"],
});

Vue.component("index-card", {
    props: ["record"],
    template: "#templateIndexCard"
});

Vue.component("summary-card", {
    props: ["record"],
    template: "#templateSummaryCard",
    methods: {
        showIndexCard: function() {
            var record_id = this.record.record_number.value;
            this.$router.push({name: "record", params: { id: record_id }})
        }
    }
});

Vue.component("field-value", {
    props: ["typedValue"],
    render: function (createElement) {
        var rendered_value;
        var classList = ["field-value"];
        if (!this.typedValue.value) {
            rendered_value = "unspecified";
            classList.push( "field-null" );
        } else {
            if (this.typedValue.field.multiple === true) {
                rendered_value = [];
                for (var i = 0; i < this.typedValue.value.length; ++i) {
                    single_value = this.typedValue.value[i];
                    if (rendered_value.length) {
                        rendered_value.push(", ");
                    }
                    rendered_value.push(single_value);
                }
            } else {
                rendered_value = this.typedValue.value;
            }
        }
        return createElement("div", {class: classList }, rendered_value);
    }
});

Vue.component("field-label-and-value", {
    props: ["typedValue"],
    template: "#templateFieldLabelAndValue"
});

Vue.component("field-label-and-value-if-set", {
    props: ["typedValue"],
    template: "#templateFieldLabelAndValueIfSet"
});

var app = new Vue({
    el: '#app',
    data: {
        source_data: {
            status: "LOADING"
        },
        app_status: (typeof app_status === 'undefined'?"dev":app_status),
        records_by_id: []
    },
    template: "#templateApp",
    created: function () {
        if (typeof data_location === 'undefined') {
            this.source_data.status = "ERROR";
            this.source_data.error_message = "Please ensure that local.js sets the property data_location";
            return;
        }
            
        // GET /someUrl
        this.$http.get( data_location ).then(function(response) {
            // get body data
            if (!is_object(response.body)) {
                this.source_data.status = "ERROR";
                this.source_data.error_message = "Downloaded data is not a JSON object";
                return;
            }

            this.source_data = response.body;
            if (this.source_data.status == "ERROR") {
                return;
            }

            this.datasets_by_id = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for (ds_i = 0; ds_i < this.source_data.datasets.length; ++ds_i) {
                var dataset = {};

                var source = this.source_data.datasets[ds_i];

                // add config to dataset
                dataset.config = source.config;
                dataset.raw_records = source.records;

                // initialise enum registries
                var enums = {};

                // add fields mapped by ID, and populate the filter object
                dataset.fields_by_id = {};
 
                for (field_i = 0; field_i < source.config.fields.length; ++field_i) {
                    var field = source.config.fields[field_i];
                    dataset.fields_by_id[field.id] = field;

                    if (field.type == "enum") {
                        // init enum registry for an enum field
                        enums[field.id] = {};
                    }
                }

                // create a lookup table for record by id
                dataset.records_by_id = {};
                dataset.records = [];
                for (record_i = 0; record_i < source.records.length; ++record_i) {
                    var source_record = source.records[record_i];
                    var record = {};
                    for (field_i = 0; field_i < source.config.fields.length; ++field_i) {
                        var field = source.config.fields[field_i];
                        var value = source_record[field.id];
                        if (field.type == 'date' && value) {
                            // convert 25/12/2001 to 2001-12-25 TODO: this should use sprintf or date functions
                            value = value.split("/").reverse().join("-");
                        }
                        record[field.id] = {value: value, field: field};

                        if (field.type == "enum") {
                            var enum_values = value;
                            if( !field.multiple ) { enum_values = [ enum_values ]; }
                            for( var i=0;i<enum_values.length;i++ ) { 
                                if( enum_values[i] != "" ) {
                                    enums[field.id][enum_values[i]] = 1;
                                } 
                            } 
                        }
                    }
                    dataset.records_by_id[source_record[dataset.config.id_field]] = record;
                    dataset.records.push(record);
                }

                // add this list of enum values to each enum field
                var enum_fields = Object.keys(enums);
                for (var enum_i = 0; enum_i < enum_fields.length; enum_i++) {
                    dataset.fields_by_id[enum_fields[enum_i]].options = Object.keys(enums[enum_fields[enum_i]]).sort(function(a, b) {
                        var a_value = a.toLowerCase();
                        var b_value = b.toLowerCase();
                        return a_value.localeCompare(b_value);
                })};

                // add dataset to our dataset collection
                this.datasets_by_id[dataset.config.id] = dataset;

                // first dataset becomes the default
                if (ds_i == 0) {
                    this.defaultDataset = dataset;
                }
            }
        }, function(response) {
            // error callback
            this.source_data.status = "ERROR"
            this.source_data.error_message = "Error loading data over network";
        })
    },

    methods: {},

    router: new VueRouter({
        routes: [
            {name: 'root', path: '/', component: HomePage},
            {name: 'data', path: '/data', component: DataPage},
            {name: 'record', path: '/record/:id', component: RecordPage},
            {name: 'browse', path: '/browse/:field/:value', component: HomePage},
        ]
    })

}); // end of app

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
    var process_row = function (row) {
        var final_val = '';
        for (var j = 0; j < row.length; j++) {
            var inner_val = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                inner_val = row[j].toLocaleString();
            };
            var result = inner_val.replace(/"/g, '""').replace(/\r\n/g, "\n");
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                final_val += ',';
            final_val += result;
        }
        return final_val + '\n';
    };
    var csv_file = '';
    for (var i = 0; i < table.length; i++) {
        csv_file += process_row(table[i]);
    }
    return csv_file;
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
