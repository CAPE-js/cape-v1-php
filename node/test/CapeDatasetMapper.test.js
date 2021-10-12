const expect = require('chai').expect;
const cloneDeep = require('lodash').cloneDeep;
const CapeDemoConfig = require('../CapeDemoConfig');
const CapeDatasetMapper = require('../CapeDatasetMapper');
const CapeValidationError = require( '../CapeValidationError' );

describe('Constructor checks', () => {
    it('Throw validation error when passed null dataset', () => {
        expect( ()=>{new CapeDatasetMapper(null)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed non-object', () => {
        expect( ()=>{new CapeDatasetMapper(23)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed dataset config with no id', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.id;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed dataset config with no title', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.title;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed dataset config with no id_field', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.id_field;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed dataset config with no fields', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.fields;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed dataset config with empty fields', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        config.fields = [];
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('Throw nothing when passed valid config', () => {
        expect( ()=>{new CapeDatasetMapper(CapeDemoConfig.dataset)} ).not.to.throw();
    });

// sort all valid fields
// id_field exists
});
