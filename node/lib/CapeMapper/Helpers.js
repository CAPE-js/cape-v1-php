class Helpers {
    /**
     * If the value is not an array, wrap it in an array
     * @param {any} value
     * @return {[]}
     */
    static ensureArray(value) {
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
    }
}

export {Helpers}