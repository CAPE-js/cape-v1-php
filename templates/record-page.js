var RecordPage = Vue.component("record-page", {
    data: function () {
        var data = {};
        data.dataset = this.$root.defaultDataset;
        return data;
    },
    template: template
});

