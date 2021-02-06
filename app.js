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


//keyboard
let getKey = (e) => {
  let location = e.location;
  let selector;
  if (location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
      selector = ['[data-key="' + e.keyCode + '-R"]']
  } else {
      let code = e.keyCode || e.which;
      selector = [
          '[data-key="' + code + '"]',
          '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
      ].join(',');
  }
  return document.querySelector(selector);
}

document.body.addEventListener('keydown', (e) => {
  if (e.repeat) { 
    return 
  }
  
  let key = getKey(e);
  if (!key) {
    return console.warn('No key for', e.keyCode);
  }
  key.setAttribute('data-pressed', 'on');
  console.log('keydown:', e);
});

document.body.addEventListener('keyup', (e) => {
  let key = getKey(e);
  key && key.removeAttribute('data-pressed');
  console.log('keyup');
});