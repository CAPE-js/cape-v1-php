const expect = require('chai').expect;
const CapeMapper = require('../CapeMapper');
const CapeValidationError = require( '../CapeValidationError' );
const CapeDemoConfig = require('../CapeDemoConfig');

describe('Constructor checks', () => {
    it('null site config throws validation error', () => {
        expect( ()=>{new CapeMapper(null)} ).to.throw( CapeValidationError );
    });
    it('non-object object site config throws validation error', () => {
        expect( ()=>{new CapeMapper(23)} ).to.throw( CapeValidationError );
    });
    it('site config with no datasets entry throws validation error', () => {
        expect( ()=>{new CapeMapper({})} ).to.throw( CapeValidationError );
    });
    it('site config with no datasets throws validation error', () => {
        expect( ()=>{new CapeMapper({'datasets':[]})} ).to.throw( CapeValidationError );
    });
    it('site config with valid config does not throw error', () => {
        expect( ()=>{new CapeMapper(CapeDemoConfig.full)} ).not.to.throw();
    });
});
