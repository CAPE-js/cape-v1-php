

module.exports = class CapeMapper {

    constructor( config ) { 
        this.config = config;
        
        // validation happens in stages as we validate before we can move to the next part of the  constructor

        // validate that there's a list of fields
        // create field mappers (including validation)
        // validate things which require all fields mappers to be created
    }

    debug() {
        console.log( "CONFIG\n" );
        console.log( this.config );
    }

    generateSiteData() {
    }
}


/*
 tsv->tabular data structure
excel->tabular data structure
tabular data structure->list of objects/records based on first row of table
list of records+cape config->cape site json
single record + cape config -> cape site record
validate whole cape config
validate single field config
single field in a record + cape config for field -> single value for record in cape site json
*/
