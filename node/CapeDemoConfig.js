module.exports = class CapeDemoConfig {
    static dataset = 
    {
        'id':'myid',
        'title':'My Dataset',
        'sort':['title','id'],
        'id_field':'id',
        'fields':[23
        ]
    };
    static full = { 'datasets': [ this.dataset ] };

}
