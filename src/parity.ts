import { AlphabetSymbol } from "./App";

const countOnes = (binaryString: string) => {
    return binaryString.split('').filter(bit => bit === '1').length;
}

const addEvenParity = (huffmanCode: string) => {
    const onesCount = countOnes(huffmanCode);
    const parityBit = (onesCount % 2 === 0) ? '0' : '1';
    return huffmanCode + parityBit;
}

export const generateEvenParityCodes = (codes: AlphabetSymbol[]) => {
    return codes.map((c) => ({
        ...c,
        huffmanCodeWithParity: addEvenParity(c.huffmanCode!),
        shannonFanoCodeWithParity: addEvenParity(c.shannonFanoCode!)
    }));
}