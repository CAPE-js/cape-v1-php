/**
 * Represents a problem with the CAPE config data structure
 * @type {CapeValidationError}
 */
class CapeValidationError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "CapeValidationError"; 
    }
}

module.exports = CapeValidationError;
