const {
  transfers,
  informesService,
  transferBuilder,
  FORMAT_VALIDATORS,
} = require("../codigo");

describe("Test for valid input data fopr transfers", function () {
  test("generates new id", () => {
    // starting
    expect(transferBuilder.getNewId()).toBe(6);
  });
  test("test valid email input: 'test@gmail.com'", () => {
    expect(FORMAT_VALIDATORS.validateEmail("test@gmail.com")).toBe(true);
  });
  test("test invalid email input: 'novalideemail'", () => {
    expect(FORMAT_VALIDATORS.validateEmail("novalideemail")).toBe(false);
  });
  test("test valid license input: 'AAAA00'", () => {
    expect(FORMAT_VALIDATORS.validateLicenceFormat("AAAA00")).toBe(true);
  });
  test("test valid license input: 'AA0000'", () => {
    expect(FORMAT_VALIDATORS.validateLicenceFormat("AA0000")).toBe(true);
  });
  test("test invalid license input: 'AAAAAA'", () => {
    expect(FORMAT_VALIDATORS.validateLicenceFormat("AAAAAA")).toBe(false);
  });
  test("test invalid license input: '999999'", () => {
    expect(FORMAT_VALIDATORS.validateLicenceFormat("999999")).toBe(false);
  });
});
describe("Test get transfers by email", function () {
  test("Test get transfers by email ('usuario1@autored.cl') (valid)", () => {
    expect(
      informesService.getTransferenciasUsuario("usuario1@autored.cl").length
    ).toEqual(2);
  });
  test("Test get transfers by inexisting email ('test@gmail.com')", () => {
    expect(
      informesService.getTransferenciasUsuario("test@gmail.com").length
    ).toEqual(0);
  });
});

describe("Test adding transfer", function () {
  test("Test adding a transfer", () => {
    expect(
      informesService.addTransfer({
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
      informesService.addTransfer({
        licensePlate: "AA00AA",
        email: "test@gmail.com",
      })
    ).toThrow(Error);
  });
  test("Test adding a invalid transfer (invalid email)", () => {
    expect(() =>
      informesService.addTransfer({
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
      informesService.addTransfer({
        licensePlate: "AA0000",
        email: "test@gmail.com",
      })
    ).toThrow(Error);
  });
  test("Testing adding an existing transfer, but with others in status 'ABORTADA' o FINALIZADA", () => {
    expect(
      informesService.addTransfer({
        licensePlate: "LFTS35",
        email: "usuario1@autored.cl",
      })
    ).toEqual({
      id: transferBuilder.getNewId() - 1,
      licensePlate: "LFTS35",
      email: "usuario1@autored.cl",
      status: "CREADA",
    });
  });
  test("Testing adding an existing transfer", () => {
    expect(() =>
      informesService.addTransfer({
        licensePlate: "LFTS34",
        email: "usuario1@autored.cl",
      })
    ).toThrow(Error);
  });
});
describe("Test pay a transfer", function () {
  test("Test paying a transfer (valid)", () => {
    expect(
      informesService.payTransfer("usuario1@autored.cl", "LFTS34")
    ).toEqual({
      id: 1,
      licensePlate: "LFTS34",
      email: "usuario1@autored.cl",
      status: "PAGADA",
    });
  });
  test("Test paying a transfer (invalid)", () => {
    expect(() =>
      informesService.payTransfer("usuario1@autored.cl", "LFTS3444")
    ).toThrow(Error);
  });
  test("Test aborting all transfers without payments", () => {
    expect(() =>
      informesService
        .getInformesRepository()
        .abortOtherLicenseTransfers("BDLS99")
    ).toThrow(Error);
  });
  test("Test aborting all other after paying one license", () => {
    const payed = informesService.payTransfer("usuario1@autored.cl", "LFTS34");
    // it should be one payed and all others aborted
    const transfers = informesService
      .getInformesRepository()
      .getTransfers("LFTS34");
    const payedLicense = transfers?.filter((x) => x.status == "ABORTADA");
    const transfersToBeCompared = [payed, ...payedLicense];
    expect(transfers).toEqual(transfersToBeCompared);
  });
});
