import './App.css';
import { useCallback, useState, useRef, useEffect } from 'react';
import { generateEvenParityCodes } from './parity';
import { generateHuffmanCodes, generateShannonFanoCodes } from './generateCodes';
import TreeCanvas, { drawTree, buildTree } from './binaryTree';
import { DataGrid, GridColDef, GridToolbarContainer, GridRowsProp, GridRowModesModel, GridRowModes, GridSlots } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import Modal from '@material-ui/core/Modal';
import TextField from '@mui/material/TextField';
import { Card } from '@mui/material';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import ValueDisplay from './ValueDisplay';

interface EditToolbarProps {
  handleAddRowClick: () => void
  handleRemoveRowsClick: () => void
  handleImportClick: () => void
  selectedRowsCount: number
}

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

function EditToolbar(props: EditToolbarProps) {
  const { handleAddRowClick, handleRemoveRowsClick, handleImportClick } = props;

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleAddRowClick}>
        Přidat znak
      </Button>
      <Button color="primary" startIcon={<ImportExportIcon />} onClick={handleImportClick}>
        Importovat z textu
      </Button>
      {props.selectedRowsCount > 0 &&
        <Button color="error" startIcon={<DeleteIcon />} onClick={handleRemoveRowsClick}>
          Odstranit vybrané řádky
        </Button>
      }
    </GridToolbarContainer>
  );
}

const columns: GridColDef[] = [
  { field: 'value', headerName: 'Znak', width: 70 },
  { field: 'frequency', headerName: 'Četnost', width: 80, type: 'number', editable: true },
  { field: 'probability', headerName: 'Pravděpodobnost (%)', width: 150, type: 'number' },
  { field: 'bits', headerName: 'Množství informace', width: 160, type: 'number' },
  { field: 'shannonFanoCode', headerName: 'Shannon-Fanův kód', width: 160, type: 'number' },
  { field: 'huffmanCode', headerName: 'Huffmanův kód', width: 130, type: 'number' },
  { field: 'huffmanCodeWithParity', headerName: 'Zabezpečený kód', width: 160, type: 'number' }
];

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

let lastId = 9;


