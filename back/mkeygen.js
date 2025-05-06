import crypto from 'crypto';

function generateMasterKey(keyLengthBytes) {
  return crypto.randomBytes(keyLengthBytes).toString('hex');
}

const masterKey = generateMasterKey(32); // Generates a 256-bit key
console.log('Master Key:', masterKey);