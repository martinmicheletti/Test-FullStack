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
// Las fuentes de datos 'statuses' y 'transfers' se las mantiene y se las piensa como fuentes de datos global
const Transfer = {
  // the database should generate the ids
  // only for tests
  getNewId: () => {
    const ids = transfers?.map((x) => x.id);
    const sorted = ids?.sort((a, b) => b - a);
    return sorted[0] + 1;
  },
  new: (licensePlate, email) => {
    return {
      id: Transfer.getNewId(),
      licensePlate: licensePlate,
      email: email,
      // status "CREADA'
      status: statuses?.find((x) => x.id === 1).name,
    };
  },
};

class InformesService {
  #repository = InformesRepository;

  // se hace publico este metodo para ejecutar los tests
  getInformesRepository = () => this.#repository;
  // Crear una función para listar todas las transferencias de un usuario mediante su correo.
  getTransferenciasUsuario = (correo) =>
    transfers.filter((x) => x.email === correo);
  // Crear una función para crear una nueva transferencia validando que todos los datos sean ingresados correctamente.
  addTransfer = (payload) => {
    this.#repository.validateAdd(payload);
    const transfer = Transfer.new(payload?.licensePlate, payload?.email);
    transfers.push(transfer);
    return transfer;
  };

  payTransfer = (email, licensePlate) => {
    const existingTransfer = this.#repository.findTransfersBy(
      email,
      licensePlate
    );
    if (!existingTransfer)
      throw new Error("No existen transferencias para los datos indicados");
    // status "PAGADA"
    existingTransfer.status = statuses?.find((x) => x.id === 2).name;
    this.abortOtherLicenseTransfers(licensePlate);
    return existingTransfer;
  };

  abortOtherLicenseTransfers = (licensePlate) => {
    const licenseTransfers = transfers?.filter(
      (x) => x.licensePlate === licensePlate
    );
    const payedLicense = licenseTransfers?.find((x) => x.status == "PAGADA");
    if (!payedLicense)
      throw new Error("No se pueden abortar las transferencias");
    licenseTransfers.forEach((x) => {
      if (x.status !== "PAGADA") x.status = "ABORTADA";
    });
  };
}

const licenseRegex = /^([A-Z]{4}\d{2})|([A-Z]{2}\d{4})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMAT_VALIDATORS = {
  validateLicenceFormat: (licencePlate) => licenseRegex.test(licencePlate),
  validateEmail: (email) => emailRegex.test(email),
};

const InformesRepository = {
  isAnyTransferPayed: (licensePlate) => {
    const licenceTransfers = transfers?.filter(
      (x) => x.licensePlate === licensePlate
    );
    const payedTransfer = licenceTransfers?.find((x) => x.status === "PAGADA");
    return payedTransfer ? true : false;
  },

  filterTransfersBy: (email, licensePlate) =>
    transfers?.filter(
      (x) => x.licensePlate === licensePlate && x.email === email
    ),

  findTransfersBy: (email, licensePlate) =>
    transfers?.find(
      (x) => x.licensePlate === licensePlate && x.email === email
    ),

  getTransfers: (licensePlate) =>
    transfers?.filter((x) => x.licensePlate === licensePlate),

  isAnyTransfer: (email, licensePlate) => {
    const existingTransfers = InformesRepository.filterTransfersBy(
      email,
      licensePlate
    );
    if (!existingTransfers || !existingTransfers.length) return false;
    const endedTransfers = existingTransfers?.find(
      (x) => x.status === "FINALIZADA" || x.status === "ABORTADA"
    );
    if (endedTransfers) return false;
    return true;
  },

  validateAdd: (payload) => {
    if (!FORMAT_VALIDATORS.validateLicenceFormat(payload?.licensePlate))
      throw new Error("La patente debe tener un formato correcto");

    if (!FORMAT_VALIDATORS.validateEmail(payload?.email))
      throw new Error("El email debe tener un formato correcto");

    if (InformesRepository.isAnyTransferPayed(payload?.licensePlate))
      throw new Error("No se aceptan mas transferencias para la patente");

    if (InformesRepository.isAnyTransfer(payload?.email, payload?.licensePlate))
      throw new Error(
        "Ya hay registradas transferencias para el email y patente indicados"
      );
  },
};

module.exports = {
  transfers,
  InformesService: new InformesService(),
  Transfer: Transfer,
  FORMAT_VALIDATORS,
};
