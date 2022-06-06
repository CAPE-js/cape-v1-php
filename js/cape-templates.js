
/************************************************************
 * debounced-input
 ************************************************************/

template = `
<input v-bind:placeholder="input_placeholder" v-bind:type="input_type" v-bind:value="input_value" v-bind:id="input_id" v-on:input="debounce_input">
`;


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


/************************************************************
 * field-label-and-value
 ************************************************************/

template = `
<div>
    <div class="field-label-and-value">
      <div v-if="!typedValue" class='cape-error'>[Error, trying to render non-existant field]</div>
      <template v-else-if="typedValue.field.value != ''">
        <div class="field-label" v-if="typedValue.field.description != null" data-toggle="tooltip" v-bind:title="typedValue.field.description">{{typedValue.field.label}}</div>
        <div class="field-label" v-else>{{typedValue.field.label}}</div>
        <field-value v-bind:typedValue="typedValue" v-bind:linkValue="linkValue"></field-value>
      </template>
    </div>
</div>
`;


Vue.component("field-label-and-value", {
    props: ["typedValue","linkValue"],
    template: template
});



/************************************************************
 * field-label-and-value-if-set
 ************************************************************/

template = `
<div>
  <div v-if="!typedValue" class='cape-error'>[Error, trying to render non-existant field]</div>
  <field-label-and-value v-else-if="typedValue.value != '' && typedValue.value != null && !(typeof typedValue.value=='array' && typedValue.value.length==0)" v-bind:typedValue="typedValue" v-bind:linkValue="linkValue"></field-label-and-value>
</div>
`;

Vue.component("field-label-and-value-if-set", {
    props: ["typedValue","linkValue"],
    template: template
});


/************************************************************
 * fields-table
 ************************************************************/

template = `
            <table class="table">
                <thead>
                <tr>
                    <th scope="col">Field id</th>
                    <th scope="col">Field name</th>
                    <th scope="col">Field type</th>
                    <th scope="col">Description</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="field in dataset.config.fields">
                    <td>{{ field.id }}</td>
                    <td>{{ field.label }}</td>
                    <td>{{ field.type }} <span v-if="field.multiple"> list</span></td>
                    <td>{{ field.description }}</td>
                </tr>
                </tbody>
            </table>
`;

Vue.component("fields-table", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});


/************************************************************
 * filter-field-date
 ************************************************************/

template = `
            <div class="form-row mb-1">
                <filter-field-label v-bind:filter="filter"></filter-field-label>
                <div v-if="filter.change_filter_mode" class="col-sm-2">
                    <select v-model.trim="filter.mode" class="form-control form-control-sm" v-bind:id="'filter-'+filter.field.id">
                        <option value="is">is</option>
                        <option value="between">is between</option>
                        <option value="set">is present</option>
                        <option value="not-set">is not present</option>
                    </select>
                </div>
                <div v-bind:class="'col-sm-'+num_of_cols_for_main_search_area">
                    <template v-if="filter.mode=='is'">
                        <debounced-input v-bind:type="'text'" v-model.trim="filter.term" v-bind:placeholder="filter.placeholder.is" class="form-control form-control-sm" v-bind:id="'filter-'+filter.field.id"></debounced-input>
                    </template>
                    <template v-if="filter.mode=='between'">
                        <debounced-input v-bind:type="'text'" v-model.trim="filter.term" v-bind:placeholder="filter.placeholder.between[0]" class="form-control form-control-sm between-number-filter" v-bind:id="'filter-to-'+filter.field.id"></debounced-input>
                        and
                        <debounced-input v-bind:type="'text'" v-model.trim="filter.term2" v-bind:placeholder="filter.placeholder.between[1]" class="form-control form-control-sm between-number-filter" v-bind:id="'filter-from-'+filter.field.id"></debounced-input>
                    </template>
                </div>
            </div>
`;

