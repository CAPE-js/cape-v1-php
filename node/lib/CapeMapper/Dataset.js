const ValidationError = require("./ValidationError");
const FieldMapper = require("./Field");
const {parse: CSVParse} = require('csv-parse/sync');
const xlsx = require('node-xlsx').default;

class Dataset {
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
        this.config['fields'].forEach((fieldConfig, i) => {
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
        this.config['sort'].forEach((field_id, i) => {
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
     * Map one or more bytestreams into a list of records for this dataset. This is not stateless as it will
     * increment the auto_increment property used by fields who's source is set to AUTO.
     * This uses the format specified by the format parameter of the dataset config.
     * @param {String|String[]} bytestreams
     * @returns {{missing_headers: [], records: [], unmapped_headings: [], config: {}}} an array of CAPE records
     */
    generate(bytestreams) {

        let output = {
            config: this.config,
            unmapped_headings: [],
            missing_headers: [],
            records: []
        }

        output.config['fields'] = [];
        this.fieldMappers.forEach( (fieldMapper)=>{
           output.config['fields'].push( fieldMapper.config );
        });

        if (!Array.isArray(bytestreams)) {
            bytestreams = [bytestreams];
        }

        let auto_increment = 0;

        bytestreams.forEach((bytestream) => {
            let incoming_records;

            if (this.format === 'csv') {
                incoming_records = CSVParse(bytestream, {
                    columns: true,
                    skip_empty_lines: true
                });
            } else {
                let workbook = xlsx.parse(bytestream);
                const sheet = workbook[0]['data'];

                // convert workbook to records
                incoming_records = [];
                for( let i=1; i<sheet.length; ++i ) {
                    let record = {};
                    // iterate over headings in first row
                    for( let j=0; j<sheet[0].length; ++j ) {
                        record[sheet[0][j]] = sheet[i][j];
                    }
                    incoming_records.push(record);
                }
            }

            incoming_records.forEach((incoming_record) => {
                auto_increment++;
                const record_result = this.mapRecord(incoming_record, auto_increment);
                output.records.push(record_result.record);
                // TODO do something clever with missing fields and unused fields
                // make a list of all headings used by this record
                // make a list of all missing headings for this record
            })
        });

        return output;
    }

    mapRecord(incoming_record, auto_increment) {
        let result = {record: {}, used_headings: {}, missing_headings: {}};
        this.fieldMappers.forEach((field_mapper) => {
            let field_result = field_mapper.generate(incoming_record, auto_increment);
            if (field_result.value !== null) {
                result.record[field_mapper.config.id] = field_result.value;
            }
            // TODO do something clever with missing fields and unused fields
            // make a list of all headings used by this record
            // make a list of all missing headings for this record
        })
        return result;
    }
}


module.exports = Dataset;
