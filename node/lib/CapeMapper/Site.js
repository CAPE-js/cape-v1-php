const DatasetMapper = require("./Dataset");
const ValidationError = require("./ValidationError");
let Ajv = require('ajv')
let ajv = new Ajv({ allErrors:true, allowUnionTypes:true, removeAdditional:'all' })
const capeSchema = require('../../schema.json')
const validate = ajv.compile(capeSchema);

class Site {
    datasetMappers = {};

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
            this.datasetMappers[datasetMapper['config']['id']] = datasetMapper;
        });
    }

    /**
     *  load relevant files from filesystem and map them using the config. nb. this will not work with azure
     *  @return {number}
     */
    generateSiteData() {
        return 23;
    }

}

module.exports = Site;
