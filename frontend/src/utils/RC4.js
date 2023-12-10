// function initializeSBox(key) {
//   let S = [];
//   for (let i = 0; i < 256; i++) {
//       S[i] = i;
//   }

//   let j = 0;
//   for (let i = 0; i < 256; i++) {
//       j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
//       [S[i], S[j]] = [S[j], S[i]];
//   }

//   return S;
// }

// function generateKeyStream(S, length) {
//   let i = 0;
//   let j = 0;
//   let keyStream = [];
//   for (let k = 0; k < length; k++) {
//       i = (i + 1) % 256;
//       j = (j + S[i]) % 256;
//       [S[i], S[j]] = [S[j], S[i]];
//       let keyByte = S[(S[i] + S[j]) % 256];
//       keyStream.push(keyByte);
//   }
//   return keyStream;
// }

// export function rc4Encrypt(key, plaintext) {
//   let S = initializeSBox(key);
//   let keyStream = generateKeyStream(S, plaintext.length);

//   let encryptedText = [];
//   for (let k = 0; k < plaintext.length; k++) {
//       encryptedText.push(plaintext.charCodeAt(k) ^ keyStream[k]);
//   }

//   let result = '';
//   encryptedText.forEach(byte => {
//       result += ('0' + byte.toString(16)).slice(-2);
//   });

//   return result;
// }

// export function rc4Decrypt(key, ciphertext) {
//   let S = initializeSBox(key);
//   let keyStream = generateKeyStream(S, ciphertext.length / 2);

//   let encryptedText = [];
//   for (let i = 0; i < ciphertext.length; i += 2) {
//       encryptedText.push(parseInt(ciphertext.substr(i, 2), 16));
//   }

//   let decryptedText = [];
//   for (let k = 0; k < encryptedText.length; k++) {
//       decryptedText.push(encryptedText[k] ^ keyStream[k]);
//   }

//   let result = String.fromCharCode.apply(null, decryptedText);
//   return result;
// }

// // Пример использования
// // let key = "SecretKey";
// // let plaintext = "Hello, RC4!";
// // let ciphertext = rc4Encrypt(key, plaintext);
// // console.log("Зашифрованный текст:", ciphertext);

// // let decryptedText = rc4Decrypt(key, ciphertext);
// // console.log("Расшифрованный текст:", decryptedText);


export function rc4(key, text) {
  // Инициализация S-блока
  let S = [];
  for (let i = 0; i < 256; i++) {
      S[i] = i;
  }

  // Перестановка S-блока на основе ключа
  let j = 0;
  for (let i = 0; i < 256; i++) {
      j = (j + S[i] + key[i % key.length]) % 256;
      [S[i], S[j]] = [S[j], S[i]];
  }

  // Генерация потока ключей и шифрование/расшифрование текста
  let i = 0;
  j = 0; // Объявляем j здесь, чтобы избежать ошибки
  let result = [];

  for (let char of text) {
      i = (i + 1) % 256;
      j = (j + S[i]) % 256;
      [S[i], S[j]] = [S[j], S[i]];
      result.push(String.fromCharCode(char.charCodeAt(0) ^ S[(S[i] + S[j]) % 256]));
  }

  return result.join('');
}

// // Пример использования
// let key = 'SecretKey';  // Ключ (можно изменить)
// let plaintext = "Hello, World! Привет, мир!";  // Исходный текст

// // Шифрование
// let encryptedText = rc4(key, plaintext);
// console.log("Encrypted:", encryptedText);

// // Расшифрование
// let decryptedText = rc4(key, encryptedText);
// console.log("Decrypted:", decryptedText);
