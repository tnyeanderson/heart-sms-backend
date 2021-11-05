import crypto from 'crypto';

export function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, password_hash) => {
            if (err) {
                reject();
            }

            return resolve(password_hash.toString('hex'));
        });
    });
}