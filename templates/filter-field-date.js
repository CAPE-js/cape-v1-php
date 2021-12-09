Vue.component("filter-field-date", {
    props: ["filter"],
    computed: {
        columns: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template
});

