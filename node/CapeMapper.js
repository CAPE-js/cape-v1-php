
const CapeDatasetMapper = require( "./CapeDatasetMapper" );
const CapeValidate = require( "./CapeValidate" );
const CapeValidationError = require( "./CapeValidationError" );

module.exports = class CapeMapper {

    constructor( config ) { 
        this.config = config;
        
        // validation happens in stages as we validate before we can move to the next part of the  constructor
        CapeValidate.validateObject( "Config", this.config );
        CapeValidate.validateNonEmptyArrayProperty( "Config", this.config, "datasets" );

        this.datasetMappers = {};
        this.config.datasets.forEach( (datasetConfig) => {
            var datasetMapper = new CapeDatasetMapper( datasetConfig );
            this.datasetMappers[ datasetMapper.id ] = datasetMapper;
        });
    }

    // load relevant files from filesystem and map them using the config. nb. this will not work with azure 
    generateSiteData() {
        return 23;
    }

}

