
const ValidationError = require( "./ValidationError" );
const FieldMapper = require( "./Field" );

class Dataset {
    config = {}
    fieldMappers = []
    format = "csv"
    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {ValidationError}
     */
    constructor( config ) { 

        this.config = config;

        let ids = {};
        this.config['fields'].forEach( (fieldConfig,i) => {
            let fieldMapper = new FieldMapper( fieldConfig );
            this.fieldMappers.push( fieldMapper );
            // check the ids are unique
            if( ids.hasOwnProperty(fieldMapper.config.id)) {
                throw ValidationError("Field ID '${fieldMapper.config.id}' was not unique");
            }
            ids[fieldMapper.config.id]=fieldMapper;
        } );

        // check the sort fields exist
        this.config['sort'].forEach((field_id,i)=> {
            if( !ids.hasOwnProperty(field_id)) {
                throw new ValidationError("Invalid sort field ${field_id}")
            }
        })

        if( !ids.hasOwnProperty(this.config["id_field"])) {
            throw new ValidationError("Invalid id_field ${this.config['id_field']}")
        }

        // format does not need to be passed through to the output json, so remove it and
        // store it as an object property instead
        if( this.config.hasOwnProperty( 'format')) {
            this.format =  this.config['format'];
            delete this.config['format'];
        }

    }

}

module.exports = Dataset;