import * as CryptoJS from 'crypto-js';

export class CryptoExtension {
    public static encrypt(data: string, key: string) {
        let ciphertext = CryptoJS.AES.encrypt(data, key);
        return ciphertext.toString();
    }

    public static decrypt(data: string, key?: string) {
        let _result = CryptoJS.AES.decrypt(data, key);
        return _result.toString(CryptoJS.enc.Utf8);
    }

    public static sha256(pzData: string) {
        return CryptoJS.SHA1(pzData).toString();
    }

    public static stringBase64toArrayBuff(pzData: string): any[] {
        let _data = CryptoJS.enc.Base64.parse(pzData);
        if (_data && _data.words)
            return this.wordToByteArray(_data.words);

        return null
    }

    public static wordToByteArray(wordArray) {
        let byteArray = [], word, i, j;
        for (i = 0; i < wordArray.length; ++i) {
            word = wordArray[i];
            for (j = 3; j >= 0; --j) {
                byteArray.push((word >> 8 * j) & 0xFF);
            }
        }
        return byteArray;
    }
}