const expect = require('chai').expect;
const cloneDeep = require('lodash').cloneDeep;
const CapeDemoConfig = require('../CapeDemoConfig');
const CapeDatasetMapper = require('../CapeDatasetMapper');
const CapeValidationError = require( '../CapeValidationError' );

describe('Constructor checks', () => {
    it('null dataset config throws validation error', () => {
        expect( ()=>{new CapeDatasetMapper(null)} ).to.throw( CapeValidationError );
    });
    it('non-object object dataset config throws validation error', () => {
        expect( ()=>{new CapeDatasetMapper(23)} ).to.throw( CapeValidationError );
    });
    it('dataset config with no id entry throws validation error', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.id;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('dataset config with no title entry throws validation error', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.title;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('dataset config with no id_field entry throws validation error', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.id_field;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('dataset config with no fields entry throws validation error', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        delete config.fields;
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('dataset config with empty fields entry throws validation error', () => {
        var config = cloneDeep(CapeDemoConfig.dataset);        
        config.fields = [];
        expect( ()=>{new CapeDatasetMapper(config)} ).to.throw( CapeValidationError );
    });
    it('dataset config with valid config throws no errors', () => {
        expect( ()=>{new CapeDatasetMapper(CapeDemoConfig.dataset)} ).not.to.throw();
    });

// sort all valid fields
// id_field exists
});
