import  bigInt  from 'big-integer';

export function generateRandomBigInt(bits) {
    const min = bigInt(2).pow(bits - 1);
    const max = bigInt(2).pow(bits).minus(1);
    return bigInt.randBetween(min, max);
}


function isProbablePrime(n, k) {
    if (n.isEven()) return false;
    if (n <= 3) return n === 2 || n === 3;

    const s = n.minus(1);
    let d = s;
    let r = 0;

    while (d.isEven()) {
        d = d.divide(2);
        r += 1;
    }

    for (let i = 0; i < k; i++) {
        const a = generateRandomBigInt(2, n.minus(2));
        let x = a.modPow(d, n);

        if (x.equals(1) || x.equals(s)) continue;

        for (let j = 1; j < r; j++) {
            x = x.modPow(2, n);
            if (x.equals(s)) break;
            if (x.isUnit()) return false;
        }

        if (!x.equals(s)) return false;
    }

    return true;
}


export function generatePrime(bits, k) {
    let prime = generateRandomBigInt(bits);

    while (!isProbablePrime(prime, k)) {
        prime = generateRandomBigInt(bits);
    }

    return prime;
}


export const getRSAKeys = (bit) => {
    // log2(n)
    const p = generatePrime(bit, 10)
    console.log('p', p.toString())

    // log2(n)
    const q = generatePrime(bit, 10)
    console.log('q', q.toString())

    const n = p.multiply(q)
    console.log('n', n.toString())

    const phiN = p.minus(1).multiply(q.minus(1))
    console.log('phiN', phiN.toString())

    const e = bigInt(65537)
    console.log('e', e.toString())

    const d = generateD(e, phiN)
    console.log('d', d.toString())

    const multDAndE = d.multiply(e)

    console.log('mod', multDAndE.mod(phiN).toString())

    return {p, q, n, phiN, e, d}
}

function extendedEuclideanAlgorithm(a, b) {
    if (b.equals(0)) {
        return {
            gcd: a,
            x: bigInt(1),
            y: bigInt(0)
        };
    }

    const result = extendedEuclideanAlgorithm(b, a.mod(b));
    const x = result.y;
    const y = result.x.minus(a.divide(b).multiply(result.y));

    return {
        gcd: result.gcd,
        x: x,
        y: y
    };
}

const generateD = (e, phiN) => {
    const { x, y } = extendedEuclideanAlgorithm(phiN, e)
    // console.log('x', x.toString())
    // console.log('y', y.toString())

    return x > 0 ? phiN.minus(y.abs()) : y.abs()
}

const padZeroToUnicodeNumber = (char) => {
    const unicodeNumber = char.charCodeAt(0)

    const paddedZero = (unicodeNumber + '').padStart(4, '0')

    return paddedZero
}


export const encryptRSA = (plainText, e, n) => {
    let charsUnicode = ''

    for (let i = 0; i < plainText.length; i++) {
      charsUnicode += padZeroToUnicodeNumber(plainText[i])
    }   

    const encryptedText = bigInt(charsUnicode).modPow(e, n).toString()

    return encryptedText
};

export const decryptRSA = (encryptedText, d, n) => {
    const unicodeDecryptedText = bigInt(encryptedText).modPow(d, n).toString()

    const insignificantZerosCount = 4 - bigInt(bigInt(unicodeDecryptedText).toString().length).mod(4)

    let paddedUnicodeDecryptedText = unicodeDecryptedText

    for (let i = 0; i < insignificantZerosCount; i++) {
        paddedUnicodeDecryptedText = '0' + paddedUnicodeDecryptedText
    }

    let decryptedText = ''

    for (let i = paddedUnicodeDecryptedText.length - 4; i > -4; i -= 4) {
        decryptedText += String.fromCharCode(paddedUnicodeDecryptedText.slice(i, i + 4))
    }

    return decryptedText.split('').reverse().join('')
}

// const {e, n, d} = getRSAKeys(512)
// const encryptedText =  encryptRSA('text for shipher', e, n)
// console.log('decryptedText', decryptRSA(encryptedText, d, n))