/* ==========================================================================
   TTS CERIA - ENGINE GENERATOR & INTERACTIVE GAME LOGIC (SCRIPT.JS)
   ========================================================================== */

// --- WEB AUDIO API SYNTHESIZER (SOUND EFFECTS) ---
class SoundFx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) { console.error(e); }
  }

  playVictory() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + (idx * 0.12);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) { console.error(e); }
  }
}

const sfx = new SoundFx();

// --- PRESET TEMPLATES DATA ---
const PRESETS = {
  buah: {
    title: "Teka Teki Silang Buah-Buahan",
    words: [
      { word: "PISANG", clue: "Buah berwarna kuning favorit monyet", dir: "auto" },
      { word: "APEL", clue: "Buah bulat berwarna merah manis", dir: "auto" },
      { word: "MANGGA", clue: "Buah berdaging oranye/kuning berkulit hijau", dir: "auto" },
      { word: "DURIAN", clue: "Raja buah yang kulitnya berduri tajam", dir: "auto" },
      { word: "SEMANGKA", clue: "Buah besar manis berbiji dengan banyak air", dir: "auto" },
      { word: "JERUK", clue: "Buah segar kaya Vitamin C bentuk bulat", dir: "auto" },
      { word: "MELON", clue: "Buah bulat hijau manis beraroma harum", dir: "auto" }
    ]
  },
  hewan: {
    title: "Teka Teki Silang Dunia Hewan",
    words: [
      { word: "KUCING", clue: "Hewan peliharaan lucu bersuara meong", dir: "auto" },
      { word: "GAJAH", clue: "Hewan bertubuh besar dengan belalai panjang", dir: "auto" },
      { word: "JERAPAH", clue: "Hewan berkaki tinggi dengan leher sangat panjang", dir: "auto" },
      { word: "SINGA", clue: "Raja hutan yang memiliki surai lebat", dir: "auto" },
      { word: "ZEBRA", clue: "Hewan mirip kuda dengan garis hitam putih", dir: "auto" },
      { word: "KELINCI", clue: "Hewan berelinga panjang penyuka wortel", dir: "auto" },
      { word: "HARIMAU", clue: "Kucing besar pemakan daging bergaris loreng", dir: "auto" }
    ]
  },
  sekolah: {
    title: "Teka Teki Silang Peralatan Sekolah",
    words: [
      { word: "PENSIL", clue: "Alat untuk menulis yang bisa dihapus", dir: "auto" },
      { word: "BUKU", clue: "Kumpulan kertas tempat menulis dan membaca", dir: "auto" },
      { word: "PENGGARIS", clue: "Alat lurus untuk mengukur dan membuat garis", dir: "auto" },
      { word: "PENGHAPUS", clue: "Karet untuk membersihkan tulisan pensil", dir: "auto" },
      { word: "TAS", clue: "Wadah untuk membawa buku dan peralatan ke sekolah", dir: "auto" },
      { word: "SERAGAM", clue: "Pakaian khusus yang wajib dipakai ke sekolah", dir: "auto" },
      { word: "SEPATU", clue: "Alas kaki yang dipakai saat bersekolah", dir: "auto" }
    ]
  },
  "luar-angkasa": {
    title: "Teka Teki Silang Tata Surya",
    words: [
      { word: "MATAHARI", clue: "Bintang raksasa pusat tata surya yang menerangi bumi", dir: "auto" },
      { word: "BUMI", clue: "Planet tempat tinggal manusia, hewan, dan tumbuhan", dir: "auto" },
      { word: "BULAN", clue: "Satelit alami yang mengelilingi bumi di malam hari", dir: "auto" },
      { word: "ROKET", clue: "Kendaraan cepat untuk terbang ke luar angkasa", dir: "auto" },
      { word: "MARS", clue: "Planet merah di sebelah bumi", dir: "auto" },
      { word: "BINTANG", clue: "Benda langit yang bersinar kelap-kelip malam hari", dir: "auto" },
      { word: "ASTRONOT", clue: "Orang yang terbang menjelajahi luar angkasa", dir: "auto" }
    ]
  }
};

