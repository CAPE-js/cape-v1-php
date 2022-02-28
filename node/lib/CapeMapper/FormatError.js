/**
 * Represents a problem with converting buffers into tables.
 * @type {FormatError}
 */
class FormatError extends Error {
    constructor(message) {
        super(message);
        this.name = "FormatError";
    }
}

export { FormatError };
