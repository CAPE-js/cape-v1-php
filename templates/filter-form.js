
Vue.component("filter-form", {
    data: function () {
        return {filter: this.$root.defaultDataset.filter};
    },
    props: ["filters"],
    template: template
});