// --- CROSSWORD ALGORITHM GENERATOR ---
class CrosswordGenerator {
  constructor() {
    this.reset();
  }

  reset() {
    this.grid = {};
    this.placedWords = [];
    this.acrossClues = [];
    this.downClues = [];
    this.rows = 0;
    this.cols = 0;
  }

  generate(items) {
    this.reset();
    if (!items || items.length === 0) return this.result();

    const cleanItems = items.map((item, idx) => ({
      id: idx + 1,
      word: item.word.toUpperCase().replace(/[^A-Z]/g, ''),
      clue: item.clue,
      dir: item.dir || 'auto'
    })).filter(item => item.word.length > 0);

    if (cleanItems.length === 0) return this.result();

    cleanItems.sort((a, b) => b.word.length - a.word.length);

    const tempGrid = {};
    const placed = [];

    const getCell = (r, c) => tempGrid[`${r},${c}`] || null;
    const setCell = (r, c, letter, wordId) => {
      const key = `${r},${c}`;
      if (!tempGrid[key]) tempGrid[key] = { letter, wordIds: [] };
      tempGrid[key].wordIds.push(wordId);
    };

    const canPlace = (wordStr, startR, startC, isAcross) => {
      const len = wordStr.length;
      const dr = isAcross ? 0 : 1;
      const dc = isAcross ? 1 : 0;

      const preCell = getCell(startR - dr, startC - dc);
      if (preCell) return false;

      const postCell = getCell(startR + dr * len, startC + dc * len);
      if (postCell) return false;

      let intersections = 0;

      for (let i = 0; i < len; i++) {
        const r = startR + dr * i;
        const c = startC + dc * i;
        const char = wordStr[i];
        const existing = getCell(r, c);

        if (existing) {
          if (existing.letter !== char) return false;
          intersections++;
        } else {
          const perpR1 = r + (isAcross ? 1 : 0);
          const perpC1 = c + (isAcross ? 0 : 1);
          const perpR2 = r - (isAcross ? 1 : 0);
          const perpC2 = c - (isAcross ? 0 : 1);
          if (getCell(perpR1, perpC1) || getCell(perpR2, perpC2)) return false;
        }
      }

      return intersections;
    };

    // First word placement
    const first = cleanItems[0];
    const firstDir = (first.dir === 'down') ? false : true;
    for (let i = 0; i < first.word.length; i++) {
      const r = firstDir ? 0 : i;
      const c = firstDir ? i : 0;
      setCell(r, c, first.word[i], first.id);
    }
    placed.push({ ...first, row: 0, col: 0, isAcross: firstDir });

    // Place remaining words
    for (let w = 1; w < cleanItems.length; w++) {
      const item = cleanItems[w];
      let bestPlacement = null;

      const tryDirs = item.dir === 'across' ? [true] : item.dir === 'down' ? [false] : [true, false];

      for (const isAcross of tryDirs) {
        const dr = isAcross ? 0 : 1;
        const dc = isAcross ? 1 : 0;

        for (const p of placed) {
          for (let i = 0; i < item.word.length; i++) {
            const char = item.word[i];

            for (let j = 0; j < p.word.length; j++) {
              if (p.word[j] === char) {
                const overlapR = p.row + (p.isAcross ? 0 : j);
                const overlapC = p.col + (p.isAcross ? j : 0);

                const startR = overlapR - dr * i;
                const startC = overlapC - dc * i;

                const score = canPlace(item.word, startR, startC, isAcross);
                if (score !== false) {
                  if (!bestPlacement || score > bestPlacement.score) {
                    bestPlacement = { startR, startC, isAcross, score };
                  }
                }
              }
            }
          }
        }
      }

      if (bestPlacement) {
        const { startR, startC, isAcross } = bestPlacement;
        const dr = isAcross ? 0 : 1;
        const dc = isAcross ? 1 : 0;
        for (let i = 0; i < item.word.length; i++) {
          setCell(startR + dr * i, startC + dc * i, item.word[i], item.id);
        }
        placed.push({ ...item, row: startR, col: startC, isAcross });
      } else {
        let minR = Infinity, maxR = -Infinity;
        Object.keys(tempGrid).forEach(k => {
          const [r] = k.split(',').map(Number);
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
        });

        const fallbackAcross = item.dir === 'down' ? false : true;
        const fallbackR = maxR + 2;
        const fallbackC = 0;
        for (let i = 0; i < item.word.length; i++) {
          setCell(fallbackR + (fallbackAcross ? 0 : i), fallbackC + (fallbackAcross ? i : 0), item.word[i], item.id);
        }
        placed.push({ ...item, row: fallbackR, col: fallbackC, isAcross: fallbackAcross });
      }
    }

    // Shift Grid
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    Object.keys(tempGrid).forEach(key => {
      const [r, c] = key.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    });

    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;

    placed.forEach(p => {
      p.row -= minR;
      p.col -= minC;
    });

    const finalGrid = {};
    Object.keys(tempGrid).forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const newR = r - minR;
      const newC = c - minC;
      finalGrid[`${newR},${newC}`] = {
        letter: tempGrid[key].letter,
        wordIds: tempGrid[key].wordIds,
        number: null
      };
    });

    // Assign Clue Numbers
    let numberCounter = 1;
    const acrossClues = [];
    const downClues = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = finalGrid[`${r},${c}`];
        if (!cell) continue;

        const acrossWord = placed.find(p => p.isAcross && p.row === r && p.col === c);
        const downWord = placed.find(p => !p.isAcross && p.row === r && p.col === c);

        if (acrossWord || downWord) {
          cell.number = numberCounter;

          if (acrossWord) {
            acrossWord.number = numberCounter;
            acrossClues.push({
              number: numberCounter,
              word: acrossWord.word,
              clue: acrossWord.clue,
              row: acrossWord.row,
              col: acrossWord.col,
              length: acrossWord.word.length
            });
          }

          if (downWord) {
            downWord.number = numberCounter;
            downClues.push({
              number: numberCounter,
              word: downWord.word,
              clue: downWord.clue,
              row: downWord.row,
              col: downWord.col,
              length: downWord.word.length
            });
          }

          numberCounter++;
        }
      }
    }

    this.grid = finalGrid;
    this.rows = rows;
    this.cols = cols;
    this.placedWords = placed;
    this.acrossClues = acrossClues;
    this.downClues = downClues;

    return this.result();
  }

  result() {
    return {
      grid: this.grid,
      rows: this.rows,
      cols: this.cols,
      placedWords: this.placedWords,
      acrossClues: this.acrossClues,
      downClues: this.downClues
    };
  }
}

