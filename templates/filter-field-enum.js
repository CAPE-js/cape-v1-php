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
        columns: function () {
		return( this.filter.change_filter_mode ? 8 : 10 );
        }
    },
    template: template,
});

