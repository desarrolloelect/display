// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
// An implementation of Nordic Semicondutor's UART/Serial Port Emulation over Bluetooth low energy
const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

// Allows the micro:bit to transmit a byte array
const UART_TX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

// Allows a connected client to send a byte array
const UART_RX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

let uBitDevice;
let rxCharacteristic;
let onConnect;
let onDisconnect;
let onError;

export async function connectButtonPressed() {
  try {
    console.log('Requesting Bluetooth Device...');
    uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32' }],
      optionalServices: [UART_SERVICE_UUID],
    });
    uBitDevice.addEventListener('gattserverdisconnected', handleDisconnect);

    console.log('Connecting to GATT Server...');
    const server = await uBitDevice.gatt.connect();

    console.log('Getting Service...');
    const service = await server.getPrimaryService(UART_SERVICE_UUID);

    console.log('Getting Characteristics...');
    const txCharacteristic = await service.getCharacteristic(
      UART_TX_CHARACTERISTIC_UUID
    );
    txCharacteristic.startNotifications();
    txCharacteristic.addEventListener(
      'characteristicvaluechanged',
      onTxCharacteristicValueChanged
    );
    rxCharacteristic = await service.getCharacteristic(
      UART_RX_CHARACTERISTIC_UUID
    );
    onConnect();
  } catch (error) {
    console.log(error);
    onError();
  }
}

export function disconnectButtonPressed() {
  if (!uBitDevice) {
    return;
  }

  if (uBitDevice.gatt.connected) {
    uBitDevice.gatt.disconnect();
    console.log('Disconnected');
  }
}

export async function sendMessage(message) {
  if (!rxCharacteristic) {
    return;
  }

  try {
    let encoder = new TextEncoder();
    rxCharacteristic.writeValue(
      encoder.encode(eliminarDiacriticos(message) + '\n')
    );
  } catch (error) {
    console.log(error);
  }
}

function onTxCharacteristicValueChanged(event) {
  let receivedData = [];
  for (var i = 0; i < event.target.value.byteLength; i++) {
    receivedData[i] = event.target.value.getUint8(i);
  }

  const receivedString = String.fromCharCode.apply(null, receivedData);
  console.log(receivedString);
  if (receivedString === 'S') {
    console.log('Shaken!');
  }
}

function handleDisconnect() {
  onDisconnect();
}

export function setOnDisconnect(onDisconnectionF) {
  onDisconnect = onDisconnectionF;
}

export function setOnConnect(onConnectionF) {
  onConnect = onConnectionF;
}
export function setOnError(onErrorF) {
  onError = onErrorF;
}

function eliminarDiacriticos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
