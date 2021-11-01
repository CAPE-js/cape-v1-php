
const CapeValidationError = require( './CapeValidationError' );

module.exports = class CapeValidate {

    static validateString( label, value ) {
        var type = typeof value;
        if( type != 'string' ) { 
            throw new CapeValidationError( `${label} must be a string (got ${type})` );
        }
    }

    static validateArray( label, value ) {
        if( ! Array.isArray( value ) ) {
            throw new CapeValidationError( `${label} must be an array` );
        }
    }

    static validateObject( label, value ) {
        if( value === null ) {
            throw new CapeValidationError( `${label} must be an object (got null)` );
        }
        var type = typeof value;
        if( type !== 'object' ) {
            throw new CapeValidationError( `${label} must be an object (got ${type})` );
        }
    }

    static validateProperty( object_label, object, field_name ) {
        CapeValidate.validateObject( object_label, object );
        if( ! object.hasOwnProperty( field_name ) ) {
            throw new CapeValidationError( `${object_label} must have a property named ${field_name}` );
        }
    } 

    static validateStringProperty( label, object, field_name ) {
        CapeValidate.validateProperty( label, object, field_name );
        CapeValidate.validateString( label, object[field_name] );
    }

    static validateArrayProperty( object_label, object, field_name ) {
        CapeValidate.validateProperty( object_label, object, field_name );
        CapeValidate.validateArray( `${object_label}->${field_name}`, object[field_name] );
    }

    static validateNonEmptyArrayProperty( object_label, object, field_name ) {
        CapeValidate.validateArrayProperty( object_label, object, field_name );
        if( object[field_name].length == 0 ) {
            throw new CapeValidationError( `${object_label}->${field_name} must not be empty` );
        }
    }       
}

