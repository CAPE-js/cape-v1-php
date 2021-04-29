// debounced-input
template = "<input v-bind:placeholder=\"input_placeholder\" v-bind:type=\"input_type\" v-bind:value=\"input_value\" v-bind:id=\"input_id\" v-on:input=\"debounce_input\">\n";
Vue.component("debounced-input", {
    props: { type:String, value:[String,Number], id:String, placeholder: {"type":String,"default":""}},
    // note: use computed to expose props as local values, this avoids bad practice vue warning.
    computed: {
        input_type: function() {
            return this.type;
        },
        input_value: function() {
            return this.value;
        },
        input_id: function() {
            return this.id;
        },
        input_placeholder: function() {
            return this.placeholder;
        }
    },
    template: template,
    created: function() {
        var this_component = this;
        this.debounce_input= _.debounce(function (e) {
            this_component.$emit('input', e.target.value);
        }, 500);
    }
});

// field-label-and-value
template = "<div>\n    <div class=\"field-label-and-value\">\n      <template v-if=\"typedValue.field.value != ''\">\n        <div class=\"field-label\" v-if=\"typedValue.field.description != null\" data-toggle=\"tooltip\" v-bind:title=\"typedValue.field.description\">{{typedValue.field.label}}<\/div>\n        <div class=\"field-label\" v-else>{{typedValue.field.label}}<\/div>\n        <field-value v-bind:typedValue=\"typedValue\" v-bind:linkValue=\"linkValue\"><\/field-value>\n      <\/template>\n    <\/div>\n<\/div>\n";
Vue.component("field-label-and-value", {
    props: ["typedValue","linkValue"],
    template: template
});


// field-label-and-value-if-set
template = "<field-label-and-value v-if=\"typedValue.value != '' && typedValue.value != null && !(typeof typedValue.value=='array' && typedValue.value.length==0)\" v-bind:typedValue=\"typedValue\" v-bind:linkValue=\"linkValue\"><\/field-label-and-value>\n";Vue.component("field-label-and-value-if-set", {
    props: ["typedValue","linkValue"],
    template: template
});

// fields-table
template = "            <table class=\"table\">\n                <thead>\n                <tr>\n                    <th scope=\"col\">Field id<\/th>\n                    <th scope=\"col\">Field name<\/th>\n                    <th scope=\"col\">Field type<\/th>\n                    <th scope=\"col\">Description<\/th>\n                <\/tr>\n                <\/thead>\n                <tbody>\n                <tr v-for=\"field in dataset.config.fields\">\n                    <td>{{ field.id }}<\/td>\n                    <td>{{ field.label }}<\/td>\n                    <td>{{ field.type }} <span v-if=\"field.multiple\"> list<\/span><\/td>\n                    <td>{{ field.description }}<\/td>\n                <\/tr>\n                <\/tbody>\n            <\/table>\n";Vue.component("fields-table", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});

