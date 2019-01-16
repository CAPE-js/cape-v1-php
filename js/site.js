var HomePage = Vue.component("home-page", {
    data: function () {
        return this.$root.defaultDataset;
    },
    methods: {
        getResults: function () {
            var results = this.filterResults();
            return results;
        },
        filterResults: function() {
            var records_to_show = [];

            // iterate over each record
            for (var i = 0; i < this.records.length; i++) {
                var record = this.records[i];

                // iterate over each filter
                var all_match = true;
                for (var j = 0; j < this.filters.length; j++) {
                    // does the filter pass?
                    var filter = this.filters[j];
                    if (!filter.matches(record)) {
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
        }
    },
    template: "#templateHome",
});

var DataPage = Vue.component("data-page", {
    data: function () {
        return this.$root.defaultDataset;
    },
    template: "#templateData",
    methods: {
        getConfigFields: function () {
            return this.config.fields;
        }
    }
});

var RecordPage = Vue.component("record-page", {
    data: function () {
        return this.$root.defaultDataset;
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

Vue.component("index-card", {
    props: ["record"],
    template: "#templateIndexCard"
});

Vue.component("summary-card", {
    props: ["record"],
    template: "#templateSummaryCard"
});

Vue.component("field-value", {
    props: ["typedValue"],
    render: function (createElement) {
        var rendered_value;

        if (!this.typedValue.value) {
            rendered_value = "/NULL/"; // TODO
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
        return createElement("div", {class: "field-value"}, rendered_value);
    }
});

Vue.component("field-label-and-value", {
    props: ["typedValue"],
    template: "#templateFieldLabelAndValue"
});


var app = new Vue({
    el: '#app',
    data: {
        sourceData: {
            status: "LOADING"
        },
        records_by_id: []
    },
    template: "#templateApp",
    created: function () {
        // GET /someUrl
        this.$http.get('/example-data.json').then(response => {
            // get body data
            if (!isObject(response.body)) {
                this.sourceData.status = "ERROR";
                this.sourceData.error_message = "Downloaded data is not a JSON object";
                return;
            }

            this.sourceData = response.body;
            if (this.sourceData.status == "ERROR") {
                return;
            }
            this.datasets_by_id = {};
            // populate records by ID. Nb. This is using the wrong ID data for now. TODO
            for (ds_i = 0; ds_i < this.sourceData.datasets.length; ++ds_i) {
                var dataset = {};

                var source = this.sourceData.datasets[ds_i];

                // add config to dataset
                dataset.config = source.config;

                // add fields mapped by ID, and populate the filter object
                // initialise enum registries
                var enums = {};
                dataset.fields_by_id = {};
                dataset.filters_by_id = {};
                dataset.filters = [];
                for (field_i = 0; field_i < source.config.fields.length; ++field_i) {
                    var field = source.config.fields[field_i];
                    dataset.fields_by_id[field.id] = field;
                    var filter_item;

                    switch (field.type) {
                        case "text":
                            filter_item = {
                                value: "", mode: "is", field: field, matches: function (record) {
                                    if (this.value.trim() == "") {
                                        return true;
                                    }

                                    var values = record[this.field.id].value;
                                    if (values === null) {
                                        return false;
                                    }

                                    // to simplify things always work with arrays.
                                    if (!this.field.multiple) {
                                        values = [values];
                                    }

                                    if (this.mode == "is") {
                                        var term = this.value.trim().toLowerCase()
                                        for (var i = 0; i < values.length; i++) {
                                            var value = values[i];
                                            if (value.toLowerCase() == term) {
                                                return true;
                                            }
                                        }
                                        return false;
                                    }

                                    // not 'is' so must be a 'contains' search
                                    // check that all the terms are found in the record
                                    var terms = this.value.trim().toLowerCase().split(/\s+/);

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
                            };
                            break;
                        case "integer":
                            filter_item = {
                                value: "",
                                value2: "",
                                mode: "between",
                                field: field,
                                matches: function (record) {
                                    return true
                                }
                            };
                            break;
                        case "enum":
                            filter_item = {
                                value: "", mode: "is", field: field, matches: function (record) {
                                    return true
                                }
                            };
                            break;
                        case "date":
                            filter_item = {
                                value: "",
                                value2: "",
                                mode: "between",
                                field: field,
                                matches: function (record) {
                                    return true
                                }
                            };
                            break;
                        default:
                            break;
                    }

                    if (field.type == "enum") {
                        // init enum registry for an enum field
                        enums[field.id] = {};
                    }


                    dataset.filters_by_id[field.id] = filter_item;
                    dataset.filters.push(filter_item);
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
                        if (field.type == "enum") {
                            // init enum registry for an enum field
                            enums[field.id][value] = 1;
                        }
                        record[field.id] = {value: value, field: field}
                    }
                    dataset.records_by_id[source_record[dataset.config.id_field]] = record;
                    dataset.records.push(record);

                }

                // add this list of enum values to each enum field
                var enum_fields = Object.keys(enums);
                for (var enum_i = 0; enum_i < enum_fields.length; enum_i++) {
                    dataset.fields_by_id[enum_fields[enum_i]].options = Object.keys(enums[enum_fields[enum_i]]).sort();
                }

                // add dataset to our dataset collection
                this.datasets_by_id[dataset.config.id] = dataset;

                // first dataset becomes the default
                if (ds_i == 0) {
                    this.defaultDataset = dataset;
                }
            }
        }, response => {
            // error callback
            this.sourceData.status = "ERROR"
            this.sourceData.error_message = "Error loading data over network";
        })
    },

    methods: {},

    router: new VueRouter({
        routes: [
            {path: '/', component: HomePage},
            {path: '/data', component: DataPage},
            {path: '/record/:id', component: RecordPage},
        ]
    })

}); // end of app

function isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
}
