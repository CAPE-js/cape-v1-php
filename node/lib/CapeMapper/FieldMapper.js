import {ValidationError} from "./ValidationError.js";
import {Helpers} from "./Helpers.js";

class FieldMapper {
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

            this.source_headings = Helpers.ensureArray(this.config["source_heading"]);

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

        // check the default_filter_mode makes sense for the type. We can assume the type is a legal value
        // as we've already done the basic schema validation
        if( this.config.hasOwnProperty('default_filter_mode' ) ) {
            let allowed_modes_by_type = {
              'text':     ['set','not-set','is','contains'],
              'freetext': ['set','not-set','is','contains'],
              'integer':  ['set','not-set','is','between'],
              'date':     ['set','not-set','is','between'],
              'enum':     ['set','not-set','is','one-of'],
              'ignore':   []
            };
            let allowed_modes = allowed_modes_by_type[this.config['type']];
            if( ! allowed_modes.includes( this.config['default_filter_mode'] )) {
                throw new ValidationError("Fields of type '"+this.config['type']+"' can't have a default_filter_mode of '"+this.config['default_filter_mode']+"' (allowed valiues are "+allowed_modes.join( ", ")+")");
            }
        }

        // Here is where we might want to validate that the default_filter_mode type is allowed for the field type

        if (this.config.hasOwnProperty('source_split')) {
            this.source_split = this.config['source_split']
            delete this.config['source_split']
        }
        if (this.config.hasOwnProperty('source_chars')) {
            this.source_chars = this.config['source_chars']
            delete this.config['source_chars']
        }
    }

    /**
     * returns the value for this field based on the single incoming record, and which headings were used and any
     * columns that were expected but not found
     * @param {object} incoming_record - the record from the tabular data source
     * @param {integer} auto_increment_counter - the next ID for an autoincrement field
     * @return {{ value: any, used_headings: {}, missing_headings: {} }}
     */
    generate(incoming_record, auto_increment_counter) {
        let result = {
            value: null,
            used_headings: {},
            missing_headings: {}
        };

        // if this field is an auto_increment_counter style field we just return that right away. No real source headings are
        // used.
        if (this.source_headings[0] === "AUTO") {
            result.value = auto_increment_counter
        } else {
            const source_headings_used_in_this_field = this.select_source_headings(incoming_record, result);
            if (this.config.type !== "ignore") {
                if (this.config.multiple) {
                    result.value = this.process_raw_values(source_headings_used_in_this_field, incoming_record)
                } else {
                    let processed_values = this.process_raw_values(source_headings_used_in_this_field, incoming_record);
                    if (processed_values.length > 0) {
                        result.value = processed_values[0];
                    }
                }
            }
        }
        return result;

    }

    /**
     * Use the list of source headings to process the raw tabular cells into values for our
     * cape dataset.
     * @param {string[]} source_headings_used_in_this_field
     * @param {Object} incoming_record
     * @returns {Array.<string|integer>}
     */
    process_raw_values(source_headings_used_in_this_field, incoming_record) {
        let processed_values = [];
        source_headings_used_in_this_field.forEach((actual_heading) => {
            if (incoming_record[actual_heading] != null) {
                let raw_values;
                // if it's any kind of null value then it's not valid
                // noinspection EqualityComparisonWithCoercionJS
                if (this.config.multiple && this.source_split != undefined) {
                    raw_values = incoming_record[actual_heading].split(new RegExp(this.source_split));
                } else {
                    raw_values = [incoming_record[actual_heading]];
                }

                // a few types of field go through a little filtering now
                raw_values.forEach((value) => {
                    if (value !== "" && value !== null) {
                        processed_values.push(this.process_single_raw_value(value));
                    }
                });
            }
        });
        return processed_values;
    }

    /**
     * Do any processing needed to turn a single source value into a cape value, including casting to correct type,
     * trimming dates to 10 characters and doing the source_chars trimming, if needed.
     * @param {string | number }
     * @return {string | number}
     */
    process_single_raw_value(value) {
        // trim if source_chars was set
        if (this.source_chars) {
            value = value.substring(0, this.source_chars);
        }

        // cast to a string (unless it's an integer)
        if (this.config.type === "integer") {
            value = Number(value);
        } else {
            value = String(value);
        }

        // trim date to 10 characters (assumes ISO8601 format date)
        if (this.config.type === "date") {
            value = value.substring(0, 10);
        }
        return value;
    }

    /**
     * Work out all the headings in the incoming record we actually want to look at.
     * we also use this to set the headings we used.
     * @param {Object} incoming_record
     * @param {{used_headings: {}, missing_headings: {}, value: integer|string}} result
     * @return {string[]}
     */
    select_source_headings(incoming_record, result) {

        let source_headings_used_in_this_field = [];

        this.source_headings.forEach((source_heading) => {
            let found = false;
            // sorting should ensure numbers from 1-9 are in order, it might need a natural sort instead to
            // handle really long lists of multiple values
            const incoming_headings = Object.keys(incoming_record).sort();
            incoming_headings.forEach((incoming_heading) => {
                if (source_heading === incoming_heading) {
                    source_headings_used_in_this_field.push(incoming_heading);
                    result.used_headings[incoming_heading] = true;
                    found = true;
                } else if (this.config.multiple) {
                    // if the field is multiple, any headings with the source_heading plus a space an number on the end
                    // are in scope too.
                    const base_heading = incoming_heading.replace(/\s+\d+$/, "");
                    if (source_heading === base_heading) {
                        source_headings_used_in_this_field.push(incoming_heading);
                        result.used_headings[incoming_heading] = true;
                        found = true;
                    }
                }
            })

            if (!found) {
                result.missing_headings[source_heading] = true;
            }
        })
        return source_headings_used_in_this_field;
    }
}

export {FieldMapper};
