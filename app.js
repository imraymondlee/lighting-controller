let ledCharacteristic = null;

let keyColor = new Map([
  ['Q', '255,20,147'],
  ['W', '255,0,0'],
  ['E', '255,69,0'],
  ['R', '255,255,0'],
  ['A', '135,206,235'],
  ['S', '148,0,211'],
  ['D', '0,0,255'],
  ['F', '0,128,128'],
  ['Z', '0,255,127'],
  ['X', '0,255,0'],
  ['C', '154,205,50'],
  ['V', '102,205,170'],
]);

let bpmColor = '255,255,255';

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

let setColor = (rgb) => {
  let rgbArr = rgb.split(',');
  let red = rgbArr[0];
  let green = rgbArr[1];
  let blue = rgbArr[2];

  let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
  return ledCharacteristic.writeValue(data)
    .catch(err => console.log('Error when writing value! ', err));
}

let blank = () => {
  let data = new Uint8Array([0x56, 0, 0, 0, 0x00, 0xf0, 0xaa]);
  return ledCharacteristic.writeValue(data)
    .catch(err => console.log('Error when writing value! ', err));  
}

let randomColor = () => {
  let red = Math.floor(Math.random() * 256).toString();
  let green = Math.floor(Math.random() * 256).toString();
  let blue = Math.floor(Math.random() * 256).toString();

  setColor(`${red},${green},${blue}`);
}

let timer;
let startBPM = () => {
  let bpm = document.querySelector('#bpm').value;
  let interval = 60000 / bpm;
  timer = setInterval(function(){
    setColor(bpmColor);


    setTimeout(function() {
      blank();
    }, 100);
  }, interval);
}

let stopBPM = () => {
  clearInterval(timer);
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

let getColor = (key) => {
  let color = keyColor.get(key);

  if (color) {
    return color;
  } else {
    return '0,0,0';
  }
}

let styleKeyWithColor = () => {
  for (const [key, color] of keyColor.entries()) {
    document.querySelector(`[data-char="${key}"]`).style.background = `rgb(${color})`;
  }  
}

document.addEventListener("DOMContentLoaded", (e) => {
  styleKeyWithColor();
});

document.addEventListener('keydown', (e) => {
  if(e.repeat) { 
    return 
  }
  
  let key = getKey(e);
  key.setAttribute('data-pressed', 'on');

  if (ledCharacteristic !== null) {
    if (e.key === ' ') {
      randomColor();
    } else {
      let color = getColor(e.key.toUpperCase());
      setColor(color);
    }
  }
});

document.addEventListener('keyup', (e) => {
  let key = getKey(e);
  key && key.removeAttribute('data-pressed');

  if (ledCharacteristic !== null) {
    blank();
  }
});