// filter-form
template = "    <div class='filter-form'>\n        <div v-for=\"filter in filters\" :key=\"filter.field.id\" class=\"form-row mb-1\">\n            <div class=\"col-sm-2 text-sm-right\">\n                <label v-if=\"filter.field.description != null\" data-toggle=\"tooltip\" v-bind:title=\"filter.field.description\" v-bind:for=\"'filter-'+filter.field.id\">{{filter.field.label}}<\/label>\n                <label v-else v-bind:for=\"'filter-'+filter.field.id\">{{filter.field.label}}<\/label>\n            <\/div>\n            <template v-if=\"filter.field.type=='text'\">\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"contains\">contains<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is' || filter.mode=='contains'\">\n                        <debounced-input v-bind:type=\"'text'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder[filter.mode]\" class=\"form-control form-control-sm\"><\/debounced-input>\n                    <\/template>\n                <\/div>\n            <\/template>\n            <template v-else-if=\"filter.field.type=='integer'\">\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"between\">is between<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is'\">\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.is\" class=\"form-control form-control-sm\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\"><\/debounced-input>\n                    <\/template>\n                    <template v-if=\"filter.mode=='between'\">\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.number=\"filter.term\" v-bind:placeholder=\"filter.placeholder.between[0]\" class=\"form-control form-control-sm between-number-filter\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\"><\/debounced-input>\n                        and\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.number=\"filter.term2\" v-bind:placeholder=\"filter.placeholder.between[1]\"  class=\"form-control form-control-sm between-number-filter\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\"><\/debounced-input> \n                    <\/template>\n                <\/div>\n            <\/template>\n            <template v-else-if=\"filter.field.type=='date'\">\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"between\">is between<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is'\">\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.is\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\"><\/debounced-input>\n                    <\/template>\n                    <template v-if=\"filter.mode=='between'\">\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.between[0]\" class=\"form-control form-control-sm between-number-filter\" v-bind:id=\"'filter-to-'+filter.field.id\"><\/debounced-input>\n                        and\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term2\" v-bind:placeholder=\"filter.placeholder.between[1]\" class=\"form-control form-control-sm between-number-filter\" v-bind:id=\"'filter-from-'+filter.field.id\"><\/debounced-input>\n                    <\/template>\n                <\/div>\n            <\/template>\n            <template v-else-if=\"filter.field.type=='enum'\">\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"one-of\">one of<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is'\">\n                        <select v-model=\"filter.term\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\">\n                            <option selected=\"selected\" value=\"\">Select<\/option>\n                            <option v-for=\"option in filter.field.options\" v-bind:value=\"option\">{{ option }}<\/option>\n                        <\/select>\n                    <\/template>\n                    <template v-if=\"filter.mode=='one-of'\">\n                        <multiselect v-model=\"filter.terms\" :options=\"filter.field.multiselectOptions\" :multiple=\"true\" :close-on-select=\"true\" :clear-on-select=\"false\" :preserve-search=\"true\" placeholder=\"Pick some\" label=\"name\" track-by=\"name\" >\n                            <template slot=\"tag\" slot-scope=\"{ option, remove }\"><span class=\"custom__tag\"><span>{{ option.name }}<\/span><span class=\"custom__remove\" @click=\"remove(option)\">\u274c<\/span><\/span><\/template>\n                        <\/multiselect>\n                    <\/template>\n                <\/div>\n            <\/template>\n            <template v-else-if=\"filter.field.type=='freetext'\">\n                <div class=\"col-sm-10\">\n                    <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\"><\/debounced-input>\n                <\/div>\n            <\/template>\n            <template v-else>\n                <div class=\"col-sm-10\">\n                   Unknown filter type.\n                <\/div>\n            <\/template>\n        <\/div>\n    <\/div>\n";
Vue.component("filter-form", {
    data: function () {
        return {filter: this.$root.defaultDataset.filter};
    },
    props: ["filters"],
    template: template
});


// home-page
template = "    <form v-on:keypress.enter.prevent=\"ignoreEnter\">\n        <intro \/> \n        <div class=\"row\">\n            <div class=\"col text-sm-right pb-3 pt-3\">\n                <button v-on:click=\"resetFilters\" class=\"btn btn-secondary btn-sm\">New search<\/button>\n            <\/div>\n        <\/div>\n        <div class=\"row\">\n            <div class=\"col text-sm-right\">\n                <div class=\"switch switch-sm\">\n                    <input v-model=\"options.show_all_filters\" type=\"checkbox\" class=\"switch\" id=\"show-all-filters-upper\" \/>\n                    <label for=\"show-all-filters-upper\">Advanced search<\/label>\n                <\/div>\n            <\/div>\n        <\/div>\n        <div class=\"row mb-1\">\n            <div class=\"col\">\n                <filter-form v-bind:filters=\"visible_filters\"><\/filter-form>\n            <\/div>\n        <\/div>\n        <div class=\"row\" v-if=\"options.show_all_filters\">\n            <div class=\"col text-sm-right pb-3 pt-3\">\n                <button v-on:click=\"resetFilters\" class=\"btn btn-secondary btn-sm\">New search<\/button>\n            <\/div>\n        <\/div>\n\n        <div class=\"row mb-1\">\n            <div class=\"col-sm-6\">\n                Order results by \n                <select v-model=\"options.sort_field\"><option v-for=\"field in options.sort_fields\" v-bind:value=\"field.id\">{{field.label}}<\/option><\/select>\n                <select v-model=\"options.sort_dir\"><option value=\"asc\">Ascending<\/option><option value=\"desc\">Decending<\/option><\/select>\n            <\/div>\n            <div class=\"col-sm-6 text-sm-right\">\n                <div class=\"switch switch-sm\" v-if=\"options.show_all_filters\">\n                  <input v-model=\"options.show_all_filters\" type=\"checkbox\" class=\"switch\" id=\"show-all-filters-lower\" \/>\n                  <label for=\"show-all-filters-lower\">Show all filters<\/label>\n                <\/div>\n            <\/div>\n        <\/div>\n        <div class=\"row mb-1\">\n            <div class=\"col\">\n                <results v-bind:options=\"options\" v-bind:results=\"filteredAndSortedResults\"><\/results>\n            <\/div>\n        <\/div>\n    <\/form>\n";
var currentSearchResults = null;

