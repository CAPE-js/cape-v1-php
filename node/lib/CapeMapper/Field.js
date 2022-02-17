
const ValidationError = require( "./ValidationError" );


class Field {
    config = {}
    source_headings = []
    source_split
    source_chars
    /**
     * Maps data from a tabular source to a single field in a record in a CAPE system.
     * @param {Object} config - the JSON structure defining a single field
     * @throws {ValidationError}
     */
    constructor(config) {
        this.config = config;
        // additional validation on top of what the schema can do
        if( this.config['type'] !== 'ignore' && !this.config.hasOwnProperty('label') ) {
            throw new ValidationError("Fields must have label, unless they are type 'ignore'")
        }

        // set the default for cleaner code later on
        if( !this.config.hasOwnProperty('multiple') ) {
            this.config.multiple = false;
        }

        // remove mapper-specific properties from config and put them into object properties
        if( this.config.hasOwnProperty('source_heading')){
            if( Array.isArray(this.config['source_heading'])){
                this.source_headings = this.config["source_heading"];
            } else {
                this.source_headings = [ this.config["source_heading"] ];
            }

            // AUTO can't be part of a list of source headings
            if( this.source_headings>1 ) {
                this.source_headings.forEach((v)=>{
                    if(v==="AUTO") {
                        throw new ValidationError( "AUTO can't appear in a list of source_headings");
                    }
                })
            }

            delete this.config["source_heading"];
        }
        if( this.config.hasOwnProperty('source_split')){
            this.source_split = this.config['source_split']
            delete this.config['source_split']
        }
        if( this.config.hasOwnProperty('source_chars')){
            this.source_split = this.config['source_chars']
            delete this.config['source_chars']
        }

    }

}

module.exports = Field;
