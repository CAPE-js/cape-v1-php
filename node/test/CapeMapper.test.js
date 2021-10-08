const assert = require('assert');
const expect = require('chai').expect;
const CapeMapper = require('../CapeMapper');
const CapeValidationError = require( '../CapeValidationError' );

describe('Validator checks', ()=>{
    describe('validateString', ()=>{
        it('null throws error', () => {
            expect( ()=>{CapeMapper.validateString('tester',null)} ).to.throw( CapeValidationError );
        });
        it('object throws error', () => {
            expect( ()=>{CapeMapper.validateString('tester',{})} ).to.throw( CapeValidationError );
        });
        it('string throws nothing', () => {
            expect( ()=>{CapeMapper.validateString('tester','Hello')} ).not.to.throw();
        });
    });
    describe('validateArray', ()=>{
        it('null throws error', () => {
            expect( ()=>{CapeMapper.validateArray('tester',null)} ).to.throw( CapeValidationError );
        });
        it('object throws error', () => {
            expect( ()=>{CapeMapper.validateArray('tester',{})} ).to.throw( CapeValidationError );
        });
        it('array throws nothing', () => {
            expect( ()=>{CapeMapper.validateArray('tester',[])} ).not.to.throw();
        });
    });
    describe('validateProperty', ()=>{
        it('not actually an object throws error', () => {
            expect( ()=>{CapeMapper.validateProperty('tester','fish','title')} ).to.throw( CapeValidationError );
        });
        it('property not found throws error', () => {
            expect( ()=>{CapeMapper.validateProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
        });
        it('property found throws nothing', () => {
            expect( ()=>{CapeMapper.validateProperty('tester',{'foo':23},'foo')} ).not.to.throw();
        });
    });
    describe('validateStringProperty', ()=>{
        it('not actually an object throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester','fish','title')} ).to.throw( CapeValidationError );
        });
        it('property not found throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
        });
        it('property is object throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':{}},'foo')} ).to.throw( CapeValidationError );
        });
        it('property is number throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':23},'foo')} ).to.throw( CapeValidationError );
        });
        it('property is string throws nothing', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':'hello'},'foo')} ).not.to.throw();
        });
    });
    describe('validateArrayProperty', ()=>{
        it('not actually an object throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester','fish','title')} ).to.throw( CapeValidationError );
        });
        it('property not found throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
        });
        it('property is object throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':{}},'foo')} ).to.throw( CapeValidationError );
        });
        it('property is number throws error', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':23},'foo')} ).to.throw( CapeValidationError );
        });
        it('property is string throws nothing', () => {
            expect( ()=>{CapeMapper.validateStringProperty('tester',{'foo':'hello'},'foo')} ).not.to.throw();
        });
    });
/*




    static validateNonEmptyArrayProperty( object_label, object, field_name ) {
        validateProperty( label, object, field_name );
        validateArray( label, object[field_name] );
        if( object[field_name].length == 0 ) {
            throw new CapeValidationError( object_label+' field '+field_name+' must not be empty' );
        }
    }       
*/
});

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
});
