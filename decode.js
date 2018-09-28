function basename(str) {
  var base = new String(str).substring(str.lastIndexOf('/') + 1); 
  return base;
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

var decode = async () => {
  var b = B.value;

  var c = b
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  var d = base64ToUint8(c);

  var e = await lzma_decompress(d);
  C.value = e;

  try {
    if (C.onchange) C.onchange();
  } catch (e) {
    console.log(e);
  }
};

B.oninput = decode;

var a = basename(location.href);

var j = a.indexOf('#');
if (j !== -1) {
  a = a.substr(j + 1);
} else {
  invalid();
}

B.value = a;

(async function() {
  try {
    await decode();
  } catch (e) {
    invalid();
  }
}());
