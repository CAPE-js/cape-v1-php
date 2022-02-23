/**
 * Represents a problem with the CAPE config data structure
 * @type {ValidationError}
 */
class ValidationError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "ValidationError";
    }
}

export { ValidationError };
