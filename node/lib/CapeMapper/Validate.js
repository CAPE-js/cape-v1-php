
const CapeValidationError = require( './ValidationError' );


/**
 * Utility class to validate data. This probably is reinventing an existing wheel, but it's not a very big wheel.
 * @type {Validate}
 */
class Validate {

    /**
     * Validate a string is a string
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @throws {CapeValidationError}
     */
    static validateString( label, value ) {
        const type = typeof value;
        if( type !== 'string' ) {
            throw new CapeValidationError( `${label} must be a string (got ${type})` );
        }
    }

    /**
     * Validate a string is an array
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @throws {CapeValidationError}
     */
    static validateArray( label, value ) {
        if( ! Array.isArray( value ) ) {
            throw new CapeValidationError( `${label} must be an array` );
        }
    }

    /**
     * Validate a value is an object
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @throws {CapeValidationError}
     */
    static validateObject = ( label, value ) => {
        if( value === null ) {
            throw new CapeValidationError( `${label} must be an object (got null)` );
        }
        if( Array.isArray( value ) ) {
            throw new CapeValidationError( `${label} must be an object (got array)` );
        }
        const type = typeof value;
        if( type !== 'object' ) {
            throw new CapeValidationError( `${label} must be an object (got ${type})` );
        }
    };

    /**
     * Validate a value is an object with a named property
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @param {string} field_name - the name of the property
     * @throws {CapeValidationError}
     */
    static validateProperty(label, value, field_name ) {
        Validate.validateObject( label, value );
        if( ! value.hasOwnProperty( field_name ) ) {
            throw new CapeValidationError( `${label} must have a property named ${field_name}` );
        }
    }

    /**
     * Validate a value is an object with a named property which is a string
     * @param {string} label - the description of the thing being validated
     * @param object - the value to validate
     * @param {string} field_name - the name of the property
     * @throws {CapeValidationError}
     */
    static validateStringProperty( label, object, field_name ) {
        Validate.validateProperty( label, object, field_name );
        Validate.validateString( label, object[field_name] );
    }

    /**
     * Validate a value is an object with a named property which is an array
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @param {string} field_name - the name of the property
     * @throws {CapeValidationError}
     */
    static validateArrayProperty( label, value, field_name ) {
        Validate.validateProperty( label, value, field_name );
        Validate.validateArray( `${label}->${field_name}`, value[field_name] );
    }

    /**
     * Validate a value is an object with a named property which is a non-empty array
     * @param {string} label - the description of the thing being validated
     * @param value - the value to validate
     * @param {string} field_name - the name of the property
     * @throws {CapeValidationError}
     */
    static validateNonEmptyArrayProperty( label, value, field_name ) {
        Validate.validateArrayProperty( label, value, field_name );
        if( value[field_name].length === 0 ) {
            throw new CapeValidationError( `${label}->${field_name} must not be empty` );
        }
    }       
}

module.exports=Validate;