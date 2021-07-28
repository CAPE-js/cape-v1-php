
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

