// Lista de estados posibles para una transferencia.
const statuses = [
  {
    id: 1,
    name: "CREADA",
  },
  {
    id: 2,
    name: "PAGADA",
  },
  {
    id: 3,
    name: "ABORTADA",
  },
  {
    id: 4,
    name: "FINALIZADA",
  },
];

// Lista de transferencias inicial
const transfers = [
  {
    id: 1,
    licensePlate: "LFTS34",
    email: "usuario1@autored.cl",
    status: "CREADA",
  },
  {
    id: 2,
    licensePlate: "LFTS35",
    email: "usuario1@autored.cl",
    status: "ABORTADA",
  },
  {
    id: 3,
    licensePlate: "BDLS99",
    email: "usuario3@autored.cl",
    status: "CREADA",
  },
  {
    id: 4,
    licensePlate: "LFTS34",
    email: "usuario4@autored.cl",
    status: "CREADA",
  },
  {
    id: 5,
    licensePlate: "BDLS99",
    email: "usuario5@autored.cl",
    status: "FINALIZADA",
  },
];

// Escribe tu codigo acá

class TransferBuilder {
  #estadosRepository;
  constructor(estadosRepository) {
    this.#estadosRepository = estadosRepository;
  }
  getNewId = () => {
    const ids = transfers?.map((x) => x.id);
    const sorted = ids?.sort((a, b) => b - a);
    return sorted[0] + 1;
  };
  new = (licensePlate, email) => {
    return {
      id: this.getNewId(),
      licensePlate: licensePlate,
      email: email,
      status: this.#estadosRepository?.getEstadoCreada().name,
    };
  };
}

class InformesService {
  #repository;
  constructor(informesRepository) {
    this.#repository = informesRepository;
  }
  getInformesRepository = () => this.#repository;
  // Crear una función para listar todas las transferencias de un usuario mediante su correo.
  getTransferenciasUsuario = (correo) =>
    transfers?.filter((x) => x.email === correo);
  // Crear una función para crear una nueva transferencia validando que todos los datos sean ingresados correctamente.
  addTransfer = (payload) => this.#repository?.addTransfer(payload);
  //  Crear una función para pagar una transferencia mediante correo y patente.
  payTransfer = (email, licensePlate) =>
    this.#repository?.payTransfer(email, licensePlate);
}

const licenseRegex = /^([A-Z]{4}\d{2})|([A-Z]{2}\d{4})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMAT_VALIDATORS = {
  validateLicenceFormat: (licencePlate) => licenseRegex.test(licencePlate),
  validateEmail: (email) => emailRegex.test(email),
};
class InformesRepository {
  #transfers = transfers;
  #estadosRepository;
  #transferBuilder;
  constructor(estadosRepository, transferBuilder) {
    this.#estadosRepository = estadosRepository;
    this.#transferBuilder = transferBuilder;
  }
  add = (transfer) => {
    this.#transfers.push(transfer);
  };
  addTransfer = (payload) => {
    this.validateAdd(payload);
    const transfer = this.#transferBuilder.new(
      payload?.licensePlate,
      payload?.email
    );
    this.add(transfer);
    return transfer;
  };

  isAnyTransferPayed = (licensePlate) => {
    const licenceTransfers = this.#transfers?.filter(
      (x) => x.licensePlate === licensePlate
    );
    const payedTransfer = licenceTransfers?.find(
      (x) => x.status === this.#estadosRepository?.getEstadoPagada().name
    );
    return payedTransfer ? true : false;
  };

  filterTransfersBy = (email, licensePlate) =>
    this.#transfers?.filter(
      (x) => x.licensePlate === licensePlate && x.email === email
    );

  findTransfersBy = (email, licensePlate) =>
    this.#transfers?.find(
      (x) => x.licensePlate === licensePlate && x.email === email
    );

  getTransfers = (licensePlate) =>
    this.#transfers?.filter((x) => x.licensePlate === licensePlate);

  isAnyTransfer = (email, licensePlate) => {
    const existingTransfers = this.filterTransfersBy(email, licensePlate);
    if (!existingTransfers || !existingTransfers.length) return false;
    const endedTransfers = existingTransfers?.find(
      (x) =>
        x.status === this.#estadosRepository?.getEstadoFinalizada().name ||
        x.status === this.#estadosRepository?.getEstadoAbortada().name
    );
    if (endedTransfers) return false;
    return true;
  };

  validateAdd = (payload) => {
    if (!FORMAT_VALIDATORS.validateLicenceFormat(payload?.licensePlate))
      throw new Error("La patente debe tener un formato correcto");

    if (!FORMAT_VALIDATORS.validateEmail(payload?.email))
      throw new Error("El email debe tener un formato correcto");

    if (this.isAnyTransferPayed(payload?.licensePlate))
      throw new Error("No se aceptan mas transferencias para la patente");

    if (this.isAnyTransfer(payload?.email, payload?.licensePlate))
      throw new Error(
        "Ya hay registradas transferencias para el email y patente indicados"
      );
  };

  abortOtherLicenseTransfers = (licensePlate) => {
    const licenseTransfers = this.#transfers?.filter(
      (x) => x.licensePlate === licensePlate
    );
    const payedLicense = licenseTransfers?.find(
      (x) => x.status == this.#estadosRepository?.getEstadoPagada().name
    );
    if (!payedLicense)
      throw new Error("No se pueden abortar las transferencias");
    licenseTransfers.forEach((x) => {
      if (x.status !== this.#estadosRepository?.getEstadoPagada().name)
        x.status = this.#estadosRepository?.getEstadoAbortada().name;
    });
  };

  payTransfer = (email, licensePlate) => {
    const existingTransfer = this.findTransfersBy(email, licensePlate);
    if (!existingTransfer)
      throw new Error("No existen transferencias para los datos indicados");
    existingTransfer.status = this.#estadosRepository?.getEstadoPagada().name;
    this.abortOtherLicenseTransfers(licensePlate);
    return existingTransfer;
  };
}
class EstadosRepository {
  #statuses = statuses;
  getEstadoCreada = () => this.#statuses?.find((x) => x.name == "CREADA");
  getEstadoPagada = () => this.#statuses?.find((x) => x.name == "PAGADA");
  getEstadoAbortada = () => this.#statuses?.find((x) => x.name == "ABORTADA");
  getEstadoFinalizada = () =>
    this.#statuses?.find((x) => x.name == "FINALIZADA");
}

const estadosRepo = new EstadosRepository();
const transferBuilder = new TransferBuilder(estadosRepo);
const informesRepo = new InformesRepository(estadosRepo, transferBuilder);

module.exports = {
  transfers,
  InformesService: new InformesService(informesRepo),
  Transfer: new TransferBuilder(),
  transferBuilder: transferBuilder,
  estadosRepository: estadosRepo,
  FORMAT_VALIDATORS,
};
