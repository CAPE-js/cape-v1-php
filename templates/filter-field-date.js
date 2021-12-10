Vue.component("filter-field-date", {
    props: ["filter"],
    computed: {
        num_of_cols_for_main_search_area: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template
});