Vue.component("filter-field-date", {
    props: ["filter"],
    computed: {
        num_of_cols_for_main_search_area: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template
});



/************************************************************
 * filter-field-enum
 ************************************************************/

template = `
            <div class="form-row mb-1">

                <filter-field-label v-bind:filter="filter"></filter-field-label>
                <div v-if="filter.change_filter_mode" class="col-sm-2">
                    <select v-model.trim="filter.mode" class="form-control form-control-sm">
                        <option value="is">is</option>
                        <option value="one-of">one of</option>
                        <option value="set">is present</option>
                        <option value="not-set">is not present</option>
                    </select>
                </div>

                <div v-bind:class="'col-sm-'+num_of_cols_for_main_search_area">
                    <template v-if="filter.mode=='is'">
                        <div v-if="filterStyle['is'] == 'radio'">
                            <div v-for="option in filter.field.options" class="form-check form-check-inline">
                                <input v-model="filter.term" class="form-check-input" type="radio" v-bind:id="'filter-'+filter.field.id+'-'+option" v-bind:value="option">
                                <label class="form-check-label" v-bind:for="'filter-'+filter.field.id+'-'+option">{{option}}</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input v-model="filter.term" class="form-check-input" type="radio" v-bind:id="'filter-'+filter.field.id+'-'" value="">
                                <label class="form-check-label" v-bind:for="'filter-'+filter.field.id+'-'"><em>any</em></label>
                            </div>
                        </div>
                        <div v-if="filterStyle['is'] == 'select'">
                            <select v-model="filter.term" class="form-control form-control-sm" v-bind:id="'filter-'+filter.field.id">
                                <option selected="selected" value="">Select</option>
                                <option v-for="option in filter.field.options" v-bind:value="option">{{ option }}</option>
                            </select>
                        </div>
                    </template>
    
                    <template v-if="filter.mode=='one-of'">
                        <div v-if="filterStyle['one-of'] == 'checkbox'">
                            <div v-for="option in filter.field.options" class="form-check form-check-inline">
                                <input v-model="filter.terms" class="form-check-input" type="checkbox" v-bind:id="'filter-'+filter.field.id+'-'+option" v-bind:value="{'name':option}">
                                <label class="form-check-label" v-bind:for="'filter-'+filter.field.id+'-'+option">{{option}}</label>
                            </div>
                        </div>
                        <div v-if="filterStyle['one-of'] == 'multiselect'">
                            <multiselect v-model="filter.terms" :options="filter.field.multiselectOptions" :multiple="true" :close-on-select="true" :clear-on-select="false" :preserve-search="true" placeholder="Select (1 or more)" label="name" track-by="name" >
                                <template slot="tag" slot-scope="{ option, remove }"><span class="custom__tag"><span>{{ option.name }}</span><span class="custom__remove" @click="remove(option)">❌</span></span></template>
                            </multiselect>
                        </div>
                    </template>
                </div>
            </div>
`;

Vue.component("filter-field-enum", {
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
        },
        num_of_cols_for_main_search_area: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template,
});



/************************************************************
 * filter-field-freetext
 ************************************************************/

template = `
            <div class="form-row mb-1">
                <filter-field-label v-bind:filter="filter"></filter-field-label>
                <div class="col-sm-10">
                    <debounced-input v-bind:type="'text'" v-model.trim="filter.term" class="form-control form-control-sm" v-bind:id="'filter-'+filter.field.id"></debounced-input>
                </div>
            </div>
`;

Vue.component("filter-field-freetext", {
    props: ["filter"],
    template: template
});



/************************************************************
 * filter-field-integer
 ************************************************************/

template = `
            <div class="form-row mb-1">
                <filter-field-label v-bind:filter="filter"></filter-field-label>
                <div v-if="filter.change_filter_mode" class="col-sm-2">
                    <select v-model.trim="filter.mode" class="form-control form-control-sm">
                        <option value="is">is</option>
                        <option value="between">is between</option>
                        <option value="set">is present</option>
                        <option value="not-set">is not present</option>
                    </select>
                </div>
                <div v-bind:class="'col-sm-'+num_of_cols_for_main_search_area">
                    <template v-if="filter.mode=='is'">
                        <debounced-input v-bind:type="'number'" v-bind:id="'filter-'+filter.field.id" v-model.trim="filter.term" v-bind:placeholder="filter.placeholder.is" class="form-control form-control-sm" v-bind:min="filter.field.min" v-bind:max="filter.field.max" v-bind:step="filter.field.step"></debounced-input>
                    </template>
                    <template v-if="filter.mode=='between'">
                        <debounced-input v-bind:type="'number'" v-bind:id="'filter-'+filter.field.id" v-model.number="filter.term" v-bind:placeholder="filter.placeholder.between[0]" class="form-control form-control-sm between-number-filter" v-bind:min="filter.field.min" v-bind:max="filter.field.max" v-bind:step="filter.field.step"></debounced-input>
                        and
                        <debounced-input v-bind:type="'number'" v-bind:id="'filter-'+filter.field.id" v-model.number="filter.term2" v-bind:placeholder="filter.placeholder.between[1]"  class="form-control form-control-sm between-number-filter" v-bind:min="filter.field.min" v-bind:max="filter.field.max" v-bind:step="filter.field.step"></debounced-input> 
                    </template>
                </div>
            </div>
`;

