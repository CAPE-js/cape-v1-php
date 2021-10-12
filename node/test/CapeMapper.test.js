const expect = require('chai').expect;
const CapeMapper = require('../CapeMapper');
const CapeValidationError = require( '../CapeValidationError' );
const CapeDemoConfig = require('../CapeDemoConfig');

describe('Constructor checks', () => {
    it('Throw validation error when passed null', () => {
        expect( ()=>{new CapeMapper(null)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed non-object', () => {
        expect( ()=>{new CapeMapper(23)} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed site config with no datasets', () => {
        expect( ()=>{new CapeMapper({})} ).to.throw( CapeValidationError );
    });
    it('Throw validation error when passed site config with empty datasets list', () => {
        expect( ()=>{new CapeMapper({'datasets':[]})} ).to.throw( CapeValidationError );
    });
    it('Throw nonthing when passed valid site config', () => {
        expect( ()=>{new CapeMapper(CapeDemoConfig.full)} ).not.to.throw();
    });
});
