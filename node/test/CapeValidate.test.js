const expect = require("chai").expect;
const CapeValidate = require("../CapeValidate");
const CapeValidationError = require("../CapeValidationError");
var sinon = require("sinon");

describe("CapeValidation", () => {
  afterEach(function () {
    sinon.restore();
  });

  describe("validateString", () => {
    it("throws error when passed null", () => {
      expect(() => {
        CapeValidate.validateString("tester", null);
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed object", () => {
      expect(() => {
        CapeValidate.validateString("tester", {});
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed string", () => {
      expect(() => {
        CapeValidate.validateString("tester", "Hello");
      }).not.to.throw();
    });
  });

  describe("validateArray", () => {
    it("throws error when passed null", () => {
      expect(() => {
        CapeValidate.validateArray("tester", null);
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed object", () => {
      expect(() => {
        CapeValidate.validateArray("tester", {});
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed string", () => {
      expect(() => {
        CapeValidate.validateArray("tester", "hello");
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed empty array", () => {
      expect(() => {
        CapeValidate.validateArray("tester", []);
      }).not.to.throw();
    });
    it("does not throw error when passed array", () => {
      expect(() => {
        CapeValidate.validateArray("tester", [1, 2, 3]);
      }).not.to.throw();
    });
  });

  describe("validateObject", () => {
    it("throws error when passed null", () => {
      expect(() => {
        CapeValidate.validateObject("tester", null);
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed array", () => {
      expect(() => {
        CapeValidate.validateObject("tester", []);
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed string", () => {
      expect(() => {
        CapeValidate.validateObject("tester", "hello");
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed empty object", () => {
      expect(() => {
        CapeValidate.validateObject("tester", {});
      }).not.to.throw();
    });
    it("does not throw error when passed object", () => {
      expect(() => {
        CapeValidate.validateObject("tester", {'foo':1,'bar': 2});
      }).not.to.throw();
    });
  });

  describe("validateProperty", () => {
    it("checks that the value is an object", () => {
      sinon.replace(CapeValidate, "validateObject", sinon.fake()); 
      var value = {"title":"foo"};
      CapeValidate.validateProperty("context", value, "title");
      expect( CapeValidate.validateObject.calledOnceWith( "context", value ) ).to.be.true;
    });
    it("throws error when passed property not found", () => {
      expect(() => {
        CapeValidate.validateProperty("tester", { foo: 23 }, "bar");
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed property found", () => {
      expect(() => {
        CapeValidate.validateProperty("tester", { foo: 23 }, "foo");
      }).not.to.throw();
    });
  });


  describe("validateStringProperty", () => {
    it("checks the property exists", () => {
      sinon.replace(CapeValidate, "validateProperty", sinon.fake()); 
      sinon.replace(CapeValidate, "validateString", sinon.fake()); 
      var value = {"title":"foo"};
      CapeValidate.validateProperty("context", value, "title");
      expect( CapeValidate.validateProperty.calledOnceWith( "context", value, "title" ) ).to.be.true;
    });
    it("checks the property is a string", () => {
      sinon.replace(CapeValidate, "validateProperty", sinon.fake()); 
      sinon.replace(CapeValidate, "validateString", sinon.fake()); 
      var value = {"title":"foo"};
      CapeValidate.validateStringProperty("context", value, "title");
      expect( CapeValidate.validateString.calledOnceWith( "context", "foo" ) ).to.be.true;
    });
  });

  describe("validateArrayProperty", () => {
    it("checks the property exists", () => {
      sinon.replace(CapeValidate, "validateProperty", sinon.fake()); 
      sinon.replace(CapeValidate, "validateArray", sinon.fake()); 
      var value = {"title":[]};
      CapeValidate.validateArrayProperty("context", value, "title");
      expect( CapeValidate.validateProperty.calledOnceWith( "context", value, "title" ) ).to.be.true;
    });
    it("checks the property is an array", () => {
      sinon.replace(CapeValidate, "validateProperty", sinon.fake()); 
      sinon.replace(CapeValidate, "validateArray", sinon.fake()); 
      var value = {"title":[]};
      CapeValidate.validateArrayProperty("context", value, "title");
      expect( CapeValidate.validateArray.calledOnceWith( "context->title", [] ) ).to.be.true;
    });
  });


  describe("validateNonEmptyArrayProperty", () => {
    it("checks the property exists and is an array", () => {
      sinon.replace(CapeValidate, "validateArrayProperty", sinon.fake()); 
      var value = {"foo":[1,2,3]};
      CapeValidate.validateNonEmptyArrayProperty("context", value, "foo");
      expect( CapeValidate.validateArrayProperty.calledOnceWith( "context", value, "foo" ) ).to.be.true;
    });
    it("does not throw error when passed property is non-empty array", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty("tester", { foo: [1, 2, 3] }, "foo");
      }).not.to.throw();
    });
    it("throws error when passed property is empty array", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty(
          "tester",
          { foo: [] },
          "foo"
        );
      }).to.throw(CapeValidationError);
    });
  });
});
