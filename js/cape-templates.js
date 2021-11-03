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
template = "<div>\n    <div class=\"field-label-and-value\">\n      <div v-if=\"!typedValue\" class='cape-error'>[Error, trying to render non-existant field]<\/div>\n      <template v-else-if=\"typedValue.field.value != ''\">\n        <div class=\"field-label\" v-if=\"typedValue.field.description != null\" data-toggle=\"tooltip\" v-bind:title=\"typedValue.field.description\">{{typedValue.field.label}}<\/div>\n        <div class=\"field-label\" v-else>{{typedValue.field.label}}<\/div>\n        <field-value v-bind:typedValue=\"typedValue\" v-bind:linkValue=\"linkValue\"><\/field-value>\n      <\/template>\n    <\/div>\n<\/div>\n";
Vue.component("field-label-and-value", {
    props: ["typedValue","linkValue"],
    template: template
});


// field-label-and-value-if-set
template = "<div>\n  <div v-if=\"!typedValue\" class='cape-error'>[Error, trying to render non-existant field]<\/div>\n  <field-label-and-value v-else-if=\"typedValue.value != '' && typedValue.value != null && !(typeof typedValue.value=='array' && typedValue.value.length==0)\" v-bind:typedValue=\"typedValue\" v-bind:linkValue=\"linkValue\"><\/field-label-and-value>\n<\/div>\n";Vue.component("field-label-and-value-if-set", {
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

// filter-field-date
template = "            <div class=\"form-row mb-1\">\n                <filter-field-label v-bind:filter=\"filter\"><\/filter-field-label>\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"between\">is between<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is'\">\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.is\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\"><\/debounced-input>\n                    <\/template>\n                    <template v-if=\"filter.mode=='between'\">\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.between[0]\" class=\"form-control form-control-sm between-number-filter\" v-bind:id=\"'filter-to-'+filter.field.id\"><\/debounced-input>\n                        and\n                        <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term2\" v-bind:placeholder=\"filter.placeholder.between[1]\" class=\"form-control form-control-sm between-number-filter\" v-bind:id=\"'filter-from-'+filter.field.id\"><\/debounced-input>\n                    <\/template>\n                <\/div>\n            <\/div>\n";Vue.component("filter-field-date", {
    props: ["filter"],
    template: template
});


// filter-field-enum
template = "            <div class=\"form-row mb-1\">\n\n                <filter-field-label v-bind:filter=\"filter\"><\/filter-field-label>\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"one-of\">one of<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n\n                <template v-if=\"filter.mode=='is'\">\n                    <div v-if=\"filterStyle['is'] == 'radio'\" class=\"col-sm-8\">\n                        <div v-for=\"option in filter.field.options\" class=\"form-check form-check-inline\">\n                            <input v-model=\"filter.term\" class=\"form-check-input\" type=\"radio\" v-bind:id=\"'filter-'+filter.field.id+'-'+option\" v-bind:value=\"option\">\n                            <label class=\"form-check-label\" v-bind:for=\"'filter-'+filter.field.id+'-'+option\">{{option}}<\/label>\n                        <\/div>\n                        <div class=\"form-check form-check-inline\">\n                            <input v-model=\"filter.term\" class=\"form-check-input\" type=\"radio\" v-bind:id=\"'filter-'+filter.field.id+'-'\" value=\"\">\n                            <label class=\"form-check-label\" v-bind:for=\"'filter-'+filter.field.id+'-'\"><em>any<\/em><\/label>\n                        <\/div>\n                    <\/div>\n                    <div v-if=\"filterStyle['is'] == 'select'\" class=\"col-sm-8\">\n                        <select v-model=\"filter.term\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\">\n                            <option selected=\"selected\" value=\"\">Select<\/option>\n                            <option v-for=\"option in filter.field.options\" v-bind:value=\"option\">{{ option }}<\/option>\n                        <\/select>\n                    <\/div>\n                <\/template>\n\n                <template v-if=\"filter.mode=='one-of'\">\n                    <div v-if=\"filterStyle['one-of'] == 'checkbox'\" class=\"col-sm-8\">\n                        <div v-for=\"option in filter.field.options\" class=\"form-check form-check-inline\">\n                            <input v-model=\"filter.terms\" class=\"form-check-input\" type=\"checkbox\" v-bind:id=\"'filter-'+filter.field.id+'-'+option\" v-bind:value=\"{'name':option}\">\n                            <label class=\"form-check-label\" v-bind:for=\"'filter-'+filter.field.id+'-'+option\">{{option}}<\/label>\n                        <\/div>\n                    <\/div>\n                    <div v-if=\"filterStyle['one-of'] == 'multiselect'\" class=\"col-sm-8\">\n                        <multiselect v-model=\"filter.terms\" :options=\"filter.field.multiselectOptions\" :multiple=\"true\" :close-on-select=\"true\" :clear-on-select=\"false\" :preserve-search=\"true\" placeholder=\"Pick some\" label=\"name\" track-by=\"name\" >\n                            <template slot=\"tag\" slot-scope=\"{ option, remove }\"><span class=\"custom__tag\"><span>{{ option.name }}<\/span><span class=\"custom__remove\" @click=\"remove(option)\">\u274c<\/span><\/span><\/template>\n                        <\/multiselect>\n                    <\/div>\n                <\/template>\n\n            <\/div>\n";Vue.component("filter-field-enum", {
    props: ["filter"],
    computed: {
        // some of the filter modes for enum have an optional alternate style
        filterStyle: function() {
            // default styles
            var style = { 
                'is': 'select', 
                'one-of': 'multiselect' 
            };
            // only accept valid options
            if( this.filter.field['style'] ) {
                if( this.filter.field['style']['is']     == 'radio' )    { style['is'] = "radio"; }
                if( this.filter.field['style']['one-of'] == 'checkbox' ) { style['one-of'] = "checkbox"; }
            };
            return style;
        }
    },
    template: template,
});


// filter-field-freetext
template = "            <div class=\"form-row mb-1\">\n                <filter-field-label v-bind:filter=\"filter\"><\/filter-field-label>\n                <div class=\"col-sm-10\">\n                    <debounced-input v-bind:type=\"'text'\" v-model.trim=\"filter.term\" class=\"form-control form-control-sm\" v-bind:id=\"'filter-'+filter.field.id\"><\/debounced-input>\n                <\/div>\n            <\/div>\n";Vue.component("filter-field-freetext", {
    props: ["filter"],
    template: template
});


// filter-field-integer
template = "            <div class=\"form-row mb-1\">\n                <filter-field-label v-bind:filter=\"filter\"><\/filter-field-label>\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"between\">is between<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is'\">\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder.is\" class=\"form-control form-control-sm\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\" v-bind:step=\"filter.field.step\"><\/debounced-input>\n                    <\/template>\n                    <template v-if=\"filter.mode=='between'\">\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.number=\"filter.term\" v-bind:placeholder=\"filter.placeholder.between[0]\" class=\"form-control form-control-sm between-number-filter\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\" v-bind:step=\"filter.field.step\"><\/debounced-input>\n                        and\n                        <debounced-input v-bind:type=\"'number'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.number=\"filter.term2\" v-bind:placeholder=\"filter.placeholder.between[1]\"  class=\"form-control form-control-sm between-number-filter\" v-bind:min=\"filter.field.min\" v-bind:max=\"filter.field.max\" v-bind:step=\"filter.field.step\"><\/debounced-input> \n                    <\/template>\n                <\/div>\n            <\/div>\n";Vue.component("filter-field-integer", {
    props: ["filter"],
    template: template
});



// filter-field-label
template = "            <div class=\"col-sm-2 text-sm-right\">\n                <label v-if=\"filter.field.description != null\" data-toggle=\"tooltip\" v-bind:title=\"filter.field.description\" v-bind:for=\"'filter-'+filter.field.id\">{{filter.field.label}}<\/label>\n                <label v-else v-bind:for=\"'filter-'+filter.field.id\">{{filter.field.label}}<\/label>\n            <\/div>\n";Vue.component("filter-field-label", {
    props: ["filter"],
    template: template
});

// filter-field-text
template = "            <div class=\"form-row mb-1\">\n                <filter-field-label v-bind:filter=\"filter\"><\/filter-field-label>\n                <div class=\"col-sm-2\">\n                    <select v-model.trim=\"filter.mode\" class=\"form-control form-control-sm\">\n                        <option value=\"is\">is<\/option>\n                        <option value=\"contains\">contains<\/option>\n                        <option value=\"set\">is present<\/option>\n                        <option value=\"not-set\">is not present<\/option>\n                    <\/select>\n                <\/div>\n                <div class=\"col-sm-8\">\n                    <template v-if=\"filter.mode=='is' || filter.mode=='contains'\">\n                        <debounced-input v-bind:type=\"'text'\" v-bind:id=\"'filter-'+filter.field.id\" v-model.trim=\"filter.term\" v-bind:placeholder=\"filter.placeholder[filter.mode]\" class=\"form-control form-control-sm\"><\/debounced-input>\n                    <\/template>\n                <\/div>\n            <\/div>\n";Vue.component("filter-field-text", {
    props: ["filter"],
    template: template
});

// filter-form
template = "    <div class='filter-form'>\n        <div v-for=\"filter in filters\" :key=\"filter.field.id\">\n            <filter-field-text          v-if=\"filter.field.type=='text'\"     v-bind:filter=\"filter\"><\/filter-field-text>\n            <filter-field-integer  v-else-if=\"filter.field.type=='integer'\"  v-bind:filter=\"filter\"><\/filter-field-integer>\n            <filter-field-date     v-else-if=\"filter.field.type=='date'\"     v-bind:filter=\"filter\"><\/filter-field-date>\n            <filter-field-enum     v-else-if=\"filter.field.type=='enum'\"     v-bind:filter=\"filter\"><\/filter-field-enum>\n            <filter-field-freetext v-else-if=\"filter.field.type=='freetext'\" v-bind:filter=\"filter\"><\/filter-field-freetext>\n            <template v-else>\n                <div class=\"col-sm-10\">\n                   Unknown filter type.\n                <\/div>\n            <\/template>\n        <\/div>\n    \n<\/div>\n";
Vue.component("filter-form", {
    data: function () {
        return {filter: this.$root.defaultDataset.filter};
    },
    props: ["filters"],
    template: template
});


// home-page
template = "    <form v-on:keypress.enter.prevent=\"ignoreEnter\">\n        <intro \/> \n        <div class=\"row\">\n            <div class=\"col text-right\">\n                <div>\n                    <button v-on:click=\"resetFilters\" class=\"btn btn-sm btn-secondary \">New search<\/button>\n                <\/div>\n                <div class=\"switch switch-sm mb-3 mt-3\">\n                    <input v-model=\"settings.show_all_filters\" type=\"checkbox\" class=\"switch\" id=\"show-all-filters-lower\" \/>\n                    <label for=\"show-all-filters-lower\">Advanced search<\/label>\n                <\/div>\n            <\/div>\n        <\/div>\n        <div class=\"row mb-1\">\n            <div class=\"col\">\n                <filter-form v-bind:filters=\"visible_filters\"><\/filter-form>\n            <\/div>\n        <\/div>\n\n        <template v-if=\"showResults\">\n           <div class=\"row mb-1 form-row\">\n              <div class=\"col-sm-2 text-sm-right\">\n                  Order results by \n              <\/div>\n              <div class=\"col-sm-4\">\n                  <select v-model=\"settings.sort_field\" style=\"width:auto; display: inline-block\" class=\"form-control form-control-sm\"><option v-for=\"field in settings.sort_fields\" v-bind:value=\"field.id\">{{field.label}}<\/option><\/select>\n                  <select v-model=\"settings.sort_dir\" style=\"width:auto; display: inline-block\" class=\"form-control form-control-sm\"><option value=\"asc\">Ascending<\/option><option value=\"desc\">Decending<\/option><\/select>\n              <\/div>\n              <div class=\"col-sm-6 text-sm-right\" v-if=\"settings.show_all_filters\">\n                  <div>\n                      <button v-on:click=\"resetFilters\" class=\"btn btn-sm btn-secondary \">New search<\/button>\n                  <\/div>\n                  <div class=\"switch switch-sm mb-3 mt-3\">\n                      <input v-model=\"settings.show_all_filters\" type=\"checkbox\" class=\"switch\" id=\"show-all-filters-lower\" \/>\n                      <label for=\"show-all-filters-lower\">Advanced search<\/label>\n                  <\/div>\n              <\/div>\n           <\/div>\n           <div class=\"row mb-1\">\n               <div class=\"col\">\n                   <results v-bind:options=\"settings\" v-bind:results=\"filteredAndSortedResults\"><\/results>\n               <\/div>\n           <\/div>\n        <\/template>\n        <div v-else class=\"row\"><div class=\"col\"><div class=\"card\"><div class=\"card-body\">Use the form above to search this dataset.<\/div><\/div><\/div><\/div>\n    <\/form>\n";
var currentSearchResults = null;

var HomePage = Vue.component("home-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        data.settings = this.$root.defaultDatasetSettings;
        data.visible_filters = [];
        return data;
    },
    // runs every time the route changes
    beforeRouteEnter: function( to, from, next ) {
        next((vm)=>{ vm.onRouteUpdate(to); });
    },
    mounted: function() { 
        // triggered when the template dom is rendered the first time
        this.setVisibleFilters();
    },
    watch: {
        '$route': function(to, from) {
            // triggered when the fragment changes
            this.onRouteUpdate( to );
        },
        'settings.show_all_filters': function( to, from ) {
            this.setVisibleFilters();
        }
    },
    updated: function() {
        // enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    },
    methods: {
        onRouteUpdate: function(to) {
            // this is called when a route is updated including on page load.
            // when the route is updated, update the filters
            if( to.name=="browse" && to.params.field != null && to.params.value != null ) {
                this.settings.show_all_filters = false;
                this.resetFilters();
                this.browse= { field: to.params.field, value: to.params.value };
                this.settings.filters_by_id[ this.browse.field ].mode = "is";
                this.settings.filters_by_id[ this.browse.field ].term = this.browse.value;
            } else {
                this.browse = null;
            }
            this.setVisibleFilters();
        },
        setVisibleFilters: function() {
            this.visible_filters = [];
            for (var i = 0; i < this.settings.filters.length; i++) {
                var filter = this.settings.filters[i];
                if (( this.settings.show_all_filters 
                   || filter.field.quick_search 
                   || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    this.visible_filters.push( filter );
                }
            } 
        },
        activeFilters: function() {  
            // build a list of filters to be applied
            var active_filters = [];
            for (var i = 0; i < this.settings.filters.length; i++) {
                // does the filter pass?
                var filter = this.settings.filters[i];
                if (filter.isSet() && ( this.settings.show_all_filters 
                                     || filter.field.quick_search 
                                     || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    active_filters.push(filter);
                }
            }
            return active_filters;
        },
        filterResults: function() {
            var active_filters = this.activeFilters();

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
                var aValue = a[component.settings.sort_field].value;
                var bValue = b[component.settings.sort_field].value;

		// if the value is a list of values, we sort by the first
                if(typeof aValue === 'array') { aValue = aValue[0]; }
                if(typeof bValue === 'array') { bValue = bValue[0]; }

		// null and empty values always sort last no matter the sort_dir
                if( aValue == null || aValue.trim() == "" ) { return 1; }
                if( bValue == null || bValue.trim() == "" ) { return -1; }

                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
                if( aValue==bValue ) { return 0; }
                if( component.settings.sort_dir == 'asc'  && aValue>bValue ) { return 1; }
                if( component.settings.sort_dir == 'desc' && aValue<bValue ) { return 1; }
                return -1;
            });
            return results;
        },
        resetFilters: function() {
            for (var i = 0; i < this.settings.filters.length; i++) {
                this.settings.filters[i].reset();
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
        },
        // show the results if either result_mode is "filter" (default is filter)
        // or else "search" mode only show results IF one or more filters is specified
        showResults: function() {  
            if( this.dataset.config["result_mode"] != "search" ) {
                // filter mode starts showing everything
                return true;
            }
            // search mode only shows results once they start typing
            var active_filters = this.activeFilters();
            return( active_filters.length > 0 );
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
template = "<div id='app'>\n    <template v-if=\"app_status == 'test'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-warning my-2\">\n          <div class=\"card-body text-center\">\n             This is a testing instance of this service.\n             <br \/>\n             {{ git_info.branch }}_{{ git_info.commit_date | formatDate }}_{{ git_info.commit_id }}\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"app_status == 'dev'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-warning my-2\">\n          <div class=\"card-body text-center\">\n             This is a development instance of this service.\n             <br \/>\n             {{ git_info.branch }}_{{ git_info.commit_date | formatDate }}_{{ git_info.commit_id }}\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"app_status == 'pprd'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-warning my-2\">\n          <div class=\"card-body text-center\">\n             This is the pre-production instance of this service.\n             <br \/>\n             {{ git_info.branch }}_{{ git_info.commit_date | formatDate }}_{{ git_info.commit_id }}\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    \n    <template v-if=\"source_data.status == 'ERROR'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-error my-2\">\n          <div class=\"card-body text-center\">\n            <h2>Unable to load data<\/h2>\n            <p>An error has occurred. The error was: {{ source_data.error_message }}.<\/p>\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"source_data.status == 'LOADING'\">\n        <div class=\"row content\">\n        <div class=\"col\">\n        <div class=\"card bg-primary text-white my-2\">\n          <div class=\"card-body text-center\">\n            <div class=\"spinner-border\" role=\"status\">\n              <span class=\"sr-only\">Loading...<\/span>\n            <\/div>\n            <p>Please wait while the data loads.<\/p>\n          <\/div>\n        <\/div>\n        <\/div>\n        <\/div>\n    <\/template>\n    <template v-if=\"source_data.status == 'OK'\">\n        <dataset v-bind:dataset=\"defaultDataset\"><\/dataset>\n    <\/template>\n<\/div>\n";
var capeRouter = new VueRouter({
    routes: [
        {name: 'root', path: '/', component: HomePage},
        {name: 'data', path: '/data', component: DataPage},
        {name: 'record', path: '/record/:id', component: RecordPage},
        {name: 'browse', path: '/browse/:field/:value', component: HomePage},
    ]
});
capeRouter.afterEach((to, from, next) => {
    if( from.name !== null ) {
        // coming from an existing route, rather than a first time page load
        var content_vertical_offset = $("#app").offset().top;
        $('html,body').scrollTop(content_vertical_offset);
    }
});

// zz just so this loads after all the other templates
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

            if (response.body.status == "ERROR") {
                return;
            }

            this.datasets_by_id = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for (ds_i = 0; ds_i < response.body.datasets.length; ++ds_i) {
                var dataset = {};

                var source = response.body.datasets[ds_i];

                // add config to dataset
                dataset.config = source.config;
                // this is used for outputting as a JSON dataset
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
                var settings = {};
                settings.filters_by_id = {};
                settings.filters = [];
                settings.show_all_filters = false;
        
                var free_text_filter = makeFilter( { label:"Search", quick_search:true, type:"freetext", id:"freetext", description:"Search for terms anywhere in the record" } );
                settings.filters.push(free_text_filter);
		var field_ids = Object.keys( dataset.fields_by_id );
                for (var i=0; i<field_ids.length; ++i ) {
                    var field = dataset.fields_by_id[field_ids[i]];
                    if( field.filter === undefined ) { 
                        field.filter = true; 
                    };
                    if( !field.filter ) { 
                        continue; 
                    }
                    var filter = makeFilter( field );
                    if( !filter ) { 
                        continue; 
                    }
                    settings.filters_by_id[field.id] = filter;
                    settings.filters.push(filter);
                }
        
                // expand sort field names into actual field objects for MVC
                settings.sort_dir = "asc"; // or desc
                settings.sort_fields = [];
                for( var i=0; i<dataset.config.sort.length; ++i ) {
                     var field = dataset.fields_by_id[ dataset.config.sort[i] ];
                     settings.sort_fields.push( field );
                }
                settings.sort_field = settings.sort_fields[0].id;


                // add dataset to our dataset collection
                this.datasets_by_id[dataset.config.id] = dataset;

                // first dataset becomes the default
                if (ds_i == 0) {
                    this.defaultDataset = dataset;
                    this.defaultDatasetSettings = settings;
                }
            }

            // do this once everything is ready to prevent race conditions
            this.source_data = response.body;

        }, function(response) {
            // error callback
            this.source_data.status = "ERROR"
            this.source_data.error_message = "Error loading data over network";
        })
    },

    methods: {
    },

    router: capeRouter

}); // end of app


