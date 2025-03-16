import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const passphrase = 'your-32-byte-passphrase-or-any-string'; // Keep this secure
const key = crypto.createHash('sha256').update(passphrase).digest(); // 256-bit key

// Generate IV using random method or based on passphrase
const generateIv = () => crypto.randomBytes(16);  // Better approach than static IV

// Encrypt function
export const encrypt = (text) => {
    if (!text) {
        throw new Error("The text to encrypt cannot be empty");
    }

    const iv = generateIv(); // IV should be randomly generated for each encryption
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Store the encrypted data along with the IV (hex encoded)
    return iv.toString('hex') + ':' + encrypted.toString('hex');  // Store IV and encrypted text
};

export const decrypt = (encryptedData) => {
    if (!encryptedData) {
        return "";
    }

    try {
        // If the SKU does not contain a colon (:), assume it's not encrypted
        if (!encryptedData.includes(":")) {
            return encryptedData; // Return as-is (already plaintext)
        }

        // Split IV and encrypted text
        const parts = encryptedData.split(":");
        if (parts.length !== 2) {
            throw new Error("Invalid encrypted data format.");
        }

        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = Buffer.from(parts[1], "hex");

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (err) {
        console.error("Decryption failed:", err);
        return "Decryption Error"; // Return a fallback value
    }
};




