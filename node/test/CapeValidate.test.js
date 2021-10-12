const expect = require('chai').expect;
const CapeValidate = require('../CapeValidate');
const CapeValidationError = require( '../CapeValidationError' );

describe('validateString', ()=>{
    it('null throws error', () => {
        expect( ()=>{CapeValidate.validateString('tester',null)} ).to.throw( CapeValidationError );
    });
    it('object throws error', () => {
        expect( ()=>{CapeValidate.validateString('tester',{})} ).to.throw( CapeValidationError );
    });
    it('string throws nothing', () => {
        expect( ()=>{CapeValidate.validateString('tester','Hello')} ).not.to.throw();
    });
});
describe('validateArray', ()=>{
    it('null throws error', () => {
        expect( ()=>{CapeValidate.validateArray('tester',null)} ).to.throw( CapeValidationError );
    });
    it('object throws error', () => {
        expect( ()=>{CapeValidate.validateArray('tester',{})} ).to.throw( CapeValidationError );
    });
    it('string throws error', () => {
        expect( ()=>{CapeValidate.validateArray('tester','hello')} ).to.throw( CapeValidationError );
    });
    it('empty array throws nothing', () => {
        expect( ()=>{CapeValidate.validateArray('tester',[])} ).not.to.throw();
    });
    it('array throws nothing', () => {
        expect( ()=>{CapeValidate.validateArray('tester',[1,2,3])} ).not.to.throw();
    });
});
describe('validateProperty', ()=>{
    it('not actually an object throws error', () => {
        expect( ()=>{CapeValidate.validateProperty('tester','fish','title')} ).to.throw( CapeValidationError );
    });
    it('property not found throws error', () => {
        expect( ()=>{CapeValidate.validateProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
    });
    it('property found throws nothing', () => {
        expect( ()=>{CapeValidate.validateProperty('tester',{'foo':23},'foo')} ).not.to.throw();
    });
});
describe('validateStringProperty', ()=>{
    it('not actually an object throws error', () => {
        expect( ()=>{CapeValidate.validateStringProperty('tester','fish','title')} ).to.throw( CapeValidationError );
    });
    it('property not found throws error', () => {
        expect( ()=>{CapeValidate.validateStringProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
    });
    it('property is object throws error', () => {
        expect( ()=>{CapeValidate.validateStringProperty('tester',{'foo':{}},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is number throws error', () => {
        expect( ()=>{CapeValidate.validateStringProperty('tester',{'foo':23},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is string throws nothing', () => {
        expect( ()=>{CapeValidate.validateStringProperty('tester',{'foo':'hello'},'foo')} ).not.to.throw();
    });
});
describe('validateArrayProperty', ()=>{
    it('not actually an object throws error', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester','fish','title')} ).to.throw( CapeValidationError );
    });
    it('property not found throws error', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
    });
    it('property is object throws error', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':{}},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is number throws error', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':23},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is string throws error', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':'hello'},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is array throws nothing', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':[1,2,3]},'foo')} ).not.to.throw();
    });
    it('property is empty array throws nothing', () => {
        expect( ()=>{CapeValidate.validateArrayProperty('tester',{'foo':[]},'foo')} ).not.to.throw();
    });
});
describe('validateNonEmptyArrayProperty', ()=>{
    it('not actually an object throws error', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester','fish','title')} ).to.throw( CapeValidationError );
    });
    it('property not found throws error', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester',{'foo':23},'bar')} ).to.throw( CapeValidationError );
    });
    it('property is object throws error', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester',{'foo':{}},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is number throws error', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester',{'foo':23},'foo')} ).to.throw( CapeValidationError );
    });
    it('property is array throws nothing', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester',{'foo':[1,2,3]},'foo')} ).not.to.throw();
    });
    it('property is empty array throws error', () => {
        expect( ()=>{CapeValidate.validateNonEmptyArrayProperty('tester',{'foo':[]},'foo')} ).to.throw( CapeValidationError );
    });
});
