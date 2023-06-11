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

// - Crear una función para listar
// todas las transferencias de un usuario mediante su correo.
const getTransferenciasUsuario = (correo) =>
  transfers.filter((x) => x.email === correo);
// - Crear una función para crear una nueva transferencia
// validando que todos los datos sean ingresados correctamente.

/*
- Una patente válida tiene las siguientes características:
    * AAAA00 => **4 letras y 2 números**.
    * AA0000 => **2 letras y 4 números**.
*/
const licenseRegex = /^([A-Z]{4}\d{2})|([A-Z]{2}\d{4})$/;
const validateLicenceFormat = (licencePlate) => licenseRegex.test(licencePlate);

const getNewId = () => {
  const ids = transfers?.map((x) => x.id);
  const sorted = ids?.sort((a, b) => b - a);
  return sorted[0] + 1;
};

const isAnyTransferPayed = (licensePlate) => {
  const licenceTransfers = transfers?.filter(
    (x) => x.licensePlate === licensePlate
  );
  const payedTransfer = licenceTransfers?.find((x) => x.status === "PAGADA");
  return payedTransfer ? true : false;
};

const findTransfersBy = (email, licensePlate) =>
  transfers?.find((x) => x.licensePlate === licensePlate && x.email === email);
const filterTransfersBy = (email, licensePlate) =>
  transfers?.filter(
    (x) => x.licensePlate === licensePlate && x.email === email
  );

const isAnyTransfer = (email, licensePlate) => {
  const existingTransfers = filterTransfersBy(email, licensePlate);
  if (!existingTransfers || !existingTransfers.length) return false;
  const endedTransfers = existingTransfers?.find(
    (x) => x.status === "FINALIZADA" || x.status === "ABORTADA"
  );
  if (endedTransfers) return false;
  return true;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (email) => emailRegex.test(email);

const getTransfers = (licensePlate) =>
  transfers?.filter((x) => x.licensePlate === licensePlate);

const abortOtherLicenseTransfers = (licensePlate) => {
  const licenseTransfers = transfers?.filter(
    (x) => x.licensePlate === licensePlate
  );
  const payedLicense = licenseTransfers?.find((x) => x.status == "PAGADA");
  if (!payedLicense) throw new Error("No se pueden abortar las transferencias");

  // ver si muta transfers
  licenseTransfers.forEach((x) => {
    if (x.status !== "PAGADA") {
      x.status = "ABORTADA";
    }
  });
};

// Crear una función para pagar una transferencia mediante correo y patente.
const payTransfer = (email, licensePlate) => {
  const existingTransfer = findTransfersBy(email, licensePlate);
  if (!existingTransfer)
    throw new Error("No existen transferencias para los datos indicados");

  // ver si muta
  //   for (let index = 0; index < transfers.length; index++) {
  //     const transfer = transfers[index];
  //     if (transfer.id == existingTransfer.id) {
  //       transfer.status = statuses?.find((x) => x.id === 2).name;
  //       break;
  //     }
  //   }
  existingTransfer.status = statuses?.find((x) => x.id === 2).name;

  /*
    - Si hay múltiples transferencias con misma patente 
    y distinto correo, y una de estas transferencias 
    avanza al estado **'PAGADA'**, entonces todas las otras 
    transferencias cambian al estado **'ABORTADA'**.
*/
  abortOtherLicenseTransfers(licensePlate);

  return existingTransfer;
};

const addTransfer = (payload) => {
  // licencePlate
  // validar patente valida
  if (!validateLicenceFormat(payload?.licensePlate))
    throw new Error("La patente debe tener un formato correcto");

  // si de todas las transferencias, para una patente
  // alguna esta 'PAGADA', no se permite crear mas
  if (isAnyTransferPayed(payload?.licensePlate))
    throw new Error("No se aceptan mas transferencias para la patente");

  // email
  // validar email con formato
  if (!validateEmail(payload?.email))
    throw new Error("El email debe tener un formato correcto");

  // validar existencia de misma patente y correo
  // - si la q existe, esta en estado 'FINALIZADA' o 'ABORTADA'
  // -- se permite crear otra
  if (isAnyTransfer(payload?.email, payload?.licensePlate))
    throw new Error(
      "Ya hay registradas transferencias para el email y patente indicados"
    );

  const transfer = {
    id: getNewId(),
    licensePlate: payload?.licensePlate,
    email: payload?.email,
    status: statuses?.find((x) => x.id === 1).name,
  };
  transfers.push(transfer);
  return transfer;
};

module.exports = {
  statuses,
  transfers,
  getNewId,
  validateEmail,
  validateLicenceFormat,
  addTransfer,
  payTransfer,
  getTransfers,
};
