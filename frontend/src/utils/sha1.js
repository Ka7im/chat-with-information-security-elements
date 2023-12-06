export function sha1(message) {
  function rotateLeft(n, s) {
    return (n << s) | (n >>> (32 - s));
  }

  function toHex(value) {
    let result = '';
    for (let i = 7; i >= 0; i--) {
      result += ((value >> (i * 4)) & 0xF).toString(16);
    }
    return result;
  }

  function preProcessMessage(message) {
    const length = message.length * 8;
    message += String.fromCharCode(0x80);
    
    while ((message.length % 64) !== 56) {
      message += String.fromCharCode(0x00);
    }

    for (let i = 7; i >= 0; i--) {
      message += String.fromCharCode((length >> (i * 8)) & 0xFF);
    }

    return message;
  }

  function sha1Hash(message) {
    const K = [
      0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6
    ];

    message = preProcessMessage(message);

    for (let i = 0; i < message.length; i += 64) {
      const chunk = message.slice(i, i + 64);
      const wordsChunk = [];

      for (let j = 0; j < 16; j++) {
        wordsChunk[j] = (
          (chunk.charCodeAt(j * 4) & 0xFF) << 24 |
          (chunk.charCodeAt(j * 4 + 1) & 0xFF) << 16 |
          (chunk.charCodeAt(j * 4 + 2) & 0xFF) << 8 |
          (chunk.charCodeAt(j * 4 + 3) & 0xFF)
        ) >>> 0;
      }

      for (let j = 16; j < 80; j++) {
        wordsChunk[j] = rotateLeft(
          wordsChunk[j - 3] ^ wordsChunk[j - 8] ^ wordsChunk[j - 14] ^ wordsChunk[j - 16],
          1
        );
      }

      let [A, B, C, D, E] = [H0, H1, H2, H3, H4];

      for (let j = 0; j < 80; j++) {
        let f, k;

        if (j < 20) {
          f = (B & C) | ((~B) & D);
          k = K[0];
        } else if (j < 40) {
          f = B ^ C ^ D;
          k = K[1];
        } else if (j < 60) {
          f = (B & C) | (B & D) | (C & D);
          k = K[2];
        } else {
          f = B ^ C ^ D;
          k = K[3];
        }

        const temp = (rotateLeft(A, 5) + f + E + k + wordsChunk[j]) >>> 0;
        [E, D, C, B, A] = [D, C, rotateLeft(B, 30), A, temp];
      }

      H0 = (H0 + A) >>> 0;
      H1 = (H1 + B) >>> 0;
      H2 = (H2 + C) >>> 0;
      H3 = (H3 + D) >>> 0;
      H4 = (H4 + E) >>> 0;
    }

    return [H0, H1, H2, H3, H4].map(toHex).join('');
  }

  let H0 = 0x67452301;
  let H1 = 0xEFCDAB89;
  let H2 = 0x98BADCFE;
  let H3 = 0x10325476;
  let H4 = 0xC3D2E1F0;

  return sha1Hash(message);
}

// Example usage:
// const message = 'The quick brown fox jumps over the lazy dogy';
// const sha1HashValue = sha1(message);
// console.log(sha1HashValue);
