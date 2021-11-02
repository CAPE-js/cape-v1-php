

module.exports = class CapeValidationError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = "CapeValidationError"; 
    }
}
