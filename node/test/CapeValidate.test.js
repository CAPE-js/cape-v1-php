const expect = require("chai").expect;
const CapeValidate = require("../CapeValidate");
const CapeValidationError = require("../CapeValidationError");

describe("CapeValidation", () => {
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

  describe("validateProperty", () => {
    it("throws error when passed not actually an object", () => {
      expect(() => {
        CapeValidate.validateProperty("tester", "fish", "title");
      }).to.throw(CapeValidationError);
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
    it("throws error when passed not actually an object", () => {
      expect(() => {
        CapeValidate.validateStringProperty("tester", "fish", "title");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property not found", () => {
      expect(() => {
        CapeValidate.validateStringProperty("tester", { foo: 23 }, "bar");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is object", () => {
      expect(() => {
        CapeValidate.validateStringProperty("tester", { foo: {} }, "foo");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is number", () => {
      expect(() => {
        CapeValidate.validateStringProperty("tester", { foo: 23 }, "foo");
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed property is string", () => {
      expect(() => {
        CapeValidate.validateStringProperty("tester", { foo: "hello" }, "foo");
      }).not.to.throw();
    });
  });

  describe("validateArrayProperty", () => {
    it("throws error when passed not actually an object", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", "fish", "title");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property not found", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: 23 }, "bar");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is object", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: {} }, "foo");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is number", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: 23 }, "foo");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is string", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: "hello" }, "foo");
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed property is array", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: [1, 2, 3] }, "foo");
      }).not.to.throw();
    });
    it("does not throw error when passed property is empty array", () => {
      expect(() => {
        CapeValidate.validateArrayProperty("tester", { foo: [] }, "foo");
      }).not.to.throw();
    });
  });

  describe("validateNonEmptyArrayProperty", () => {
    it("throws error when passed not actually an object", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty("tester", "fish", "title");
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property not found", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty(
          "tester",
          { foo: 23 },
          "bar"
        );
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is object", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty(
          "tester",
          { foo: {} },
          "foo"
        );
      }).to.throw(CapeValidationError);
    });
    it("throws error when passed property is number", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty(
          "tester",
          { foo: 23 },
          "foo"
        );
      }).to.throw(CapeValidationError);
    });
    it("does not throw error when passed property is array", () => {
      expect(() => {
        CapeValidate.validateNonEmptyArrayProperty(
          "tester",
          { foo: [1, 2, 3] },
          "foo"
        );
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
