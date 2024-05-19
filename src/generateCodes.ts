import { AlphabetSymbol } from "./App";

type HuffmanNode = {
  value: string | null;
  probability: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export const generateShannonFanoCodes = (symbols: AlphabetSymbol[]) => {
  symbols.sort((a, b) => b.probability - a.probability);

  const splitSymbols = (symbols: AlphabetSymbol[], prefix: string = '') => {
    if (symbols.length === 1) {
      symbols[0].shannonFanoCode = prefix;
      return;
    }

    const totalProbability = symbols.reduce((acc, symbol) => acc + symbol.probability, 0);

    let groupProbability = 0;
    let splitIndex = 0;
    for (let i = 0; i < symbols.length; i++) {
      groupProbability += symbols[i].probability;
      if (groupProbability >= totalProbability / 2) {
        splitIndex = i;
        break;
      }
    }

    splitSymbols(symbols.slice(0, splitIndex + 1), prefix + '0');
    splitSymbols(symbols.slice(splitIndex + 1), prefix + '1');
  }

  splitSymbols(symbols);

  return symbols;
}

export const generateHuffmanCodes = (symbols: AlphabetSymbol[]) => {
  const queue: HuffmanNode[] = symbols.map(symbol => ({
    ...symbol
  })).sort((a, b) => a.probability - b.probability);

  while (queue.length > 1) {
    const left = queue.shift()!;
    const right = queue.shift()!;
    const parentNode: HuffmanNode = {
      value: null,
      probability: left.probability + right.probability,
      left,
      right
    };
    queue.push(parentNode);
    queue.sort((a, b) => a.probability - b.probability);
  }

  const huffmanCodes: AlphabetSymbol[] = [];

  function traverse(node: HuffmanNode, code: string) {
    if (node.value !== null) {
      //@ts-ignore
      huffmanCodes.push({ ...node, value: node.value, huffmanCode: code });
      return;
    }
    if (node.left) traverse(node.left, code + '0');
    if (node.right) traverse(node.right, code + '1');
  }

  traverse(queue[0], '');

  return huffmanCodes;
}
