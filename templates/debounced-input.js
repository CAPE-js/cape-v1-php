
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