var HomePage = Vue.component("home-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        data.options = this.$root.defaultDatasetOptions;

        data.visible_filters = [];

        if( this.$route.name=="browse" && this.$route.params.field != null && this.$route.params.value != null ) {
            data.browse= { field:this.$route.params.field, value:this.$route.params.value };
            data.options.filters_by_id[ data.browse.field ].mode = "is";
            data.options.filters_by_id[ data.browse.field ].term = data.browse.value;
        } else {
            data.browse = null;
        }

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
        '$route': function(to, from) {
            // triggered when we move between named routes
            this.onRouteUpdate( to );
        },
        'options.show_all_filters': function( to, from ) {
            this.setVisibleFilters();
        }
    },
    updated: function() {
        // enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    },
    methods: {
        onRouteUpdate: function(to) {
            // when the route is updated, update the filters
            if( to.name=="browse" && to.params.field != null && to.params.value != null ) {
                this.options.show_all_filters = false;
                this.resetFilters();
                this.browse= { field: to.params.field, value: to.params.value };
                this.options.filters_by_id[ this.browse.field ].mode = "is";
                this.options.filters_by_id[ this.browse.field ].term = this.browse.value;
            } else {
                this.browse = null;
            }
            this.setVisibleFilters();
        },
        setVisibleFilters: function() {
            this.visible_filters = [];
            for (var i = 0; i < this.options.filters.length; i++) {
                var filter = this.options.filters[i];
                if (( this.options.show_all_filters 
                   || filter.field.quick_search 
                   || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    this.visible_filters.push( filter );
                }
            } 
        },
        filterResults: function() {
            // build a list of filters to be applied
            var active_filters = [];
            for (var i = 0; i < this.options.filters.length; i++) {
                // does the filter pass?
                var filter = this.options.filters[i];
                if (filter.isSet() && ( this.options.show_all_filters 
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
            var component = this;
            results.sort( function(a,b) {
                var av = a[component.options.sort_field].value;
                var bv = b[component.options.sort_field].value;
                if(typeof av === 'array') { av = av[0]; }
                if(typeof bv === 'array') { bv = bv[0]; }
                if( av == null ) { av = ""; }
                if( bv == null ) { bv = ""; }
                av = av.toLowerCase();
                bv = bv.toLowerCase();
                if( av==bv ) { return 0; }
                if( component.options.sort_dir == 'asc'  && av>bv ) { return 1; }
                if( component.options.sort_dir == 'desc' && av<bv ) { return 1; }
                return -1;
            });
            return results;
        },
        resetFilters: function() {
            for (var i = 0; i < this.options.filters.length; i++) {
                this.options.filters[i].reset();
            }
        },
        ignoreEnter: function(e) { e.stopPropagation(); return true; }
    },
    computed: {
        // more efficient to have this as a computed as the results are cached
        filteredAndSortedResults: function() {
            var results = this.filterResults();
            results = this.sortResults(results);
            // argh, this is a side effect! It lets the record view know the prev and next result
            currentSearchResults = {};
            return results;
        }
    },
    template: template
});


// record-page
template = "    <div>\n        <div class=\"row\">\n            <div class=\"col\">\n                <index-card v-if=\"dataset.records_by_id[ $route.params.id ]\"\n                            v-bind:record=\"dataset.records_by_id[ $route.params.id ]\"><\/index-card>\n                <no-record v-else><\/no-record>\n            <\/div>\n        <\/div>\n    <\/div>\n";var RecordPage = Vue.component("record-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});


// results
template = "\n    <div>\n        <div v-if=\"results.length == 0\" class=\"card mb-1\">\n            <div class=\"card-body\">No records match your filter terms.<\/div>\n        <\/div>\n\n        <div v-else>\n            <results-summary v-bind:results=\"results\" v-bind:options=\"options\" v-bind:visible_records_count=\"visible_records.length\"><\/results-summary>\n            <div v-for=\"record in visible_records\">\n                <summary-card v-bind:record=\"record\"><\/summary-card>\n            <\/div>\n            <div class=\"floating-summary\">\n                <results-summary v-bind:results=\"results\" v-bind:options=\"options\" v-bind:visible_records_count=\"visible_records.length\"><\/results-summary>\n            <\/div>\n        <\/div>\n\n    <\/div>\n\n";
Vue.component("results", {
    template: template,
    props: ["results","options"],
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


// results-summary
template = "\n    <div class=\"result-summary\">\n        <div class=\"card mb-1\">\n            <div class=\"card-body\">\n                <div>\n                    <div v-if=\"visible_records_count==results.length\" class=\"record-count\">Showing all {{ visible_records_count }} matching records.<\/div>\n                    <div v-else class=\"record-count\">Showing first {{ visible_records_count }} of {{ results.length }} matching records.<\/div>\n                    <div class=\"switch switch-sm\">\n                        <input v-model=\"options.show_all_results\" type=\"checkbox\" class=\"switch\" id=\"show-all-results\" \/>\n                        <label for=\"show-all-results\">Show all matches<\/label>\n                    <\/div>\n                <\/div>\n            <\/div>\n        <\/div>\n    <\/div>\n";
Vue.component("results-summary", {
    template: template,
    props: ["results", "visible_records_count", "options"],
});


// zz-app
template = "<div>\n    <template v-if=\"app_status == 'dev'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-warning my-2\">\n          <div class=\"card-body text-center\">\n             This is a development instance of this service.\n             <br \/>\n             {{ git_info.branch }}_{{ git_info.commit_date | formatDate }}_{{ git_info.commit_id }}\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"app_status == 'pprd'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-warning my-2\">\n          <div class=\"card-body text-center\">\n             This is the pre-production instance of this service.\n             <br \/>\n             {{ git_info.branch }}_{{ git_info.commit_date | formatDate }}_{{ git_info.commit_id }}\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    \n    <template v-if=\"source_data.status == 'ERROR'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-error my-2\">\n          <div class=\"card-body text-center\">\n            <h2>Unable to load data<\/h2>\n            <p>An error has occurred. The error was: {{ source_data.error_message }}.<\/p>\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"source_data.status == 'LOADING'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-primary text-white my-2\">\n          <div class=\"card-body text-center\">\n            <div class=\"spinner-border\" role=\"status\">\n              <span class=\"sr-only\">Loading...<\/span>\n            <\/div>\n            <p>Please wait while the data loads.<\/p>\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"source_data.status == 'OK'\">\n        <dataset v-bind:dataset=\"defaultDataset\"><\/dataset>\n    <\/template>\n<\/div>\n";// zz just so this loads after all the other templates
new Vue({
    el: '#app',
    data: {
        source_data: {
            status: "LOADING"
        },
        app_status: (typeof app_status === 'undefined'?"dev":app_status),
	git_info: git_info
    },
    template: template,
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
            this.dataset_options_by_id = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for (ds_i = 0; ds_i < this.source_data.datasets.length; ++ds_i) {
                var dataset = {};

                var source = this.source_data.datasets[ds_i];

                // add config to dataset
                dataset.config = source.config;
                dataset.raw_records = source.records;

                // initialise enum registries
                var enums = {};
                var intmax = {};
                var intmin = {};

                // add fields mapped by ID, and populate the filter object
                dataset.fields_by_id = {};
 
                for (field_i = 0; field_i < source.config.fields.length; ++field_i) {
                    var field = source.config.fields[field_i];
                    dataset.fields_by_id[field.id] = field;

                    if (field.type == "enum") {
                        // init enum registry for an enum field
                        enums[field.id] = {};
                    }
                    if (field.type == "integer") {
                        intmin[field.id] = null;
                        intmax[field.id] = null;
                    }
                }

                // create a lookup table for record by id
                dataset.records_by_id = {};
                dataset.records = [];
                var prev_id=null;
                source.records.sort( (a,b)=>{
                    if( Number(a[dataset.config.id_field]) < Number(b[dataset.config.id_field]) ) {
                        return -1;
                    }
                    if( Number(a[dataset.config.id_field]) > Number(b[dataset.config.id_field]) ) {
                        return 1;
                    }
                    return 0;
                });
                    
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
                        if (field.type == "enum") {
                            var enum_values = value;
                            if( !field.multiple ) { enum_values = [ enum_values ]; }
                            for( var i=0;i<enum_values.length;i++ ) { 
                                if( enum_values[i] != "" && enum_values[i] != null ) {
                                    enums[field.id][enum_values[i]] = 1;
                                } 
                            } 
                        }
                        if (field.type == "integer" && value !== null ) {
                            value = parseInt( value );
                            if( isNaN(value) ) {
                                value = null; 
                            } else {
                                if( intmin[field.id]==null || value < intmin[field.id] ) {
                                    intmin[field.id] = value;
                                }
                                if( intmax[field.id]==null || value > intmax[field.id] ) {
                                    intmax[field.id] = value;
                                }
                                value = ""+value;
                            }
                        }

                        record[field.id] = {value: value, field: field};
                    }
                    var id = source_record[dataset.config.id_field];
                    if( prev_id !== null ) {
                        record.prev = prev_id;
                        dataset.records_by_id[prev_id].next = id;
                    } 
                    dataset.records_by_id[id] = record;
                    dataset.records.push(record);
                    prev_id = id;
                }
                // add this list of enum values to each enum field
                var enum_fields = Object.keys(enums);
                for (var enum_i = 0; enum_i < enum_fields.length; enum_i++) {
                    var fieldname = enum_fields[enum_i];
                    dataset.fields_by_id[fieldname].options = Object.keys(enums[fieldname]).sort(function(a, b) {
                        var a_value = a.toLowerCase();
                        var b_value = b.toLowerCase();
                        return a_value.localeCompare(b_value);
                })};

                // add integer max and mins to each integer field
                var int_fields = Object.keys(intmin);
                for (var int_i = 0; int_i < int_fields.length; int_i++) {
                    var fieldname = int_fields[int_i];
                    // nb. force these to be strings
                    dataset.fields_by_id[fieldname].min = ""+intmin[fieldname];
                    dataset.fields_by_id[fieldname].max = ""+intmax[fieldname];
                }

                /* Init options for this dataset, used by subcomponents */

                var options = {};
                options.filters_by_id = {};
                options.filters = [];
                options.show_all_filters = false;
        
                var free_text_filter = makeFilter( { label:"Search", quick_search:true, type:"freetext", id:"freetext", description:"Search for terms anywhere in the record" } );
                options.filters.push(free_text_filter);
        
                for (field_i = 0; field_i < dataset.config.fields.length; ++field_i) {
                    var field = dataset.config.fields[field_i];
                    if( field.filter === undefined ) { field.filter = true; };
                    if( field.filter ) {
                        var filter = makeFilter( field );
                        options.filters_by_id[field.id] = filter;
                        options.filters.push(filter);
                    }
                }
        
                // expand sort field names into actual field objects for MVC
                options.sort_dir = "asc"; // or desc
                options.sort_fields = [];
                for( var i=0; i<dataset.config.sort.length; ++i ) {
                     var field = dataset.fields_by_id[ dataset.config.sort[i] ];
                     options.sort_fields.push( field );
                }
                options.sort_field = options.sort_fields[0].id;


                // add dataset to our dataset collection
                this.datasets_by_id[dataset.config.id] = dataset;
                this.dataset_options_by_id[dataset.config.id] = options;


                // first dataset becomes the default
                if (ds_i == 0) {
                    this.defaultDataset = dataset;
                    this.defaultDatasetOptions = options;
                }
            }
        }, function(response) {
            // error callback
            this.source_data.status = "ERROR"
            this.source_data.error_message = "Error loading data over network";
        })
    },

    methods: {
    },

    router: new VueRouter({
        routes: [
            {name: 'root', path: '/', component: HomePage},
            {name: 'data', path: '/data', component: DataPage},
            {name: 'record', path: '/record/:id', component: RecordPage},
            {name: 'browse', path: '/browse/:field/:value', component: HomePage},
        ]
    })

}); // end of app


