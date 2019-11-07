function build_url() {
  return location.origin + '/api/jose/generate';
}

function build_headers() {
  return new Headers({
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
  });
}

function build_body(id) {
  var fd = new FormData(document.getElementById(id));
  return new URLSearchParams(fd);
}

function build_request() {
  return new Request(build_url(), {
    method: "POST",
    headers: build_headers(),
    body: build_body('jose-input')
  });
}

function handle_response(res) {
  var out = document.getElementById('jose-output');
  var err = document.getElementById('jose-error');

  res.text().then(function(text) {
    if (res.ok) {
      out.innerHTML = text;
      err.innerHTML = '';
      document.getElementById('jose-output').scrollIntoView();
    } else {
      out.innerHTML = '';
      err.innerHTML = 'Error: ' + text;
      document.getElementById('jose-error').scrollIntoView();
    }
  });

  document.getElementById('jose-output').scrollIntoView();
}

function check_payload() {
  var payload = document.getElementById('payload').value;

  // If payload is set.
  if (payload != null && payload != '') {
    return true;
  }

  alert('Input payload.');

  return false;
}

function check_jwk_signing_alg() {
  var jwk = document.getElementById('jwk-signing-alg').value;

  // If JWK for signing is set.
  if (jwk != null && jwk != '') {
    return true;
  }

  // Signing algorithm
  var alg = document.getElementById('signing-alg').selectedIndex;

  // If the signing algorith is 'none'.
  if (alg == 0 /*none*/) {
    return true;
  }

  alert('Input JWK for signing.');

  return false;
}

function generate_jose() {
  if (!check_payload()) {
    return;
  }

  if (!check_jwk_signing_alg()) {
    return;
  }

  // Call '/api/jose/generate' API.
  fetch(build_request()).then(handle_response);
}

