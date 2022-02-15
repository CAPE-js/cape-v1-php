
const CapeValidate = require( "./Validate" );
const CapeValidationError = require( "./ValidationError" );
const CapeFieldMapper = require( "./Field" );

class Dataset {
    data = {}
    fieldMappers = []
    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {CapeValidationError}
     */
    constructor( config ) { 

        // check basic metadata
        CapeValidate.validateStringProperty( "dataset", config, "id" );
        this.data['id']=config['id'];
        CapeValidate.validateStringProperty( `dataset ${config.id}`, config, "title" );
        this.data['title']=config['title'];
        CapeValidate.validateStringProperty( `dataset ${config.id}`, config, "id_field" );
        this.data['id_field']=config['id_field'];
        // check dataset sort property
        CapeValidate.validateNonEmptyArrayProperty( `dataset ${config.id}`, config, "sort" );
        config.sort.forEach( (sortField,i) => {
            CapeValidate.validateString( `dataset ${config.id} sort ${i}`, sortField );
        });
        this.data['sort']=config['sort']
        // check dataset has fields
        CapeValidate.validateNonEmptyArrayProperty( `dataset ${config.id}`, config, "fields" );

        config['fields'].forEach( (fieldConfig,i) => { this.fieldMappers.push( new CapeFieldMapper( fieldConfig )); } );

        // check field ids are unique
        // check sort fields exist
        // check id field exists


        
    }


}

module.exports = Dataset;