// Global Application Controller State
const App = {
  currentWords: [],
  engine: new CrosswordGenerator(),
  puzzleResult: null,
  activeTab: 'editor',
  
  // Game state
  timerInterval: null,
  timerSeconds: 0,
  userInputs: {}, // "r,c" => letter
  activeWordObj: null,
  activeCellCoord: null,
  
  init() {
    this.bindEvents();
    this.bindVirtualKeypad();
    this.loadPreset('buah');
  },

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        this.loadPreset(presetKey);
      });
    });

    // Theme Switcher
    document.getElementById('theme-select').addEventListener('change', (e) => {
      document.body.className = e.target.value;
    });

    // Title Sync
    document.getElementById('puzzle-title').addEventListener('input', (e) => {
      const val = e.target.value || "Teka Teki Silang";
      document.getElementById('preview-title-display').textContent = val;
      document.getElementById('play-title').textContent = val;
    });

    // Add Word Form
    document.getElementById('add-word-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddWord();
    });

    // Clear All
    document.getElementById('btn-clear-all').addEventListener('click', () => {
      if (confirm("Apakah Anda yakin ingin menghapus semua kata?")) {
        this.currentWords = [];
        this.updateWordList();
        this.rebuildPuzzle();
      }
    });

    // Randomize Layout
    document.getElementById('btn-generate-random').addEventListener('click', () => {
      this.currentWords.sort(() => Math.random() - 0.5);
      this.updateWordList();
      this.rebuildPuzzle();
    });

    // Play Mode Controls
    document.getElementById('btn-check-answers').addEventListener('click', () => this.checkAnswers());
    document.getElementById('btn-get-hint').addEventListener('click', () => this.giveHint());
    document.getElementById('btn-reveal-all').addEventListener('click', () => this.revealAll());
    document.getElementById('btn-reset-play').addEventListener('click', () => this.resetPlayGrid());
    document.getElementById('btn-close-victory').addEventListener('click', () => {
      document.getElementById('victory-modal').classList.remove('active');
    });
  },

  // BIND VIRTUAL TOUCH KEYPAD FOR MOBILE / TOUCH SCREENS
  bindVirtualKeypad() {
    const keypad = document.getElementById('virtual-keypad');
    if (!keypad) return;

    keypad.addEventListener('click', (e) => {
      const keyBtn = e.target.closest('.key-btn');
      if (!keyBtn) return;

      const keyVal = keyBtn.dataset.key;
      if (!keyVal) return;

      // Handle Keypad Press
      if (!this.activeCellCoord) {
        // Default to first available clue cell if none selected
        if (this.puzzleResult && this.puzzleResult.acrossClues.length > 0) {
          const first = this.puzzleResult.acrossClues[0];
          this.selectClue(first, 'across');
        } else {
          return;
        }
      }

      const { r, c } = this.activeCellCoord;

      if (/^[A-Z]$/.test(keyVal)) {
        // Letter Pressed
        const input = document.querySelector(`.cell-input[data-r="${r}"][data-c="${c}"]`);
        if (input) input.value = keyVal;
        this.userInputs[`${r},${c}`] = keyVal;
        sfx.playPop();
        this.updatePlayProgress();
        this.moveFocusNext(r, c);
      } else if (keyVal === 'BACKSPACE') {
        const input = document.querySelector(`.cell-input[data-r="${r}"][data-c="${c}"]`);
        if (input && input.value) {
          input.value = '';
          delete this.userInputs[`${r},${c}`];
          this.updatePlayProgress();
        } else {
          this.moveFocusPrev(r, c, true);
        }
      } else if (keyVal === 'PREV') {
        this.moveFocusPrev(r, c, false);
      } else if (keyVal === 'NEXT') {
        this.moveFocusNext(r, c);
      }
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-${tabId}`);
    });

    if (tabId === 'play') {
      this.initPlayMode();
    }
  },

  loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    document.getElementById('puzzle-title').value = preset.title;
    document.getElementById('preview-title-display').textContent = preset.title;
    document.getElementById('play-title').textContent = preset.title;

    this.currentWords = preset.words.map(w => ({ ...w }));
    this.updateWordList();
    this.rebuildPuzzle();
  },

  handleAddWord() {
    const wordInput = document.getElementById('input-word');
    const clueInput = document.getElementById('input-clue');
    const dirInput = document.getElementById('input-dir');

    const cleanWord = wordInput.value.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const cleanClue = clueInput.value.trim();

    if (!cleanWord || !cleanClue) {
      alert("Mohon isi kata dan petunjuk dengan benar!");
      return;
    }

    this.currentWords.push({
      word: cleanWord,
      clue: cleanClue,
      dir: dirInput.value
    });

    wordInput.value = '';
    clueInput.value = '';
    wordInput.focus();

    this.updateWordList();
    this.rebuildPuzzle();
  },

  deleteWord(index) {
    this.currentWords.splice(index, 1);
    this.updateWordList();
    this.rebuildPuzzle();
  },

  updateWordList() {
    const listContainer = document.getElementById('word-items-list');
    document.getElementById('word-count').textContent = this.currentWords.length;
    listContainer.innerHTML = '';

    this.currentWords.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'word-item';
      const dirLabel = item.dir === 'across' ? 'Mendatar' : item.dir === 'down' ? 'Menurun' : 'Otomatis';

      li.innerHTML = `
        <div class="word-item-info">
          <span class="word-item-word">${item.word}</span>
          <span class="word-item-clue">${item.clue}</span>
        </div>
        <span class="word-item-dir ${item.dir}">${dirLabel}</span>
        <button class="word-item-delete" onclick="App.deleteWord(${idx})" title="Hapus">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      listContainer.appendChild(li);
    });
  },

  rebuildPuzzle() {
    this.puzzleResult = this.engine.generate(this.currentWords);
    this.renderEditorPreview();
  },

  renderEditorPreview() {
    const { grid, rows, cols, acrossClues, downClues } = this.puzzleResult;
    const gridContainer = document.getElementById('editor-grid-container');
    
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellData = grid[`${r},${c}`];
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell' + (cellData ? '' : ' empty');

        if (cellData) {
          if (cellData.number) {
            const numSpan = document.createElement('span');
            numSpan.className = 'cell-num';
            numSpan.textContent = cellData.number;
            cellDiv.appendChild(numSpan);
          }
          cellDiv.appendChild(document.createTextNode(cellData.letter));
        }
        gridContainer.appendChild(cellDiv);
      }
    }

    const acrossOl = document.getElementById('editor-across-clues');
    const downOl = document.getElementById('editor-down-clues');
    acrossOl.innerHTML = '';
    downOl.innerHTML = '';

    acrossClues.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${c.number}.</strong> ${c.clue}`;
      acrossOl.appendChild(li);
    });

    downClues.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${c.number}.</strong> ${c.clue}`;
      downOl.appendChild(li);
    });
  },

  // --- INTERACTIVE PLAY MODE ---
  initPlayMode() {
    if (!this.puzzleResult || this.puzzleResult.rows === 0) return;

    this.userInputs = {};
    this.activeWordObj = null;
    this.activeCellCoord = null;
    this.startTimer();
    this.renderPlayGrid();
    this.renderPlayClues();
    this.updatePlayProgress();
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerSeconds = 0;
    const timerDisplay = document.getElementById('play-timer');
    timerDisplay.textContent = "00:00";

    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
      const s = String(this.timerSeconds % 60).padStart(2, '0');
      timerDisplay.textContent = `${m}:${s}`;
    }, 1000);
  },

  renderPlayGrid() {
    const { grid, rows, cols } = this.puzzleResult;
    const playGridContainer = document.getElementById('play-grid-container');

    playGridContainer.innerHTML = '';
    playGridContainer.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellData = grid[`${r},${c}`];
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell' + (cellData ? '' : ' empty');
        cellDiv.dataset.r = r;
        cellDiv.dataset.c = c;

        if (cellData) {
          if (cellData.number) {
            const numSpan = document.createElement('span');
            numSpan.className = 'cell-num';
            numSpan.textContent = cellData.number;
            cellDiv.appendChild(numSpan);
          }

          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'cell-input';
          input.dataset.r = r;
          input.dataset.c = c;
          input.value = this.userInputs[`${r},${c}`] || '';
          input.autocomplete = 'off';
          input.setAttribute('inputmode', 'none'); // Prevent mobile native keyboard overlap, rely on virtual keypad

          // Handlers
          input.addEventListener('focus', (e) => {
            this.handleCellFocus(r, c);
            e.target.select();
          });
          input.addEventListener('click', () => this.handleCellClick(r, c));
          input.addEventListener('keydown', (e) => this.handleCellKeyDown(e, r, c));

          cellDiv.appendChild(input);
        }

        playGridContainer.appendChild(cellDiv);
      }
    }
  },

  renderPlayClues() {
    const { acrossClues, downClues } = this.puzzleResult;
    const acrossUl = document.getElementById('play-across-clues');
    const downUl = document.getElementById('play-down-clues');

    acrossUl.innerHTML = '';
    downUl.innerHTML = '';

    acrossClues.forEach(c => {
      const li = document.createElement('li');
      li.id = `clue-across-${c.number}`;
      li.innerHTML = `<strong>${c.number}.</strong> ${c.clue}`;
      li.addEventListener('click', () => this.selectClue(c, 'across'));
      acrossUl.appendChild(li);
    });

    downClues.forEach(c => {
      const li = document.createElement('li');
      li.id = `clue-down-${c.number}`;
      li.innerHTML = `<strong>${c.number}.</strong> ${c.clue}`;
      li.addEventListener('click', () => this.selectClue(c, 'down'));
      downUl.appendChild(li);
    });
  },

  handleCellFocus(r, c) {
    if (!this.activeWordObj || !this.isCellInActiveWord(r, c)) {
      const cellData = this.puzzleResult.grid[`${r},${c}`];
      if (cellData && cellData.wordIds.length > 0) {
        const wordObj = this.findWordObjForCell(r, c, 'across') || this.findWordObjForCell(r, c, 'down');
        if (wordObj) this.selectWord(wordObj);
      }
    }
    this.activeCellCoord = { r, c };
    this.highlightActiveState();
  },

  handleCellClick(r, c) {
    if (this.activeCellCoord && this.activeCellCoord.r === r && this.activeCellCoord.c === c) {
      if (this.activeWordObj) {
        const altDir = this.activeWordObj.dir === 'across' ? 'down' : 'across';
        const altWordObj = this.findWordObjForCell(r, c, altDir);
        if (altWordObj) this.selectWord(altWordObj);
      }
    }
    this.handleCellFocus(r, c);
  },

  handleCellKeyDown(e, r, c) {
    if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const char = e.key.toUpperCase();
      
      e.target.value = char;
      this.userInputs[`${r},${c}`] = char;
      sfx.playPop();
      
      this.updatePlayProgress();
      this.moveFocusNext(r, c);
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.target.value) {
        e.target.value = '';
        delete this.userInputs[`${r},${c}`];
        this.updatePlayProgress();
      } else {
        this.moveFocusPrev(r, c, true);
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      e.target.value = '';
      delete this.userInputs[`${r},${c}`];
      this.updatePlayProgress();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.focusCell(r, c + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.focusCell(r, c - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.focusCell(r + 1, c);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.focusCell(r - 1, c);
    }
  },

  moveFocusNext(r, c) {
    if (!this.activeWordObj) return;
    const isAcross = this.activeWordObj.dir === 'across';
    const nextR = isAcross ? r : r + 1;
    const nextC = isAcross ? c + 1 : c;
    if (this.isCellInActiveWord(nextR, nextC)) {
      this.focusCell(nextR, nextC);
    }
  },

  moveFocusPrev(r, c, clearPrevious = false) {
    if (!this.activeWordObj) return;
    const isAcross = this.activeWordObj.dir === 'across';
    const prevR = isAcross ? r : r - 1;
    const prevC = isAcross ? c - 1 : c;
    if (this.isCellInActiveWord(prevR, prevC)) {
      const prevInput = document.querySelector(`.cell-input[data-r="${prevR}"][data-c="${prevC}"]`);
      if (prevInput) {
        if (clearPrevious) {
          prevInput.value = '';
          delete this.userInputs[`${prevR},${prevC}`];
          this.updatePlayProgress();
        }
        this.focusCell(prevR, prevC);
      }
    }
  },

  focusCell(r, c) {
    const input = document.querySelector(`.cell-input[data-r="${r}"][data-c="${c}"]`);
    if (input) {
      input.focus();
      input.select();
    }
  },

  selectClue(clueObj, dir) {
    const wordObj = {
      ...clueObj,
      dir
    };
    this.selectWord(wordObj);
    this.focusCell(clueObj.row, clueObj.col);
  },

  selectWord(wordObj) {
    this.activeWordObj = wordObj;
    
    document.getElementById('active-clue-num').textContent = wordObj.number;
    document.getElementById('active-clue-dir').textContent = wordObj.dir === 'across' ? 'Mendatar' : 'Menurun';
    document.getElementById('active-clue-text').textContent = wordObj.clue;

    document.querySelectorAll('.interactive-clues-list li').forEach(li => li.classList.remove('active-clue-item'));
    const clueLi = document.getElementById(`clue-${wordObj.dir}-${wordObj.number}`);
    if (clueLi) {
      clueLi.classList.add('active-clue-item');
      clueLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this.highlightActiveState();
  },

  findWordObjForCell(r, c, dir) {
    const isAcross = dir === 'across';
    const cluesList = isAcross ? this.puzzleResult.acrossClues : this.puzzleResult.downClues;
    const found = cluesList.find(w => {
      if (isAcross) {
        return w.row === r && c >= w.col && c < w.col + w.length;
      } else {
        return w.col === c && r >= w.row && r < w.row + w.length;
      }
    });
    return found ? { ...found, dir } : null;
  },

  isCellInActiveWord(r, c) {
    if (!this.activeWordObj) return false;
    const w = this.activeWordObj;
    if (w.dir === 'across') {
      return w.row === r && c >= w.col && c < w.col + w.length;
    } else {
      return w.col === c && r >= w.row && r < w.row + w.length;
    }
  },

  highlightActiveState() {
    document.querySelectorAll('#play-grid-container .cell').forEach(cellDiv => {
      const r = Number(cellDiv.dataset.r);
      const c = Number(cellDiv.dataset.c);

      cellDiv.classList.remove('active-cell', 'active-word');

      if (cellDiv.classList.contains('empty')) return;

      if (this.isCellInActiveWord(r, c)) {
        cellDiv.classList.add('active-word');
      }

      if (this.activeCellCoord && this.activeCellCoord.r === r && this.activeCellCoord.c === c) {
        cellDiv.classList.add('active-cell');
      }
    });
  },

  updatePlayProgress() {
    const totalCells = Object.keys(this.puzzleResult.grid).length;
    const filledCells = Object.keys(this.userInputs).filter(k => this.userInputs[k]).length;
    document.getElementById('play-progress').textContent = `${filledCells}/${totalCells}`;
  },

  checkAnswers() {
    const { grid } = this.puzzleResult;
    let allCorrect = true;
    let filledCount = 0;
    const totalCount = Object.keys(grid).length;

    Object.keys(grid).forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const cellDiv = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      const userVal = this.userInputs[key] || '';
      const actualVal = grid[key].letter;

      cellDiv.classList.remove('correct', 'incorrect');

      if (userVal) {
        filledCount++;
        if (userVal === actualVal) {
          cellDiv.classList.add('correct');
        } else {
          cellDiv.classList.add('incorrect');
          allCorrect = false;
        }
      } else {
        allCorrect = false;
      }
    });

    if (allCorrect && filledCount === totalCount) {
      this.triggerVictory();
    }
  },

  giveHint() {
    if (!this.activeCellCoord) return;
    const { r, c } = this.activeCellCoord;
    const key = `${r},${c}`;
    const cellData = this.puzzleResult.grid[key];

    if (cellData) {
      this.userInputs[key] = cellData.letter;
      const input = document.querySelector(`.cell-input[data-r="${r}"][data-c="${c}"]`);
      if (input) {
        input.value = cellData.letter;
        input.select();
      }
      this.updatePlayProgress();
      this.checkAnswers();
    }
  },

  revealAll() {
    const { grid } = this.puzzleResult;
    Object.keys(grid).forEach(key => {
      const [r, c] = key.split(',').map(Number);
      this.userInputs[key] = grid[key].letter;
      const input = document.querySelector(`.cell-input[data-r="${r}"][data-c="${c}"]`);
      if (input) input.value = grid[key].letter;
    });
    this.updatePlayProgress();
    this.checkAnswers();
  },

  resetPlayGrid() {
    this.userInputs = {};
    document.querySelectorAll('#play-grid-container .cell-input').forEach(i => i.value = '');
    document.querySelectorAll('#play-grid-container .cell').forEach(c => c.classList.remove('correct', 'incorrect'));
    this.updatePlayProgress();
  },

  triggerVictory() {
    sfx.playVictory();

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const timerDisplay = document.getElementById('play-timer').textContent;
    document.getElementById('v-time').textContent = timerDisplay;
    document.getElementById('victory-modal').classList.add('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
