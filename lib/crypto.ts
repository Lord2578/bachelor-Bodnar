import crypto from 'crypto';

// Secure key and initialization vector (IV)
// In a production environment, these should be stored in environment variables
const SECRET_KEY = 'This-Is-A-Secret-Key-For-3DES-Encryption';
const IV = Buffer.from('01234567', 'utf8');

/**
 * Encrypts a password using Triple DES (3DES) algorithm
 * @param password - The plain text password to encrypt
 * @returns The encrypted password as a hex string
 */
export function encrypt3DES(password: string): string {
  try {
    // Generate a key from the secret key
    const key = crypto.createHash('md5').update(SECRET_KEY).digest();
    // 3DES requires a 24-byte key, so we need to pad it
    const desKey = Buffer.concat([key, key.subarray(0, 8)]);
    
    // Create the cipher
    const cipher = crypto.createCipheriv('des-ede3-cbc', desKey, IV);
    
    // Encrypt the password
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypts a password that was encrypted using Triple DES
 * @param encryptedPassword - The encrypted password as a hex string
 * @returns The decrypted password
 */
export function decrypt3DES(encryptedPassword: string): string {
  try {
    // Generate the same key used for encryption
    const key = crypto.createHash('md5').update(SECRET_KEY).digest();
    const desKey = Buffer.concat([key, key.subarray(0, 8)]);
    
    // Create the decipher
    const decipher = crypto.createDecipheriv('des-ede3-cbc', desKey, IV);
    
    // Decrypt the password
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Verifies if a plain text password matches an encrypted password
 * @param plainPassword - The plain text password to verify
 * @param encryptedPassword - The encrypted password to compare against
 * @returns True if the passwords match, false otherwise
 */
export function verifyPassword(plainPassword: string, encryptedPassword: string): boolean {
  try {
    const decrypted = decrypt3DES(encryptedPassword);
    return plainPassword === decrypted;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
} 