const App = () => {
  const [symbols, setSymbols] = useState(defaultSymbols);
  const huffmanCanvasRef = useRef<HTMLCanvasElement>(null);
  const shannonFanoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [addedCharacter, setAddedCharacter] = useState('');
  const [addedCharacterFrequency, setAddedCharacterFrequency] = useState(10);
  const [importingFromText, setIsImportingFromText] = useState(false);
  const importedTextRef = useRef('');
  const onRowUpdate = useCallback((row: AlphabetSymbol) => {
    setSymbols((symbols) => {
      const newSymbols = symbols.map((s, sid) => {
        return {
          ...s,
          frequency: sid === row.id ? row.frequency : s.frequency
        }
      })
      return newSymbols;
    })
  }, [])

  const addNewCharacter = useCallback((value: string, frequency: number, id: number) => {
    lastId = lastId + 1;
    setSymbols((symbols) => {
      return [...symbols, { value, frequency, id }]
    })
  }, [])

  const removeSelectedRows = useCallback(() => {
    setSymbols((symbols) => {
      return symbols.filter(s => !selectedRowIds.includes(s.id))
    })
    setSelectedRowIds([]);
  }, [selectedRowIds, setSelectedRowIds])

  const importCharactersFromText = useCallback(() => {
    let frequencies: { [key: string]: number } = {};
    let addedCharacters = [];
    if (importedTextRef.current.length < 1) {
      return;
    }
    for (const c of importedTextRef.current) {
      if (!frequencies[c]) {
        addedCharacters.push(c);
        frequencies[c] = 1;
      } else {
        frequencies[c]++;
      }
    }
    setSymbols([]);
    for (const c of addedCharacters) {
      addNewCharacter(c, frequencies[c], lastId);
    }
  }, [importedTextRef, addNewCharacter])

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
      const tree = buildTree(withHuffmanCodes.map(s => ({ ...s, code: s.huffmanCode })));
      const context = huffmanCanvasRef.current.getContext('2d');
      context?.clearRect(0, 0, huffmanCanvasRef.current.width, huffmanCanvasRef.current.height)
      drawTree(context!, tree, huffmanCanvasRef.current.width / 2, 50, 50, huffmanCanvasRef.current.width / 4);
    }
  }, [huffmanCanvasRef, symbols])

  useEffect(() => {
    if (shannonFanoCanvasRef.current) {
      const tree = buildTree(withHuffmanCodes.map(s => ({ ...s, code: s.shannonFanoCode })));
      const context = shannonFanoCanvasRef.current.getContext('2d');
      context?.clearRect(0, 0, shannonFanoCanvasRef.current.width, shannonFanoCanvasRef.current.height)
      drawTree(context!, tree, shannonFanoCanvasRef.current.width / 2, 50, 50, shannonFanoCanvasRef.current.width / 4);
    }
  }, [shannonFanoCanvasRef, symbols])

  return (
    <div className="App">
      <div className="Center" style={{paddingBottom: '200px'}}>
        <Modal
          open={isAddingRow}
          onClose={() => setIsAddingRow(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Card
            style={{ width: '300px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                label="Znak"
                variant="filled"
                style={{ marginBottom: '10px' }}
                value={addedCharacter}
                onChange={e => setAddedCharacter(e.target.value[0])}
              ></TextField>
              <TextField
                type="number"
                variant="filled"
                label="Četnost"
                onChange={e => setAddedCharacterFrequency(+e.target.value)}
                value={addedCharacterFrequency}
                style={{ marginBottom: '10px' }}
              >
              </TextField>
              <Button
                onClick={() => { addNewCharacter(addedCharacter, addedCharacterFrequency, lastId); setIsAddingRow(false) }}
              >OK</Button>
            </div>
          </Card>
        </Modal>
        <Modal
          open={importingFromText}
          onClose={() => setIsImportingFromText(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Card
            style={{ width: '700px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TextareaAutosize
                style={{ marginBottom: '10px', width: '500px', maxHeight: '300px', height: '300px' }}
                onChange={e => importedTextRef.current = e.target.value}
              ></TextareaAutosize>
              <Button
                onClick={() => { importCharactersFromText(); setIsImportingFromText(false) }}
              >OK</Button>
            </div>
          </Card>
        </Modal>
        <DataGrid
          columns={columns}
          rows={withParity.sort((a, b) => a.id - b.id).map(r => ({ ...r, probability: Math.floor(10000 * r.probability) / 100 }))}
          checkboxSelection
          onRowSelectionModelChange={(e) => setSelectedRowIds(e as number[])}
          slots={{
            toolbar: ((props) => <EditToolbar
              selectedRowsCount={selectedRowIds.length}
              handleAddRowClick={() => setIsAddingRow(true)}
              handleRemoveRowsClick={() => removeSelectedRows()}
              handleImportClick={() => { setIsImportingFromText(true) }}
            />
            ) as GridSlots['toolbar'],
          }}
          processRowUpdate={(v) => { onRowUpdate(v) }}
        />
        <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'space-between', marginBottom: '20px' }}>
          <ValueDisplay
            label={"Průměrné množství informace 1 znaku zdrojové abecedy"}
            value={Math.floor(100 * averageLetterBits) / 100}
          />
          <ValueDisplay
            label={"Průměrná délka kódového slova Huffmanova kódu"}
            value={Math.floor(100 * averageHuffmanCodeLengtth) / 100}
          />
          <ValueDisplay
            label={"Efektivnost Huffmanova kódu"}
            value={(Math.floor(10000 * (averageLetterBits / averageHuffmanCodeLengtth)) / 100) + '%'}
          />
          <ValueDisplay
            label={"Průměrná délka kódového slova Shannon-Fanova kódu"}
            value={(Math.floor(100 * averageShannonFanoCodeLength) / 100)}
          />
          <ValueDisplay
            label={"Efektivnost Shannon-Fanova kódu"}
            value={(Math.floor(10000 * (averageLetterBits / averageShannonFanoCodeLength)) / 100) + '%'}
          />
        </div>
        <p><b>Binární strom Shannon-Fanova kódu:</b></p>
        <TreeCanvas
          inputData={withHuffmanCodes.map(s => ({ ...s, code: s.shannonFanoCode }))}
        />
        <p><b>Binární strom Huffmanova kódu:</b></p>
        <TreeCanvas
          inputData={withHuffmanCodes.map(s => ({ ...s, code: s.huffmanCode }))}
        />
      </div>
    </div>
  );
}

export default App;
