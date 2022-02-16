
const CapeValidate = require( "./Validate" );
const CapeValidationError = require( "./ValidationError" );
const CapeFieldMapper = require( "./Field" );

class Dataset {
    config = {}
    fieldMappers = []
    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {CapeValidationError}
     */
    constructor( config ) { 

        config.data = config;

        config['fields'].forEach( (fieldConfig,i) => { this.fieldMappers.push( new CapeFieldMapper( fieldConfig )); } );

        // these checks can't be easily done in the schema
        // TODO check field ids are unique
        // TODO check sort fields exist
        // TODO check id field exists
    }
}

module.exports = Dataset;