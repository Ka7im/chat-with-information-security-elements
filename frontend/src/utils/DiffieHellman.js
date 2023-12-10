import  bigInt  from 'big-integer';
import { generatePrime, generateRandomBigInt } from './RSA.js';

function isPrimitiveRoot(g, p) {
    // Проверка условий для примитивного корня
  for (let q of factorize(p.minus(1))) {
      if ((g.modPow(bigInt((p.minus(1)).divide(q)), p)).eq(1)) {
          return false;
      }
  }
  return true;
}

// Функция для разложения числа на простые множители
function factorize(n) {
  const factors = [];
  while (n.isEven()) {
      factors.push(bigInt(2));
      n = n.divide(2);
  }
  for (let i = bigInt(3); i.pow(2).leq(n); i = i.add(2)) {
      while (n.mod(i).eq(0)) {
          factors.push(i);
          n = n.divide(i);
      }
  }
  if (n.gt(2)) {
      factors.push(n);
  }
  return factors;
}

function findPrimitiveRoot(p) {
    // Поиск примитивного корня
    let g = bigInt(2)

    while ( g.lt(p) ) {

      if (isPrimitiveRoot(g, p)) {
          return g;
      }

      g = g.add(1)
    }
    return null;
}

export function diffieHellman() {
  const p = generatePrime(50, 10)
  const g = findPrimitiveRoot(bigInt(p))
  const privateKey = generateRandomBigInt(512)
  const publicKey = getPublicKey(g, privateKey, p)

  return {p, g, privateKey, publicKey}
}

export function getSessionKey (publicKey, privateKey, p) {
  return publicKey.modPow(privateKey, p)
}

export function getPublicKey (g, privateKey, p) {
  return g.modPow(privateKey, p)
}

// const {g, p, publicKey, privateKey} = diffieHellman()

// const privateKeyB = generateRandomBigInt(512)

// const publicKeyB = getPublicKey(g, privateKeyB, p)

// const sessionKeyA = getSessionKey(publicKeyB, privateKey, p)
// const sessionKeyB = getSessionKey(publicKey, privateKeyB, p)

// console.log(sessionKeyA, sessionKeyB)
