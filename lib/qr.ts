// Zero-dependency SVG QR Code generator supporting byte mode (versions 1-6, EC level M)

// GF(2^8) tables
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = x;
  GF_EXP[i + 255] = x;
  GF_LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

// RS generator polynomial coefficients for EC codeword count
function rsPoly(ecCount: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

// Compute Reed-Solomon error correction codewords
function rsRemainder(data: Uint8Array, ecCount: number): Uint8Array {
  const poly = rsPoly(ecCount);
  const result = new Uint8Array(data.length + ecCount);
  result.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < poly.length; j++) {
        result[i + j] ^= gfMul(poly[j], coef);
      }
    }
  }
  return result.slice(data.length);
}

// QR Table: [version, totalDataBytesM, ecBytesPerBlockM, numBlocksM]
interface VersionInfo {
  version: number;
  totalData: number;
  ecPerBlock: number;
  blocks: number;
  align: number[];
}

const VERSIONS: VersionInfo[] = [
  { version: 1, totalData: 16, ecPerBlock: 10, blocks: 1, align: [] },
  { version: 2, totalData: 28, ecPerBlock: 16, blocks: 1, align: [6, 18] },
  { version: 3, totalData: 44, ecPerBlock: 26, blocks: 1, align: [6, 22] },
  { version: 4, totalData: 64, ecPerBlock: 18, blocks: 2, align: [6, 26] },
  { version: 5, totalData: 86, ecPerBlock: 24, blocks: 2, align: [6, 30] },
  { version: 6, totalData: 108, ecPerBlock: 16, blocks: 4, align: [6, 34] },
];

export function generateQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const v = VERSIONS.find(info => info.totalData >= bytes.length + 3) || VERSIONS[VERSIONS.length - 1];

  // Encode bitstream: Mode (0100 for Byte) + Char Count + Data + Terminator + Padding
  const bitStream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) bitStream.push((val >> i) & 1);
  }

  // 0100 = 8-bit byte mode
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  // Terminator (up to 4 zeroes)
  const maxBits = v.totalData * 8;
  const termLen = Math.min(4, maxBits - bitStream.length);
  for (let i = 0; i < termLen; i++) bitStream.push(0);

  // Pad to byte boundary
  while (bitStream.length % 8 !== 0) bitStream.push(0);

  // Pad bytes 0xEC, 0x11
  const dataBytes = new Uint8Array(v.totalData);
  let byteIndex = 0;
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bitStream[i + j];
    dataBytes[byteIndex++] = b;
  }
  const pad = [0xec, 0x11];
  let padIdx = 0;
  while (byteIndex < v.totalData) {
    dataBytes[byteIndex++] = pad[padIdx++ % 2];
  }

  // Split into blocks and compute EC
  const blockSize = Math.floor(v.totalData / v.blocks);
  const remainderBlocks = v.totalData % v.blocks;
  const blocksData: Uint8Array[] = [];
  const blocksEc: Uint8Array[] = [];
  let offset = 0;

  for (let b = 0; b < v.blocks; b++) {
    const curSize = blockSize + (b >= v.blocks - remainderBlocks ? 1 : 0);
    const chunk = dataBytes.slice(offset, offset + curSize);
    offset += curSize;
    blocksData.push(chunk);
    blocksEc.push(rsRemainder(chunk, v.ecPerBlock));
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(...blocksData.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of blocksData) {
      if (i < b.length) finalCodewords.push(b[i]);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < v.ecPerBlock; i++) {
    for (const b of blocksEc) {
      if (i < b.length) finalCodewords.push(b[i]);
    }
  }

  // Build Matrix
  const size = 17 + 4 * v.version;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, isFunc = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (isFunc) isFunction[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7) + separator (8x8)
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6) && inOuter;
        const val = inInner || isBorder;
        setModule(nr, nc, val, true);
      }
    }
  }
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment patterns
  if (v.align.length > 0) {
    for (const r of v.align) {
      for (const c of v.align) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const val = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setModule(r + dr, c + dc, val, true);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setModule(6, i, i % 2 === 0, true);
    if (!isFunction[i][6]) setModule(i, 6, i % 2 === 0, true);
  }

  // 4. Dark module
  setModule(4 * v.version + 9, 8, true, true);

  // 5. Reserve format info areas
  for (let i = 0; i <= 8; i++) {
    if (!isFunction[8][i]) isFunction[8][i] = true;
    if (!isFunction[i][8]) isFunction[i][8] = true;
    if (!isFunction[8][size - 1 - i]) isFunction[8][size - 1 - i] = true;
    if (!isFunction[size - 1 - i][8]) isFunction[size - 1 - i][8] = true;
  }

  // 6. Place data bits
  const dataBits: number[] = [];
  for (const byte of finalCodewords) {
    for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1);
  }

  let bitIdx = 0;
  let dir = -1; // upward
  let row = size - 1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing column
    for (let i = 0; i < 2; i++) {
      const c = col - i;
      if (!isFunction[row][c]) {
        const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
        // Mask 0: (row + col) % 2 === 0
        const mask = (row + c) % 2 === 0;
        matrix[row][c] = Boolean(bit ^ (mask ? 1 : 0));
      }
    }
    row += dir;
    if (row < 0 || row >= size) {
      dir = -dir;
      row += dir;
      col -= 2;
    }
  }

  // 7. Format info: EC Level M (00) + Mask 0 (000) = 00000 => 15-bit format with BCH(15,5) XOR 0x5412 = 0x5412
  // Format string for M, Mask 0: 101010000010010
  const formatStr = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) setModule(8, i, formatStr[i] === 1, false);
  setModule(8, 7, formatStr[6] === 1, false);
  setModule(8, 8, formatStr[7] === 1, false);
  setModule(7, 8, formatStr[8] === 1, false);
  for (let i = 9; i < 15; i++) setModule(14 - i, 8, formatStr[i] === 1, false);

  for (let i = 0; i < 8; i++) setModule(size - 1 - i, 8, formatStr[i] === 1, false);
  for (let i = 8; i < 15; i++) setModule(8, size - 15 + i, formatStr[i] === 1, false);

  return matrix.map(r => r.map(cell => Boolean(cell)));
}

export function generateQrSvg(text: string, size = 140, fgColor = 'currentColor', bgColor = 'transparent'): string {
  const matrix = generateQrMatrix(text);
  const n = matrix.length;
  const padding = 2;
  const viewBoxSize = n + padding * 2;

  let pathD = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        pathD += `M${c + padding},${r + padding}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
    ${bgColor !== 'transparent' ? `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bgColor}"/>` : ''}
    <path d="${pathD.trim()}" fill="${fgColor}"/>
  </svg>`;
}