Vue.component("filter-field-integer", {
    props: ["filter"],
    computed: {
        num_of_cols_for_main_search_area: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template
});




/************************************************************
 * filter-field-label
 ************************************************************/

template = `
            <div class="col-sm-2 text-sm-right">
                <label v-if="filter.field.description != null" data-toggle="tooltip" v-bind:title="filter.field.description" v-bind:for="'filter-'+filter.field.id">{{filter.field.label}}</label>
                <label v-else v-bind:for="'filter-'+filter.field.id">{{filter.field.label}}</label>
            </div>
`;

Vue.component("filter-field-label", {
    props: ["filter"],
    template: template
});


/************************************************************
 * filter-field-text
 ************************************************************/

template = `
            <div class="form-row mb-1">
                <filter-field-label v-bind:filter="filter"></filter-field-label>
                <div v-if="filter.change_filter_mode" class="col-sm-2">
                    <select v-model.trim="filter.mode" class="form-control form-control-sm">
                        <option value="is">is</option>
                        <option value="contains">contains</option>
                        <option value="set">is present</option>
                        <option value="not-set">is not present</option>
                    </select>
                </div>
                <div v-bind:class="'col-sm-'+num_of_cols_for_main_search_area">
                    <template v-if="filter.mode=='is' || filter.mode=='contains'">
                        <debounced-input v-bind:type="'text'" v-bind:id="'filter-'+filter.field.id" v-model.trim="filter.term" v-bind:placeholder="filter.placeholder[filter.mode]" class="form-control form-control-sm"></debounced-input>
                    </template>
                </div>
            </div>
`;

Vue.component("filter-field-text", {
    props: ["filter"],
    computed: {
        num_of_cols_for_main_search_area: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template
});


/************************************************************
 * filter-form
 ************************************************************/

template = `
    <div class='filter-form'>
        <div v-for="filter in filters" :key="filter.field.id">
            <filter-field-text          v-if="filter.field.type=='text'"     v-bind:filter="filter"></filter-field-text>
            <filter-field-integer  v-else-if="filter.field.type=='integer'"  v-bind:filter="filter"></filter-field-integer>
            <filter-field-date     v-else-if="filter.field.type=='date'"     v-bind:filter="filter"></filter-field-date>
            <filter-field-enum     v-else-if="filter.field.type=='enum'"     v-bind:filter="filter"></filter-field-enum>
            <filter-field-freetext v-else-if="filter.field.type=='freetext'" v-bind:filter="filter"></filter-field-freetext>
            <template v-else>
                <div class="col-sm-10">
                   Unknown filter type.
                </div>
            </template>
        </div>
    
</div>
`;


Vue.component("filter-form", {
    data: function () {
        return {filter: this.$root.defaultDataset.filter};
    },
    props: ["filters"],
    template: template
});



/************************************************************
 * home-page
 ************************************************************/

template = `
    <form v-on:keypress.enter.prevent="ignoreEnter">
        <intro /> 
        <div class="row">
            <div class="col text-right">
                <div>
                    <button v-on:click="resetFilters" class="btn btn-sm btn-secondary ">New search</button>
                </div>
                <div class="switch switch-sm mb-3 mt-3">
                    <input v-model="settings.show_all_filters" type="checkbox" class="switch" id="show-all-filters-lower" />
                    <label for="show-all-filters-lower">Advanced search</label>
                </div>
            </div>
        </div>
        <div class="row mb-1">
            <div class="col">
                <filter-form v-bind:filters="visible_filters"></filter-form>
            </div>
        </div>

        <template v-if="showResults">
           <div class="row mb-1 form-row">
              <div class="col-sm-2 text-sm-right">
                  Order results by 
              </div>
              <div class="col-sm-4">
                  <select v-model="settings.sort_field" style="width:auto; display: inline-block" class="form-control form-control-sm"><option v-for="field in settings.sort_fields" v-bind:value="field.id">{{field.label}}</option></select>
                  <select v-model="settings.sort_dir" style="width:auto; display: inline-block" class="form-control form-control-sm"><option value="asc">Ascending</option><option value="desc">Decending</option></select>
              </div>
              <div class="col-sm-6 text-sm-right" v-if="settings.show_all_filters">
                  <div>
                      <button v-on:click="resetFilters" class="btn btn-sm btn-secondary ">New search</button>
                  </div>
                  <div class="switch switch-sm mb-3 mt-3">
                      <input v-model="settings.show_all_filters" type="checkbox" class="switch" id="show-all-filters-lower" />
                      <label for="show-all-filters-lower">Advanced search</label>
                  </div>
              </div>
           </div>
           <div class="row mb-1">
               <div class="col">
                   <results v-bind:options="settings" v-bind:results="filteredAndSortedResults"></results>
               </div>
           </div>
        </template>
        <div v-else class="row"><div class="col"><div class="card"><div class="card-body">Use the form above to search this dataset.</div></div></div></div>
    </form>
`;


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
            this.visible_filters = this.visibleFilters();
        },
        visibleFilters: function() {
            let visible_filters = [];
            for (var i = 0; i < this.settings.filters.length; i++) {
                var filter = this.settings.filters[i];
                if( filter.field.hasOwnProperty( 'search' ) && filter.field['search']===false ) {
                    continue;
                }
                if (( this.settings.show_all_filters 
                   || filter.field.quick_search 
                   || ( this.browse!=null && filter.field.id==this.browse.field) )) {
                    visible_filters.push( filter );
                }
            } 
            return visible_filters;
        },
        activeFilters: function() {  
            // build a list of filters to be applied. Which is all the visible filters that have a non-default value
            // or a non-blank value
            var active_filters = [];
            this.visibleFilters().forEach( filter => {
                if( filter.isActive() ) {
                    active_filters.push(filter);
                }
            } );
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



/************************************************************
 * record-page
 ************************************************************/

template = `
    <div>
        <div class="row">
            <div class="col">
                <index-card v-if="dataset.records_by_id[ $route.params.id ]"
                            v-bind:record="dataset.records_by_id[ $route.params.id ]"></index-card>
                <no-record v-else></no-record>
            </div>
        </div>
    </div>
`;

var RecordPage = Vue.component("record-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});



/************************************************************
 * results
 ************************************************************/

template = `

    <div>
        <div v-if="results.length == 0" class="card mb-1">
            <div class="card-body">No records match your filter terms.</div>
        </div>

        <div v-else>
            <results-summary v-bind:results="results" v-bind:options="options" v-bind:visible_records_count="visible_records.length"></results-summary>
            <div v-for="record in visible_records">
                <summary-card v-bind:record="record"></summary-card>
            </div>
            <div class="floating-summary">
                <results-summary v-bind:results="results" v-bind:options="options" v-bind:visible_records_count="visible_records.length"></results-summary>
            </div>
        </div>

    </div>

`;


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



/************************************************************
 * results-summary
 ************************************************************/

template = `

    <div class="result-summary">
        <div class="card mb-1">
            <div class="card-body">
                <div>
                    <div v-if="visible_records_count==results.length" class="record-count">Showing all {{ visible_records_count }} matching records.</div>
                    <div v-else class="record-count">Showing first {{ visible_records_count }} of {{ results.length }} matching records.</div>
                    <div class="switch switch-sm">
                        <input v-model="options.show_all_results" type="checkbox" class="switch" id="show-all-results" />
                        <label for="show-all-results">Show all matches</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;


Vue.component("results-summary", {
    template: template,
    props: ["results", "visible_records_count", "options"],
});

/************************************************************
 * dataset
 ************************************************************/

// don't define the real roots until the page is loaded
var capeRouter = new VueRouter({
    routes: [
        {name: 'root', path: '/', component: HomePage}, 
    ]
});
Vue.component("dataset", {
    template: "#templateDataset",
    router: capeRouter
});


/************************************************************
 * zz-app
 ************************************************************/

template = `
<div id='app'>
    <template v-if="app_status == 'test'">
        <div class="row content">
        <div class="col">
        <div class="card bg-warning my-2">
          <div class="card-body text-center">
             This is a testing instance of this service.             
          </div>
        </div>
        </div>
        </div>
    </template>
    <template v-if="app_status == 'dev'">
        <div class="row content">
        <div class="col">
        <div class="card bg-warning my-2">
          <div class="card-body text-center">
             This is a development instance of this service.             
          </div>
        </div>
        </div>
        </div>
    </template>
    <template v-if="app_status == 'pprd'">
        <div class="row content">
        <div class="col">
        <div class="card bg-warning my-2">
          <div class="card-body text-center">
             This is the pre-production instance of this service.             
          </div>
        </div>
        </div>
        </div>
    </template>
    
    <template v-if="source_data.status == 'ERROR'">
        <div class="row content">
        <div class="col">
        <div class="card bg-error my-2">
          <div class="card-body text-center">
            <h2>Unable to load data</h2>
            <p>An error has occurred. The error was: {{ source_data.error_message }}.</p>
          </div>
        </div>
        </div>
        </div>
    </template>
    <template v-if="source_data.status == 'LOADING'">
        <div class="row content">
        <div class="col">
        <div class="card bg-primary text-white my-2">
          <div class="card-body text-center">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p>Please wait while the data loads.</p>
          </div>
        </div>
        </div>
        </div>
    </template>
    <template v-if="source_data.status == 'OK'">
        <dataset v-bind:dataset="defaultDataset"></dataset>
    </template>
</div>
`;


// zz just so this loads after all the other templates
new Vue({
    el: '#app',
    data: {
        source_data: {
            status: "LOADING"
        },
        app_status: (typeof app_status === 'undefined'?"dev":app_status),
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

            // Now recreate the Dataset component but with all the system and user defined routes
            // This also generates components for the user pages and /data page 
            let pages = [ 'data' ];
            if( dataset.config.hasOwnProperty( 'extra_pages' ) ) {
                pages = pages.concat( dataset.config['extra_pages'] );
            }

            let routes = [
                {name: 'root',   path: '/',                     component: HomePage},
                {name: 'record', path: '/record/:id',           component: RecordPage},
                {name: 'browse', path: '/browse/:field/:value', component: HomePage},
            ];

            pages.forEach( pageId => {
                let templateId = 'template' + pageId.charAt(0).toUpperCase() + pageId.slice(1);
                let component = Vue.component( pageId + "-page", {
                    template: "#"+templateId,
                    data: function () {
                        var data = {};
                        data.dataset = this.$root.defaultDataset;
                        return data;
                    },
                    methods: {
                        downloadJSON: function() {
                            var filename = this.dataset.config.id+".json";
                            download( filename, JSON.stringify(this.dataset.raw_records), "application/json" );
                        },
                        downloadCSV: function() {
                            var table = records_to_table( this.dataset.config.fields, this.dataset.records );
                            var csv = table_to_csv( table );
                            var filename = this.dataset.config.id+".csv";
                            download( filename, csv, "text/csv;charset=utf-8" );
                        }
                    }
                });
                routes.push( { name: pageId, path: '/'+pageId, component: component } );
            });
                
            var capeRouter = new VueRouter({ routes: routes });
            capeRouter.afterEach((to, from, next) => {
                if( from.name !== null ) {
                    // coming from an existing route, rather than a first time page load
                    var content_vertical_offset = $("#app").offset().top;
                    $('html,body').scrollTop(content_vertical_offset);
                }
            });
            Vue.component("dataset", {
                template: "#templateDataset",
                props: ["dataset"],
                router: capeRouter
            });
            
            // do this once everything is ready to prevent race conditions
            this.source_data = response.body;
        }, function(response) {
            // error callback
            this.source_data.status = "ERROR"
            this.source_data.error_message = "Error loading data over network";
        })
    },

    methods: {
    }


}); // end of app


