
const CapeValidate = require( "./CapeValidate" );
const CapeValidationError = require( "./CapeValidationError" );

class CapeDatasetMapper {
    id;
    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {CapeValidationError}
     */
    constructor( config ) { 

        // check basic metadata
        CapeValidate.validateStringProperty( "dataset", config, "id" );
        CapeValidate.validateStringProperty( `dataset ${config.id}`, config, "title" );
        CapeValidate.validateStringProperty( `dataset ${config.id}`, config, "id_field" );
        // check dataset sort property
        CapeValidate.validateNonEmptyArrayProperty( `dataset ${config.id}`, config, "sort" );
        config.sort.forEach( (sortField,i) => {
            CapeValidate.validateString( `dataset ${config.id} sort ${i}`, sortField );
        });
        // check dataset has fields
        CapeValidate.validateNonEmptyArrayProperty( `dataset ${config.id}`, config, "fields" );

        // initialise field mappers

        // check sort fields exist
        // check id field exists
        
/*
       foreach( $config["fields"] as $field ) {
                $n++;
                if( !array_key_exists( "id", $field ) ) {
                        exit_with_error( "Field missing ID in field #$n" );
                }
                if( !array_key_exists( "type", $field ) ) {
                        exit_with_error( "Field ID '".$field["id"]."' is missing a type." );
                }
                if( array_key_exists( $field["id"], $id_hash ) ) {
                        exit_with_error( "Field ID '".$field["id"]."' appears more than once in config." );
                }
                $id_hash[$field["id"]] = 1;

                # defaults
                if( !array_key_exists( "multiple", $field ) ) {
                        $field["multiple"] = false;
                }

                # treat source_heading as a list always to simplify things
                if( array_key_exists( "source_heading", $field ) && !is_array( $field["source_heading"]) ) {
                        $field["source_heading"] = [ $field["source_heading"] ];
                }
                # check if a multi heading field has AUTO (it shouldn't)
                if( array_key_exists( "source_heading", $field ) && count( $field["source_heading"] )> 1) {
                        foreach( $field["source_heading"] as $heading ) {
                                if( $heading == "AUTO" ) {
                                        exit_with_error( "Field ID '".$field["id"]."' has AUTO in a list of source_heading." );
                                }
                        }
                }
                $fields []= $field;
        }
*/

        
    }


}

module.exports = CapeDatasetMapper;