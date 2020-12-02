Vue.component("fields-table", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});
