import './App.css';
import { useCallback, useState, useRef, useEffect } from 'react';
import { generateEvenParityCodes } from './parity';
import { generateHuffmanCodes, generateShannonFanoCodes } from './generateCodes';
import { drawTree, buildTree } from './binaryTree';

export interface AlphabetSymbol {
  value: string;
  probability: number;
  id: number;
  codeLength: number;
  frequency: number;
  bits: number;
  shannonFanoCode?: string;
  huffmanCode?: string;
}

const defaultSymbols = [
  {
    value: 'a',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 0
  },
  {
    value: 'b',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 1
  },
  {
    value: 'c',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 2
  },
  {
    value: 'd',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 3
  },
  {
    value: 'e',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 4
  },
  {
    value: 'f',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 5
  },
  {
    value: 'g',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 6
  },
  {
    value: 'h',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 7
  },
  {
    value: 'i',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 8
  },
  {
    value: 'j',
    frequency: Math.floor(Math.random() * 99 + 1),
    id: 9
  }
]

const App = () => {
  const [symbols, setSymbols] = useState(defaultSymbols);
  const huffmanCanvasRef = useRef<HTMLCanvasElement>(null);
  const shannonFanoCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSymbolValueChanged = useCallback((id: number, value: string) => {
    setSymbols((symbols) => {
      const newSymbols = symbols.map((s, sid) => {
        return {
          ...s,
          value: sid === id ? value : s.value
        }
      })
      return newSymbols;
    })
  }, []);

  const onSymbolfrequencyChanged = useCallback((id: number, frequency: number) => {
    setSymbols((symbols) => {
      const newSymbols = symbols.map((s, sid) => {
        return {
          ...s,
          frequency: sid === id ? frequency : s.frequency
        }
      })
      return newSymbols;
    })
  }, []);

  const sumFrequencies = symbols.reduce((acc, s) => {
    return acc + s.frequency;
  }, 0)

  const withBitsAndLengths = symbols.map((s) => {
    const probability = s.frequency / sumFrequencies;
    return {
      ...s,
      probability: probability,
      bits: -Math.log2(probability),
      codeLength: Math.ceil(-Math.log2(probability))
    }
  }).sort((a, b) => a.codeLength - b.codeLength)

  const withShannonFanoCodes = generateShannonFanoCodes(withBitsAndLengths);

  const withHuffmanCodes = generateHuffmanCodes(withShannonFanoCodes);

  const averageLetterBits = withBitsAndLengths.reduce((acc, s) => {
    return acc + (s.probability * s.bits)
  }, 0)

  const averageHuffmanCodeLengtth = withHuffmanCodes.reduce((acc, s) => {
    return acc + (s.huffmanCode as string).length * s.probability;
  }, 0);

  const averageShannonFanoCodeLength = withHuffmanCodes.reduce((acc, s) => {
    return acc + (s.shannonFanoCode as string).length * s.probability;
  }, 0);

  const withParity = generateEvenParityCodes(withHuffmanCodes);

  useEffect(() => {
    if (huffmanCanvasRef.current) {
      const tree = buildTree(withHuffmanCodes.map(s => ({...s, code: s.huffmanCode})));
      const context = huffmanCanvasRef.current.getContext('2d');
      drawTree(context!, tree, huffmanCanvasRef.current.width / 2, 50, 50, huffmanCanvasRef.current.width / 4);
    }
  }, [huffmanCanvasRef, withHuffmanCodes])

  useEffect(() => {
    if (shannonFanoCanvasRef.current) {
      const tree = buildTree(withHuffmanCodes.map(s => ({...s, code: s.shannonFanoCode})));
      const context = shannonFanoCanvasRef.current.getContext('2d');
      drawTree(context!, tree, shannonFanoCanvasRef.current.width / 2, 50, 50, shannonFanoCanvasRef.current.width / 4);
    }
  }, [shannonFanoCanvasRef, withHuffmanCodes])

  return (
    <div className="App">
      <div className="Center">
        Pro náhodný výběr pravděpodobností přenačtěte stránku
        <div className="AlphabetInput">
          <div key={"header"} className="AlphabetInput__row AlphabetInput__row_header">
            <div>
              znak
            </div>
            <div>
              četnost
            </div>
            <div>pravděpodobnost</div>
            <div>množství informace</div>
            <div>Shannon-Fanův kód</div>
            <div>Huffmanův kód</div>
            <div>Zabezpečený kód</div>
          </div>
          {
            withParity.map((s) => {
              return <div key={s.id} className="AlphabetInput__row">
                <div>
                  <input onChange={e => onSymbolValueChanged(s.id, e.target.value)} value={s.value}></input>
                </div>
                <div>
                  <input onChange={e => onSymbolfrequencyChanged(s.id, +e.target.value)} type="number" value={Math.floor(s.frequency * 100) / 100}></input>
                </div>
                <div>{Math.floor(10000 * s.probability) / 100}%</div>
                <div>{Math.floor(100 * s.bits) / 100}</div>
                <div>{s.shannonFanoCode}</div>
                <div>{s.huffmanCode}</div>
                {/*@ts-ignore*/}
                <div>{(s.huffmanCodeWithParity)}</div>
              </div>
            })
          }
        </div>
        <div>
          Průměrné množství informace 1 znaku zdrojové abecedy: {Math.floor(100 * averageLetterBits) / 100}
        </div>
        <div>
          Průměrná délka kódového slova Huffmanova kódu: {Math.floor(100 * averageHuffmanCodeLengtth) / 100}
        </div>
        <div>
          Efektivnost Huffmanova kódu: {Math.floor(10000 * (averageLetterBits / averageHuffmanCodeLengtth)) / 100}%
        </div>
        <div>
          Průměrná délka kódového slova Shannon-Fanova kódu: {Math.floor(100 * averageShannonFanoCodeLength) / 100}
        </div>
        <div>
          Efektivnost Shannon-Fanova kódu: {Math.floor(10000 * (averageLetterBits / averageShannonFanoCodeLength)) / 100}%
        </div>
        <b>Binární strom Shannon-Fanova kódu:</b>
        <canvas width={"1000px"} height={"400px"}ref={shannonFanoCanvasRef}></canvas>
        <b>Binární strom Huffmanova kódu:</b>
        <canvas width={"1000px"} height={"400px"}ref={huffmanCanvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;
