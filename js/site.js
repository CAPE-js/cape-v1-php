
var HomePage = Vue.component("home-page", {
    data: function() { return this.$root.defaultDataset; },
    template: "#templateHome",
});

var DataPage = Vue.component("data-page", {
    data: function() { return this.$root.defaultDataset; },
    template: "#templateData",
    methods: {
        getConfigFields: function() {
            return this.config.fields;
        }
}});

var RecordPage = Vue.component("record-page",{ 
    data: function() { return this.$root.defaultDataset; },
    template: "#templateRecord" 
});

Vue.component("dataset", {
    template: "#templateDataset",
    props: ["dataset"]
});

Vue.component("index-card",{
    props: ["record"],
    template: "#templateIndexCard" } );

Vue.component("field-value",{
    props: ["typedValue"],
    render: function(createElement) {
        var rendered_value;
        var classes = ["field-value"]; 
        if( !this.typedValue.value ) {
            rendered_value = "unspecified";
            classes.push( "field-null" );
        } else {
            if( this.typedValue.field.multiple===true ) {
                rendered_value = [];
                for( var i=0; i<this.typedValue.value.length; ++i ) {
                    single_value = this.typedValue.value[i];
                    if( rendered_value.length ) { rendered_value.push( ", " ); }
                    rendered_value.push( single_value );
                }
            } else {
                rendered_value = this.typedValue.value;
            }
        }
        return createElement("div",{class:classes},rendered_value);
    }});

Vue.component("field-label-and-value",{
    props: ["typedValue"],
    template: "#templateFieldLabelAndValue" } );


var app = new Vue({
    el: '#app',
    data: {
        sourceData: {
            status: "LOADING"
        },
        recordsById: []
    },
    template: "#templateApp",
    created: function () {
        // GET /someUrl
        this.$http.get('/example-data.json').then(response => {
            // get body data
            if( !isObject( response.body )) {
                this.sourceData.status = "ERROR";
                this.sourceData.error_message = "Downloaded data is not a JSON object";
                return;
            }

            this.sourceData = response.body;
            if( this.sourceData.status == "ERROR" ) {
                return;
            }
            this.datasetsById = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for( ds_i=0; ds_i<this.sourceData.datasets.length; ++ds_i ) {
                var dataset = {};

		var source = this.sourceData.datasets[ds_i];

                // add config to dataset
                dataset.config = source.config;

                // add fields mapped by ID
                dataset.fieldsById = {};
                for( field_i=0; field_i<source.config.fields.length; ++field_i ) {
                    var field = source.config.fields[field_i];
                    dataset.fieldsById[ field.id ] = field;
                }

                // create a lookup table for record by id
                dataset.recordsById = {};
                dataset.records = [];
                for( record_i=0; record_i<source.records.length; ++record_i ) {
                    var source_record = source.records[record_i];
                    var record = {};
                    for( field_i=0; field_i<source.config.fields.length; ++field_i ) {
                        var field = source.config.fields[field_i];
                        record[ field.id ] = {
                            value: source_record[ field.id ],
                            field: field }
                    }
                    dataset.recordsById[source_record[dataset.config.id_field]] = record;
                    dataset.records.push( record ); 
                }

		// add dataset to our dataset collection
                this.datasetsById[dataset.config.id] = dataset;

                // first dataset becomes the default
                if( ds_i == 0 ) {
                    this.defaultDataset = dataset;
                }
            }
        }, response => {
            // error callback
            this.sourceData.status = "ERROR"
            this.sourceData.error_message = "Error loading data over network";
        })
    },

    methods: {
        getResults() {
            if (this.sourceData.status == "OK") {
                return this.sourceData.datasets[0].records;
            }

            return [];
        }
    },

    router: new VueRouter({ routes: [
            { path: '/', component: HomePage},
            { path: '/data', component: DataPage},
            { path: '/record/:id', component: RecordPage },
        ]})

}); // end of app

function isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
}
