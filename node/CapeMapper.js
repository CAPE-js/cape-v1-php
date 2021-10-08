
const CapeDatasetMapper = require( "./CapeDatasetMapper" );
const CapeValidationError = require( "./CapeValidationError" );

module.exports = class CapeMapper {

    constructor( config ) { 
        this.config = config;
        
        // validation happens in stages as we validate before we can move to the next part of the  constructor
        CapeMapper.validateObject( "Config", this.config );
        CapeMapper.validateNonEmptyArrayProperty( "Config", this.config, "datasets" );

        this.datasetMappers = [];
        for( var i=0; i<this.config.datasets.length; ++i ) {
            var datasetMapper = new CapeDatasetMapper( this.config.datasets[i] );
            this.datasetMappers.push( datasetMapper );
        }
    }

    // load relevant files from filesystem and map them using the config. nb. this will not work with azure 
    generateSiteData() {
        return 23;
    }

    /* data validation tools */

    static validateString( label, value ) {
        if( typeof value != "string" ) { 
            throw new CapeValidationError( label+" must be a string (got "+(typeof value)+")" );
        }
    }

    static validateArray( label, value ) {
        if( ! Array.isArray( value ) ) {
            throw new CapeValidationError( label+" must be an array" );
        }
    }

    static validateObject( label, value ) {
        if( value === null ) {
            throw new CapeValidationError( label+" must be an object (got null)" );
        }
        if( typeof value !== 'object' ) {
            throw new CapeValidationError( label+" must be an object (got "+(typeof value)+")" );
        }
    }

    static validateProperty( object_label, object, field_name ) {
        CapeMapper.validateObject( object_label, object );
        if( ! object.hasOwnProperty( field_name ) ) {
            throw new CapeValidationError( object_label+" must have a property named "+field_name );
        }
    } 

    static validateStringProperty( label, object, field_name ) {
        CapeMapper.validateProperty( label, object, field_name );
        CapeMapper.validateString( label, object[field_name] );
    }

    static validateArrayProperty( object_label, object, field_name ) {
        CapeMapper.validateProperty( object_label, object, field_name );
        CapeMapper.validateArray( object_label+"->"+field_name, object[field_name] );
    }

    static validateNonEmptyArrayProperty( object_label, object, field_name ) {
        CapeMapper.validateArrayProperty( object_label, object, field_name );
        if( object[field_name].length == 0 ) {
            throw new CapeValidationError( object_label+"->"+field_name+" must not be empty" );
        }
    }       
}

