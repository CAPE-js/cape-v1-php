$(document).ready(function() {
    var libs = {
        prod: [ 
            "js/popper.min.js", 
            "js/vue.min.js", 
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/site.js" ],
        pprd: [ 
            "js/popper.min.js", 
            "js/vue.min.js", 
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/site.js" ],
        dev:  [ 
            "js/popper.min.js", 
            "js/vue.js",     
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/site.js" ]
    };
    var load_list = libs["dev"];
    if( app_status == "prod" || app_status == "pprd") { 
        load_list = libs[app_status];
    }
    load_next_script();

    function load_next_script() {
        if( load_list.length == 0 ) {
            // all js loaded
            return;
        }
        var next_script = load_list.shift();
        $.getScript(next_script, function(data, textStatus, jqxhr) {
              load_next_script();
        }).fail(function(jqxhr, settings, exception) {
            console.error("Error in ", next_script, "\n", exception)
        });
    }
});

