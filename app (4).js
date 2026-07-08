/* ===========================================================
   MoodSort — app logic
   Loads MobileNet via ml5.js, classifies every uploaded photo,
   maps each label to a broad category (categorize.js), and
   renders a grouped moodboard.
   =========================================================== */

(function () {
  'use strict';

  const CATEGORY_COLOR_VAR = {
    Nature: '--cat-nature',
    Architecture: '--cat-architecture',
    People: '--cat-people',
    Animals: '--cat-animals',
    Food: '--cat-food',
    Objects: '--cat-objects',
    Other: '--cat-other'
  };

  let classifier = null;

  // -----------------------------------------------------------
  // Toast
  // -----------------------------------------------------------
  const toastEl = document.getElementById('toast');
  let toastTimeout = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  // -----------------------------------------------------------
  // Load model
  // -----------------------------------------------------------
  const modelStatus = document.getElementById('modelStatus');

  async function loadModel() {
    try {
      classifier = await ml5.imageClassifier('MobileNet');
      modelStatus.textContent = '✓ Model loaded — drop in some photos to sort them';
      modelStatus.classList.add('ready');
    } catch (err) {
      modelStatus.textContent = 'Could not load the model. Check your internet connection and reload.';
      console.error('Model load failed:', err);
    }
  }

  // -----------------------------------------------------------
  // Upload handling
  // -----------------------------------------------------------
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFiles(Array.from(e.dataTransfer.files));
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFiles(Array.from(fileInput.files));
  });

  async function handleFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      showToast('Please choose image files');
      return;
    }
    if (!classifier) {
      showToast('The model is still loading — try again in a moment');
      return;
    }

    const progressPanel = document.getElementById('progressPanel');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    progressPanel.hidden = false;
    progressFill.style.width = '0%';

    const buckets = loadBuckets();

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      progressLabel.textContent = `Sorting ${i + 1} of ${imageFiles.length}…`;

      try {
        const img = await fileToImage(file);
        const rawResults = await classifier.classify(img);
        const topLabel = normalizeTopLabel(rawResults);
        const category = categorizeLabel(topLabel);
        const thumb = makeThumbnail(img);

        if (!buckets[category]) buckets[category] = [];
        buckets[category].push({ thumb, label: topLabel });
      } catch (err) {
        console.error('Failed to classify', file.name, err);
      }

      progressFill.style.width = `${((i + 1) / imageFiles.length) * 100}%`;
    }

    saveBuckets(buckets);
    renderBoard(buckets);
    progressPanel.hidden = true;
    fileInput.value = '';
    showToast(`Sorted ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''}`);
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function normalizeTopLabel(raw) {
    if (!Array.isArray(raw) || !raw.length) return 'unknown';
    const top = raw[0];
    const label = top.label || top.className || top.class || 'unknown';
    return String(label).replace(/^n\d+\s+/, '').split(',')[0].trim();
  }

  // -----------------------------------------------------------
  // Thumbnails
  // -----------------------------------------------------------
  const thumbCanvas = document.getElementById('thumbCanvas');
  const thumbCtx = thumbCanvas.getContext('2d');

  function makeThumbnail(img) {
    const size = 240;
    const sw = img.naturalWidth || img.width;
    const sh = img.naturalHeight || img.height;
    const side = Math.min(sw, sh);
    const sx = (sw - side) / 2;
    const sy = (sh - side) / 2;
    thumbCtx.clearRect(0, 0, size, size);
    thumbCtx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return thumbCanvas.toDataURL('image/jpeg', 0.75);
  }

  // -----------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------
  const STORE_KEY = 'moodsort_board_v1';

  function loadBuckets() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveBuckets(buckets) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(buckets));
    } catch (e) {
      console.warn('Could not persist moodboard (storage full):', e.message);
    }
  }

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------
  function renderBoard(buckets) {
    const board = document.getElementById('board');
    const emptyMsg = document.getElementById('boardEmpty');

    const hasAny = Object.values(buckets).some(arr => arr && arr.length);
    if (!hasAny) {
      board.innerHTML = '';
      board.appendChild(emptyMsg);
      return;
    }

    board.innerHTML = '';

    CATEGORY_ORDER.forEach(category => {
      const items = buckets[category];
      if (!items || !items.length) return;

      const group = document.createElement('div');
      group.className = 'category-group';

      const colorVar = CATEGORY_COLOR_VAR[category] || '--cat-other';

      const head = document.createElement('div');
      head.className = 'category-head';
      head.innerHTML = `
        <span class="category-dot" style="background:var(${colorVar})"></span>
        <span class="category-name">${category}</span>
        <span class="category-count">${items.length}</span>
        <span class="category-chevron">▾</span>
      `;
      head.addEventListener('click', () => group.classList.toggle('collapsed'));

      const grid = document.createElement('div');
      grid.className = 'category-grid';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.innerHTML = `
          <img src="${item.thumb}" alt="${escapeHTML(item.label)}">
          <div class="mood-card-overlay">${escapeHTML(item.label)}</div>
        `;
        grid.appendChild(card);
      });

      group.appendChild(head);
      group.appendChild(grid);
      board.appendChild(group);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -----------------------------------------------------------
  // Init
  // -----------------------------------------------------------
  renderBoard(loadBuckets());
  loadModel();

})();
