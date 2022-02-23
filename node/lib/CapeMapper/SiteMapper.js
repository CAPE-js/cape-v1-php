import { DatasetMapper } from "./DatasetMapper.js";
import { ValidationError } from "./ValidationError.js"

import Ajv from 'ajv';
let ajv = new Ajv({ allErrors:true, allowUnionTypes:true, removeAdditional:'all' })
import { readFileSync } from 'fs';
const rawJsonConfig = readFileSync("schema.json");

const capeSchema  = JSON.parse(rawJsonConfig);
const validate = ajv.compile(capeSchema);

class SiteMapper {
    datasetMappers = [];

    /**
     * Construct a new mapper class using the given config, taken from config.json
     * @param {Object} config
     * @throws {ValidationError}
     */
    constructor(config) {
        if (!validate(config)) {
            throw new ValidationError(ajv.errorsText(validate.errors))
        }

        config['datasets'].forEach((datasetConfig) => {
            let datasetMapper = new DatasetMapper(datasetConfig);
            this.datasetMappers.push( datasetMapper );
        });
    }

    /**
     *  load relevant files from filesystem and map them using the config. nb. this will not work with azure
     *  @param {Object.<string,Buffer|Buffer[]>} source_data. An array of bytestreams to import for each dataset. The key is the ID of the dataset.
     *  @return {Object}
     */
    generate(source_data) {
        let output = { status:"OK", datasets: []};
        this.datasetMappers.forEach( (dataset_mapper) => {
           output.datasets.push( dataset_mapper.generate( source_data[ dataset_mapper.config.id ] ));
        });
        return output;
    }

}

export { SiteMapper };