function base64url_encode(str) {
  var base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function payload_set(payload) {
  document.getElementById('payload').value = payload;
}

function payload_clear() {
  payload_set('');
}

function open_modal(id) {
  var target = document.getElementById(id);
  document.documentElement.classList.add('is-clipped');
  target.classList.add('is-active');
}

function close_modal(id) {
  var target = document.getElementById(id);
  document.documentElement.classList.remove('is-clipped');
  target.classList.remove('is-active');
}

function payload_request_object() {
  open_modal('modal-payload-request-object');
}

function payload_ciba() {
  open_modal('modal-payload-ciba');
}

function add_entry(data, key, id) {
  var value = document.getElementById(id).value;

  if (value != null && value != '') {
    data[key] = value;
  }
}

function add_entry_datetime(data, key, id) {
  var val = document.getElementById(id).value;

  if (val != null && val != '') {
    data[key] = new Date(val).getTime() / 1000;
  }
}

function convert_to_number(data, key) {
  if (!(key in data)) {
    return;
  }

  var value = data[key];
  data[key] = parseInt(value, 10);
}

function clear_by_id(id) {
  document.getElementById(id).value = '';
}

function modal_payload_request_object_apply() {
  var data = {};

  // 'exp'
  add_entry_datetime(data, 'exp', 'ro-exp');

  // Keys
  var keys = [
    'iss', 'aud', 'scope', 'response_type', 'client_id', 'redirect_uri',
    'state', 'nonce', 'max_age', 'code_challenge'
  ];

  for (let i = 0; i < keys.length; i++) {
    var key = keys[i];
    add_entry(data, key, 'ro-' + key);
  }

  convert_to_number(data, 'max_age');

  // 'code_challenge_method'
  var ccm = document.getElementById('ro-code_challenge_method').value;
  if (ccm != null && ccm != '') {
    data['code_challenge_method'] = ccm;
  }

  // 'claims'
  var claims = document.getElementById('ro-claims').value;
  if (claims != null && claims != '') {
    try {
      var claims_data = JSON.parse(claims);
      data['claims'] = claims_data;
    }
    catch (e) {
      console.log("Failed to parse 'claims'");
    }
  }

  // Arbitrary JSON
  var aj = document.getElementById('ro-arbitrary_json').value;
  if (aj != null && aj != '') {
    try {
      var aj_data = JSON.parse(aj);
      Object.assign(data, aj_data);
    }
    catch (e) {
      console.log("Failed to parse the arbitrary JSON");
    }
  }

  var json = JSON.stringify(data, null, 2);

  payload_set(json);
}

function modal_payload_request_object_close() {
  close_modal('modal-payload-request-object');
}

function modal_payload_request_object_apply_and_close() {
  modal_payload_request_object_apply();
  modal_payload_request_object_close();
}

function modal_payload_ciba_apply() {
  var data = {};

  // 'exp'
  add_entry_datetime(data, 'exp', 'ciba-exp');

  // 'nbf'
  add_entry_datetime(data, 'nbf', 'ciba-nbf');

  // Keys
  var keys = [
    'iss', 'aud', 'scope', 'client_notification_token', 'acr_values',
    'login_hint_token', 'id_token_hint', 'login_hint', 'binding_message',
    'user_code', 'requested_expiry', 'request_context'
  ];

  for (let i = 0; i < keys.length; i++) {
    var key = keys[i];
    add_entry(data, key, 'ciba-' + key);
  }

  convert_to_number(data, 'requested_expiry');

  var json = JSON.stringify(data, null, 2);

  payload_set(json);
}

function modal_payload_ciba_close() {
  close_modal('modal-payload-ciba');
}

function modal_payload_ciba_apply_and_close() {
  modal_payload_ciba_apply();
  modal_payload_ciba_close();
}

function signing_alg_set(index, jwk) {
  document.getElementById('signing-alg').selectedIndex = index;
  document.getElementById('jwk-signing-alg').value = jwk;
}

function signing_alg_clear() {
  signing_alg_set(0 /*none*/, '');
}

function signing_alg_rsa() {
  var jwk =
    '{\n' +
    '  "kty":"RSA",\n' +
    '  "n":"ofgWCuLjybRlzo0tZWJjNiuSfb4p4fAkd_wWJcyQoTbji9k0l8W26mPddxHm' +
           'fHQp-Vaw-4qPCJrcS2mJPMEzP1Pt0Bm4d4QlL-yRT-SFd2lZS-pCgNMsD1W_' +
           'YpRPEwOWvG6b32690r2jZ47soMZo9wGzjb_7OMg0LOL-bSf63kpaSHSXndS5' +
           'z5rexMdbBYUsLA9e-KXBdQOS-UTo7WTBEMa2R2CapHg665xsmtdVMTBQY4uD' +
           'Zlxvb3qCo5ZwKh9kG4LT6_I5IhlJH7aGhyxXFvUK-DWNmoudF8NAco9_h9ia' +
           'GNj8q2ethFkMLs91kzk2PAcDTW9gb54h4FRWyuXpoQ",\n' +
    '  "e":"AQAB",\n' +
    '  "d":"Eq5xpGnNCivDflJsRQBXHx1hdR1k6Ulwe2JZD50LpXyWPEAeP88vLNO97Ijl' +
           'A7_GQ5sLKMgvfTeXZx9SE-7YwVol2NXOoAJe46sui395IW_GO-pWJ1O0BkTG' +
           'oVEn2bKVRUCgu-GjBVaYLU6f3l9kJfFNS3E0QbVdxzubSu3Mkqzjkn439X0M' +
           '_V51gfpRLI9JYanrC4D4qAdGcopV_0ZHHzQlBjudU2QvXt4ehNYTCBr6XCLQ' +
           'UShb1juUO1ZdiYoFaFQT5Tw8bGUl_x_jTj3ccPDVZFD9pIuhLhBOneufuBiB' +
           '4cS98l2SR_RQyGWSeWjnczT0QU91p1DhOVRuOopznQ",\n' +
    '  "p":"4BzEEOtIpmVdVEZNCqS7baC4crd0pqnRH_5IB3jw3bcxGn6QLvnEtfdUdiYr' +
           'qBdss1l58BQ3KhooKeQTa9AB0Hw_Py5PJdTJNPY8cQn7ouZ2KKDcmnPGBY5t' +
           '7yLc1QlQ5xHdwW1VhvKn-nXqhJTBgIPgtldC-KDV5z-y2XDwGUc",\n' +
    '  "q":"uQPEfgmVtjL0Uyyx88GZFF1fOunH3-7cepKmtH4pxhtCoHqpWmT8YAmZxaew' +
           'HgHAjLYsp1ZSe7zFYHj7C6ul7TjeLQeZD_YwD66t62wDmpe_HlB-TnBA-njb' +
           'glfIsRLtXlnDzQkv5dTltRJ11BKBBypeeF6689rjcJIDEz9RWdc",\n' +
    '  "dp":"BwKfV3Akq5_MFZDFZCnW-wzl-CCo83WoZvnLQwCTeDv8uzluRSnm71I3QCL' +
            'dhrqE2e9YkxvuxdBfpT_PI7Yz-FOKnu1R6HsJeDCjn12Sk3vmAktV2zb34M' +
            'Cdy7cpdTh_YVr7tss2u6vneTwrA86rZtu5Mbr1C1XsmvkxHQAdYo0",\n' +
    '  "dq":"h_96-mK1R_7glhsum81dZxjTnYynPbZpHziZjeeHcXYsXaaMwkOlODsWa7I' +
            '9xXDoRwbKgB719rrmI2oKr6N3Do9U0ajaHF-NKJnwgjMd2w9cjz3_-kyNlx' +
            'Ar2v4IKhGNpmM5iIgOS1VZnOZ68m6_pbLBSp3nssTdlqvd0tIiTHU",\n' +
    '  "qi":"IYd7DHOhrWvxkwPQsRM2tOgrjbcrfvtQJipd-DlcxyVuuM9sQLdgjVk2oy2' +
            '6F0EmpScGLq2MowX7fhd_QJQ3ydy5cY7YIBi87w93IKLEdfnbJtoOPLUW0I' +
            'TrJReOgo1cq9SbsxYawBgfp_gh6A5603k2-ZQwVK0JKSHuLFkuQ3U"\n' +
    '}';

  signing_alg_set(4 /*RSA256*/, jwk);
}

function signing_alg_ec() {
  var jwk =
    '{\n' +
    '  "kty":"EC",\n' +
    '  "crv":"P-256",\n' +
    '  "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",\n' +
    '  "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",\n' +
    '  "d":"jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI"\n' +
    '}';

  signing_alg_set(7 /*ES256*/, jwk);
}

function signing_alg_oct(prompt_str) {
  var shared_key = prompt(prompt_str);

  if (shared_key == null || shared_key == '') {
    return;
  }

  var k = base64url_encode(shared_key);

  var jwk =
    '{\n' +
    '  "kty":"oct",\n' +
    '  "k":"' + k + '"\n' +
    '}';

  signing_alg_set(1 /*HS256*/, jwk);
}

function copy_to_clipboard() {
  var output = document.getElementById('jose-output');

  if (output.value == null || output.value == '') {
    return;
  }

  output.select();
  document.execCommand('copy');

  window.getSelection().removeAllRanges();
}