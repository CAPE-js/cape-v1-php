const ValidationError = require("./ValidationError");


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
        if (this.config['type'] !== 'ignore' && !this.config.hasOwnProperty('label')) {
            throw new ValidationError("Fields must have label, unless they are type 'ignore'")
        }

        // set the default for cleaner code later on
        if (!this.config.hasOwnProperty('multiple')) {
            this.config.multiple = false;
        }
        // remove mapper-specific properties from config and put them into object properties
        if (this.config.hasOwnProperty('source_heading')) {

            if (Array.isArray(this.config['source_heading'])) {
                this.source_headings = this.config["source_heading"];
            } else {
                this.source_headings = [this.config["source_heading"]];
            }

            // AUTO can't be part of a list of source headings
            if (this.source_headings > 1) {
                this.source_headings.forEach((v) => {
                    if (v === "AUTO") {
                        throw new ValidationError("AUTO can't appear in a list of source_headings");
                    }
                })
            }

            delete this.config["source_heading"];
        }
        if (this.config.hasOwnProperty('source_split')) {
            this.source_split = this.config['source_split']
            delete this.config['source_split']
        }
        if (this.config.hasOwnProperty('source_chars')) {
            this.source_split = this.config['source_chars']
            delete this.config['source_chars']
        }
    }

    /**
     * returns the value for this field based on the single incoming record, and which headings were used and any
     * columns that were expected but not found
     * @param {object} incoming_record - the record from the tabular data source
     * @param {integer} auto_increment - the next ID for an autoincrement field
     * @return {{ value: string|integer|boolean|string[]|integer[]|boolean[], used_headings: {}.<string,boolean>>, missing_headings: {}.<string,boolean> }}
     */
    generate(incoming_record, auto_increment) {
        let result = {
            value: null,
            used_headings: {},
            missing_headings: {}
        };

        // if this field is an auto_increment style field we just return that right away. No real source headings are
        // used.
        if( this.source_headings[0] === "AUTO" ) {
            result.value = auto_increment
            return result;
        }

        // work out all the headings in the incoming record we actually want to look at.
        // we also use this to set the headings we used, but that's a hash, but we need
        // this to be an ordered array
        let actual_headings = [];
        this.source_headings.forEach((source_heading) => {
            let found = false;
            // sorting should ensure numbers from 1-9 are in order, it might need a natural sort instead to
            // handle really long lists of multiple values
            const incoming_headings = Object.keys(incoming_record).sort();
            incoming_headings.forEach((incoming_heading) => {
                if (source_heading === incoming_heading) {
                    actual_headings.push(incoming_heading);
                    found = true;
                } else if (this.config.multiple) {
                    // if the field is multiple, any headings with the source_heading plus a space an number on the end
                    // are in scope too.
                    const base_heading = incoming_heading.replace(/\s+\d+$/, "");
                    if (source_heading === base_heading) {
                        actual_headings.push(incoming_heading);
                        found = true;
                    }
                }
            })

            if (!found) {
                result.missing_headings[source_heading] = true;
            }
        })

        // set the keys of the used_headings hash to the headings we're looking at
        actual_headings.forEach((actual_heading) => {
            result.used_headings[actual_heading] = true;
        });

        // if this is an ignore field, that just does the work with the headings and returns
        if (this.config.type === "ignore") {
            return result;
        }

        // default value for a multiple field is an empty list rather than null
        if( this.config.multiple ) {
            result.value = [];
        }

        let processed_values = [];
        actual_headings.forEach( (actual_heading)=>{
            if( incoming_record[actual_heading] == null ) {
                return; // skip null values
            }

            const cell_value = incoming_record[actual_heading];

            let raw_values;
            if( this.config.multiple && this.source_split != undefined ) {
                raw_values = cell_value.split( new RegExp(this.source_split));
            } else {
                raw_values = [cell_value];
            }

            // a few types of field go through a little filtering now
            raw_values.forEach( (value) => {
                // skip null values
                if( value === "" || value === null ) {
                    return;
                }

                // trim if source_chars was set
                if( this.config.hasOwnProperty('source_chars') ) {
                    value = value.substr(0, this.config['source_chars']);
                }

                // cast to a string (unless it's an integer)
                if( this.config.type === "integer") {
                    value = Number(value);
                } else {
                    value = String(value);
                }

                // trim date to 10 characters (assumes ISO8601 format date)
                if( this.config.type === "date" ) {
                    value = value.substr(0, 10);
                }

                processed_values.push( value );
            });

        });

        // if we are not a multiple field, the use the first non-null value we found
        if( this.config.multiple ) {
            result.value = processed_values
        } else if( processed_values.length > 0 ) {
            result.value = processed_values[0];
        }

        return result;
    }
}

module.exports = Field;
