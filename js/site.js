
Vue.component("index-card-or-error",{
    props: ["record"],
    template: "#templateIndexCardOrError" } );

Vue.component("index-card",{
    props: ["record"],
    template: "#templateIndexCard" } );

Vue.component("field-value",{
    props: ["record","fieldid"],
    render: function(createElement) {
        var rendered_value;
        if( !this.record ) {
            rendered_value = "[FV:No record]";
        } else {
            var field = this.record._dataset.fieldsById[this.fieldid];
            if( !field ) {
                rendered_value = "[FV:No field:"+this.fieldid+"]";
            } else {
                var value = this.record[this.fieldid];
                if( !value ) {
                    rendered_value = "/NULL/"; // TODO
                } else {
                    if( field.multiple===true ) {
                        rendered_value = [];
                        for( var i=0; i<value.length; ++i ) {
                            single_value = value[i];
                            if( rendered_value.length ) { rendered_value.push( ", " ); }
                            rendered_value.push( single_value );
                        }
                    } else {
                        rendered_value = value;
                    }
                }
            }
        }
 
        return  createElement("div",{class:"field-value"},rendered_value);
    }});

Vue.component("field-label-and-value",{
    props: ["record","fieldid"],
    render: function(createElement) {
        if( !this.record ) {
            return createElement("div",{"class":"field-value-and-label"},"[FLV:No record]");
        }
        var field = this.record._dataset.fieldsById[this.fieldid];
        if( !field ) {
            return createElement("div",{"class":"field-value-and-label"},"[FLV:No field:"+this.fieldid+"]");
        }
        return createElement("div",{"class":"field-value-and-label"},[
            createElement("div",{"class":"field-label"},field.label),
            createElement("field-value",{"props":{"record":this.record, "fieldid":this.fieldid}})
        ]);
    }
});


var Home = { template: "#templateHome", };
var Data = {
    template: "#templateData",
    methods: {getConfigFields() {

        if (this.$parent.sourceData.status == "OK") {
            return this.$parent.sourceData.datasets[0].config.fields;
        }

        return [];

    }
}};
var Record = { 
    template: "#templateRecord", 
    methods: {
    }
};



var app = new Vue({
    el: '#app',
    data: {
        sourceData: {
            status: "LOADING"
        },
        recordsById: []
    },
    created: function () {
        // GET /someUrl
        this.$http.get('/example-data.json').then(response => {
            // get body data
            this.sourceData = response.body;
            this.datasetsById = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for( ds_i=0; ds_i<this.sourceData.datasets.length; ++ds_i ) {
                var dataset = this.sourceData.datasets[ds_i];
                this.datasetsById[dataset.config.id] = dataset;

                // create a lookup table for record by id
                dataset.recordsById = {};
                for( record_i=0; record_i<dataset.records.length; ++record_i ) {
                    dataset.recordsById[record_i] = dataset.records[record_i];
                }

                // add a look table table for field config by id
                dataset.fieldsById = {};
                for( field_i=0; field_i<dataset.config.fields.length; ++field_i ) {
                    dataset.fieldsById[ dataset.config.fields[field_i].id ] = dataset.config.fields[field_i];
                }

                // add a link to the dataset to each record
                for( record_i=0; record_i<dataset.records.length; ++record_i ) {
                    dataset.records[record_i]._dataset = dataset;
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
        },
        getRecord( dataset_id, record_id ) {
            if( !this.datasetsById[dataset_id] ) { return null; }
            return this.datasetsById[dataset_id].recordsById[record_id];
        }
    },

    router: new VueRouter({ routes: [
            { path: '/', component: Home},
            { path: '/data', component: Data},
            { path: '/record/:dataset/:id', component: Record},
        ]})

}); // end of app
