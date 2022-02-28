import {ValidationError} from "./ValidationError.js";
import {FieldMapper} from "./FieldMapper.js";
import {BufferToTable} from "./BufferToTable.js";

class DatasetMapper {
    config = {}
    fieldMappers = []
    format = "csv"

    /**
     * Maps a single dataset in a CAPE system.
     * @param {Object} config - the JSON structure defining a single dataset
     * @throws {ValidationError} 
     */
    constructor(config) {

        this.config = config;

        let ids = {};
        this.config['fields'].forEach((fieldConfig) => {
            let fieldMapper = new FieldMapper(fieldConfig);
            this.fieldMappers.push(fieldMapper);
            // check the ids are unique
            if (ids.hasOwnProperty(fieldMapper.config.id)) {
                throw ValidationError("Field ID '${fieldMapper.config.id}' was not unique");
            }
            ids[fieldMapper.config.id] = fieldMapper;
        });
        delete this.config['fields']

        // check the sort fields exist
        this.config['sort'].forEach((field_id) => {
            if (!ids.hasOwnProperty(field_id)) {
                throw new ValidationError("Invalid sort field ${field_id}")
            }
        })

        if (!ids.hasOwnProperty(this.config["id_field"])) {
            throw new ValidationError("Invalid id_field ${this.config['id_field']}")
        }

        // format does not need to be passed through to the output json, so remove it and
        // store it as an object property instead
        if (this.config.hasOwnProperty('format')) {
            this.format = this.config['format'];
            delete this.config['format'];
        }

    }

    /**
     * @param {Array<Array<any>>} table
     * @return {Array<Object<string,any>>}
     */
    static tableToRecords(table) {
        // convert tabular data to records
        let records = [];
        for (let i = 1; i < table.length; ++i) {
            let record = {};
            // iterate over headings in first row
            for (let j = 0; j < table[0].length; ++j) {
                record[table[0][j].trim()] = table[i][j];
            }
            records.push(record);
        }
        return records;
    }

    /**
     * Map one or more bytestreams into a list of records for this dataset. This is not stateless as it will
     * increment the auto_increment property used by fields who's source is set to AUTO.
     * This uses the format specified by the format parameter of the dataset config.
     * @param {Buffer|Buffer[]} bytestreams
     * @returns {{records: [], missing_headings: [], unmapped_headings: [], config: {}}} an array of CAPE records
     */
    generate(bytestreams) {

        let output = {
            config: this.config,
            unmapped_headings: [],
            missing_headings: [],
            records: []
        }

        output.config['fields'] = [];
        this.fieldMappers.forEach((fieldMapper) => {
            output.config['fields'].push(fieldMapper.config);
        });

        if (!Array.isArray(bytestreams)) {
            bytestreams = [bytestreams];
        }

        let auto_increment = 0;
        let missing_headings = {};

        bytestreams.forEach((bytestream) => {
            const incoming_rows = BufferToTable.convert(this.format, bytestream);

            // start with a list of all headings and check them off as we see them used.
            let unmapped_headings_in_table = {};
            incoming_rows[0].forEach((heading) => {
                unmapped_headings_in_table[heading.trim()] = 1;
            });

            const incoming_records = DatasetMapper.tableToRecords(incoming_rows);

            incoming_records.forEach((incoming_record) => {
                auto_increment++;
                const record_result = this.mapRecord(incoming_record, auto_increment);
                output.records.push(record_result.record);
                // tick-off headings we've used
                Object.keys(record_result.used_headings).forEach((heading) => {
                    delete unmapped_headings_in_table[heading];
                });

                // note any headings we expected in this table but didn't find
                Object.keys(record_result.missing_headings).forEach((heading) => {
                    missing_headings[heading] = true;
                });
            }); // end of foreach incoming_record

            // note any headings that were never used once we've done the whole table
            output.unmapped_headings.push(Object.keys(unmapped_headings_in_table));
            // ... and any headings we were missing
            output.missing_headings.push(Object.keys(missing_headings));

        }); // end of foreach bytestream


        return output;
    }

    mapRecord(incoming_record, auto_increment) {
        let result = {record: {}, used_headings: {}, missing_headings: {}};
        this.fieldMappers.forEach((field_mapper) => {
            let field_result = field_mapper.generate(incoming_record, auto_increment);
            if (field_result.value !== null) {
                result.record[field_mapper.config.id] = field_result.value;
            }
            Object.keys(field_result.used_headings).forEach((key) => {
                result.used_headings[key] = true;
            })
            Object.keys(field_result.missing_headings).forEach((key) => {
                result.missing_headings[key] = true;
            })
        })
        return result;
    }
}

export {DatasetMapper};
