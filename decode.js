function basename(str) {
  var base = new String(str).substring(str.lastIndexOf('/') + 1); 
  return base;
}

function Uint8ToBase64(u8Arr) {
  var CHUNK_SIZE = 0x8000;
  var index = 0;
  var length = u8Arr.length;
  var result = '';
  var slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

function base64ToUint8(base64) {
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

function invalid() {
  var div = document.createElement('div');
  div.textContent = 'Invalid URL';
  document.body.replaceChild(div, document.body.firstChild);
}


var B = document.querySelector('#b');
var C = document.querySelector('#c');

var decode = async (e, callee) => {
  if (callee === decode) {
    return;
  }

  var z = B.value;

  var b = basename(z);

  var j = b.indexOf('#');
  if (j !== -1) {
    b = b.substr(j + 1);

    if (b.length > 0) {
      var c = b
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      var d = base64ToUint8(c);

      var e = await lzma_decompress(d);
      C.value = e;

      try {
        var event = new Event('change');
        event.callee = callee || decode;

        C.dispatchEvent(event);
      } catch (ex) {
        console.log(ex);
      } 
    }
  }
};

function updateB(b, e, callee) {
  B.value = location.href.substring(0, location.href.lastIndexOf('/') + 1) + b;

  // var j = b.indexOf('#');
  // if (j !== -1) {
  //   b = b.substr(j + 1);
  // }

  try {
    if (B.onchange) {
      B.onchange(e, callee || reEncode);
    }
  } catch (ex) {
    console.log(ex);
  }
}

var reEncode = async (e, callee) => {
  if (callee === reEncode) {
    return;
  }

  if (C.value === '' || c.value === '\n') {
    updateB('plain', e, callee);

    return;
  }

  var a = await lzma_compress(C.value);

  var b = Uint8ToBase64(a)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  // console.log(b.length)

  // if (b.length > 1024) {
    b = 'plain#' + b;
  // }

  updateB(b, e, callee);
};

B.oninput = decode;
B.onchange = function f(e) {
  var b = B.value;

  var j = b.indexOf('#');
  if (j !== -1) {
    b = b.substr(j + 1);

    location.hash = b;
  } else {
    location.hash = '';
  }
};

C.addEventListener('input', function f({callee}) {
  if (callee === f) {
    console.log('break input');
    return;
  }

  reEncode(null, callee || f);
});

C.addEventListener('change', function f({callee}) {
  if (callee === f) {
    console.log('break decode');
    return;
  }

  reEncode(null, callee || f);
});

var z = location.href;

B.value = z;

(async function() {
  try {
    await decode();
  } catch (ex) {
    invalid();
  }
}());
