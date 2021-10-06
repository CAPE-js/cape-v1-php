const assert = require('assert');
const expect = require('chai').expect;

describe('Simple Math Test', () => {
    it('should return 2', () => {
        assert.equal(1 + 1, 2);
    });
    it('should return 9', () => {
        assert.equal(3 * 3, 9);
    });
    it('should return 16', () => {
        expect(4*4).to.equal(16);
    });
});
