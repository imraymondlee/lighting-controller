let ledCharacteristic = null;

let connectBulb = () => {
  console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
    {
      filters: [{ services: [0xffe5] }]
    })
    .then(device => {
      console.log('> Found ' + device.name);
      console.log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      console.log('Getting Service 0xffe5 - Light control...');
      return server.getPrimaryService(0xffe5);
    })
    .then(service => {
      console.log('Getting Characteristic 0xffe9 - Light control...');
      return service.getCharacteristic(0xffe9);
    })
    .then(characteristic => {
      console.log('All ready!');
      ledCharacteristic = characteristic;
      console.log(characteristic);
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

let setColor = (red, green, blue) => {
  let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
  return ledCharacteristic.writeValue(data)
    .catch(err => console.log('Error when writing value! ', err));
}

let randomColor = () => {
  setColor(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
}