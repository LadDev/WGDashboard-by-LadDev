function gf(init) {
    let r = new Float64Array(16);
    if (init) {
        for (let i = 0; i < init.length; ++i) r[i] = init[i];
    }
    return r;
}
function pack(o, n) {
    let b,
        m = gf(),
        t = gf();
    for (let i = 0; i < 16; ++i) t[i] = n[i];
    carry(t);
    carry(t);
    carry(t);
    for (let j = 0; j < 2; ++j) {
        m[0] = t[0] - 65517;
        for (let i = 1; i < 15; ++i) {
            m[i] = t[i] - 65535 - ((m[i - 1] >> 16) & 1);
            m[i - 1] &= 65535;
        }
        m[15] = t[15] - 32767 - ((m[14] >> 16) & 1);
        b = (m[15] >> 16) & 1;
        m[14] &= 65535;
        cswap(t, m, 1 - b);
    }
    for (let i = 0; i < 16; ++i) {
        o[2 * i] = t[i] & 255;
        o[2 * i + 1] = t[i] >> 8;
    }
}
function carry(o) {
    let c;
    for (let i = 0; i < 16; ++i) {
        o[(i + 1) % 16] += (i < 15 ? 1 : 38) * Math.floor(o[i] / 65536);
        o[i] &= 65535;
    }
}
function cswap(p, q, b) {
    let t,
        c = ~(b - 1);
    for (let i = 0; i < 16; ++i) {
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
    }
}
function add(o, a, b) {
    for (let i = 0; i < 16; ++i) o[i] = (a[i] + b[i]) | 0;
}
function subtract(o, a, b) {
    for (let i = 0; i < 16; ++i) o[i] = (a[i] - b[i]) | 0;
}
function multmod(o, a, b) {
    let t = new Float64Array(31);
    for (let i = 0; i < 16; ++i) {
        for (let j = 0; j < 16; ++j) t[i + j] += a[i] * b[j];
    }
    for (let i = 0; i < 15; ++i) t[i] += 38 * t[i + 16];
    for (let i = 0; i < 16; ++i) o[i] = t[i];
    carry(o);
    carry(o);
}
function invert(o, i) {
    let c = gf();
    for (let a = 0; a < 16; ++a) c[a] = i[a];
    for (let a = 253; a >= 0; --a) {
        multmod(c, c, c);
        if (a !== 2 && a !== 4) multmod(c, c, i);
    }
    for (let a = 0; a < 16; ++a) o[a] = c[a];
}
function clamp(z) {
    z[31] = (z[31] & 127) | 64;
    z[0] &= 248;
}
export function generatePublicKey(privateKey) {
    let r,
        z = new Uint8Array(32);
    let a = gf([1]),
        b = gf([9]),
        c = gf(),
        d = gf([1]),
        e = gf(),
        f = gf(),
        _121665 = gf([56129, 1]),
        _9 = gf([9]);
    for (let i = 0; i < 32; ++i) z[i] = privateKey[i];
    clamp(z);
    for (let i = 254; i >= 0; --i) {
        r = (z[i >>> 3] >>> (i & 7)) & 1;
        cswap(a, b, r);
        cswap(c, d, r);
        add(e, a, c);
        subtract(a, a, c);
        add(c, b, d);
        subtract(b, b, d);
        multmod(d, e, e);
        multmod(f, a, a);
        multmod(a, c, a);
        multmod(c, b, e);
        add(e, a, c);
        subtract(a, a, c);
        multmod(b, a, a);
        subtract(c, d, f);
        multmod(a, c, _121665);
        add(a, a, d);
        multmod(c, c, a);
        multmod(a, d, f);
        multmod(d, b, _9);
        multmod(b, e, e);
        cswap(a, b, r);
        cswap(c, d, r);
    }
    invert(c, c);
    multmod(a, a, c);
    pack(z, a);
    return z;
}
export function generatePresharedKey() {
    let privateKey = new Uint8Array(32);
    window.crypto.getRandomValues(privateKey);
    return privateKey;
}
export function generatePrivateKey() {
    let privateKey = generatePresharedKey();
    clamp(privateKey);
    return privateKey;
}
function encodeBase64(dest, src) {
    let input = Uint8Array.from([(src[0] >> 2) & 63, ((src[0] << 4) | (src[1] >> 4)) & 63, ((src[1] << 2) | (src[2] >> 6)) & 63, src[2] & 63]);
    for (let i = 0; i < 4; ++i) dest[i] = input[i] + 65 + (((25 - input[i]) >> 8) & 6) - (((51 - input[i]) >> 8) & 75) - (((61 - input[i]) >> 8) & 15) + (((62 - input[i]) >> 8) & 3);
}
function keyToBase64(key) {
    let i,
        base64 = new Uint8Array(44);
    for (i = 0; i < 32 / 3; ++i) encodeBase64(base64.subarray(i * 4), key.subarray(i * 3));
    encodeBase64(base64.subarray(i * 4), Uint8Array.from([key[i * 3 + 0], key[i * 3 + 1], 0]));
    base64[43] = 61;
    return String.fromCharCode.apply(null, base64);
}
function base64ToKey(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    let uint8 = new Uint8Array(bytes.buffer);
    return uint8;
}
function putU32(b, n) {
    b.push(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);
}
function putU16(b, n) {
    b.push(n & 255, (n >>> 8) & 255);
}
function putBytes(b, a) {
    for (let i = 0; i < a.length; ++i) b.push(a[i] & 255);
}
function encodeString(s) {
    let utf8 = unescape(encodeURIComponent(s));
    let b = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; ++i) b[i] = utf8.charCodeAt(i);
    return b;
}
function crc32(b) {
    if (!crc32.table) {
        crc32.table = [];
        for (let c = 0, n = 0; n < 256; c = ++n) {
            for (let k = 0; k < 8; ++k) c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
            crc32.table[n] = c;
        }
    }
    let crc = -1;
    for (let i = 0; i < b.length; ++i) crc = (crc >>> 8) ^ crc32.table[(crc ^ b[i]) & 255];
    return (crc ^ -1) >>> 0;
}
function createZipFile(files) {
    let b = [];
    let cd = [];
    let offset = 0;
    for (let i = 0; i < files.length; ++i) {
        let name = encodeString(files[i].filename);
        let contents = encodeString(files[i].content);
        let crc = crc32(contents);
        putU32(b, 67324752);
        putU16(b, 20);
        putU16(b, 0);
        putU16(b, 0);
        putU16(b, 0);
        putU16(b, 0);
        putU32(b, crc);
        putU32(b, contents.length);
        putU32(b, contents.length);
        putU16(b, name.length);
        putU16(b, 0);
        putBytes(b, name);
        putBytes(b, contents);
        putU32(cd, 33639248);
        putU16(cd, 0);
        putU16(cd, 20);
        putU16(cd, 0);
        putU16(cd, 0);
        putU16(cd, 0);
        putU16(cd, 0);
        putU32(cd, crc);
        putU32(cd, contents.length);
        putU32(cd, contents.length);
        putU16(cd, name.length);
        putU16(cd, 0);
        putU16(cd, 0);
        putU16(cd, 0);
        putU16(cd, 0);
        putU32(cd, 32);
        putU32(cd, offset);
        putBytes(cd, name);
        offset += 30 + contents.length + name.length;
    }
    putBytes(b, cd);
    putU32(b, 101010256);
    putU16(b, 0);
    putU16(b, 0);
    putU16(b, files.length);
    putU16(b, files.length);
    putU32(b, cd.length);
    putU32(b, offset);
    putU16(b, 0);
    return Uint8Array.from(b);
}
window.wireguard = {
    generateKeypair: function () {
        let privateKey = generatePrivateKey();
        let publicKey = generatePublicKey(privateKey);
        let presharedKey = generatePresharedKey();
        return { publicKey: keyToBase64(publicKey), privateKey: keyToBase64(privateKey), presharedKey: keyToBase64(presharedKey) };
    },
    generatePublicKey: function (privateKey) {
        privateKey = base64ToKey(privateKey);
        return keyToBase64(generatePublicKey(privateKey));
    },
    generateZipFiles: function (res) {
        let files = res.peers;
        let zipFile = createZipFile(files);
        let blob = new Blob([zipFile], { type: "application/zip" });
        let a = document.createElement("a");
        a.download = res.filename;
        a.href = URL.createObjectURL(blob);
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
};
