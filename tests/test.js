const {
  statuses,
  transfers,
  getNewId,
  validateEmail,
  validateLicenceFormat,
  addTransfer,
  payTransfer,
  getTransfers,
} = require("../codigo");

describe("Test for valid input data fopr transfers", function () {
  // Suite implementation goes here...
  test("generates new id", () => {
    expect(getNewId()).toBe(6);
  });
  test("test valid email input: 'test@gmail.com'", () => {
    expect(validateEmail("test@gmail.com")).toBe(true);
  });
  test("test invalid email input: 'novalideemail'", () => {
    expect(validateEmail("novalideemail")).toBe(false);
  });
  test("test valid license input: 'AAAA00'", () => {
    expect(validateLicenceFormat("AAAA00")).toBe(true);
  });
  test("test valid license input: 'AA0000'", () => {
    expect(validateLicenceFormat("AA0000")).toBe(true);
  });
  test("test invalid license input: 'AAAAAA'", () => {
    expect(validateLicenceFormat("AAAAAA")).toBe(false);
  });
  test("test invalid license input: '999999'", () => {
    expect(validateLicenceFormat("999999")).toBe(false);
  });
});
describe("Test adding transfer", function () {
  test("Test adding a transfer", () => {
    expect(
      addTransfer({
        licensePlate: "AA0000",
        email: "test@gmail.com",
      })
    ).toEqual({
      id: 6,
      licensePlate: "AA0000",
      email: "test@gmail.com",
      status: "CREADA",
    });
  });
  test("Test adding a invalid transfer (invalid license)", () => {
    expect(() =>
      addTransfer({
        licensePlate: "AA00AA",
        email: "test@gmail.com",
      })
    ).toThrow(Error);
  });
  test("Test adding a invalid transfer (invalid email)", () => {
    expect(() =>
      addTransfer({
        licensePlate: "AA0000",
        email: "asdasdsad.com",
      })
    ).toThrow(Error);
  });
  test("Testing adding a transfer with a payed valid license", () => {
    transfers.push({
      id: 6,
      licensePlate: "AA0000",
      email: "test@gmail.com",
      status: "PAGADA",
    });
    expect(() =>
      addTransfer({
        licensePlate: "AA0000",
        email: "test@gmail.com",
      })
    ).toThrow(Error);
  });
  test("Testing adding an existing transfer", () => {
    expect(() =>
      addTransfer({
        licensePlate: "LFTS34",
        email: "usuario1@autored.cl",
      })
    ).toThrow(Error);
  });
});
describe("Test pay a transfer", function () {
  test("Test paying a transfer (valid)", () => {
    expect(payTransfer("usuario1@autored.cl", "LFTS34")).toEqual({
      id: 1,
      licensePlate: "LFTS34",
      email: "usuario1@autored.cl",
      status: "PAGADA",
    });
  });
  test("Test paying a transfer (invalid)", () => {
    expect(() => payTransfer("usuario1@autored.cl", "LFTS3444")).toThrow(Error);
  });
  test("Test aborting all other after paying one license", () => {
    const payed = payTransfer("usuario1@autored.cl", "LFTS34");
    // it should be one payed and all others aborted
    const transfers = getTransfers("LFTS34");
    const payedLicense = transfers?.filter((x) => x.status == "ABORTADA");
    const transfersToBeCompared = [payed, ...payedLicense];

    expect(transfers).toEqual(transfersToBeCompared);
  });
});
