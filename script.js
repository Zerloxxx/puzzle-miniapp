const board = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const resetButton = document.getElementById('reset-button');
const size = 5;
const pieceSize = 100;
let pieces = [];
let currentPuzzle = 1;
let codeShown = false;

const descriptions = {
  1: 'В одном из дворов Нижнего Новгорода появилось граффити, которое объединяет фильм «Жмурки» Алексея Балабанова и мультик «Чип и Дейл». Совместил эти две милые всем детям девяностых картины известный екатеринбургский художник Слава ПТРК.',
  2: 'Громозека — профессор археологии с планеты Чумароза, персонаж серии книг Кира Булычёва об Алисе Селезнёвой, а также советского мультфильма «Тайна третьей планеты»',
  3: 'Здание было построено ещё до Революции 1917 года. Изначально в нём располагалась престижная гостиница для обеспеченных постояльцев с банкетным залом, ванной, бильярдом и конюшней во дворе, а позже его переоборудовали в жилой дом.'
};

function setActivePuzzle(n) {
  currentPuzzle = n;
  init();
}

function init() {
  board.innerHTML = '';
  piecesContainer.innerHTML = '';
  pieces = [];
  codeShown = false;
  document.getElementById('fireworks-container').innerHTML = '';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.left = `${x * pieceSize}px`;
      cell.style.top = `${y * pieceSize}px`;
      board.appendChild(cell);
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.style.backgroundImage = `url('secret${currentPuzzle}.jpg')`;
      piece.style.backgroundPosition = `-${x * pieceSize}px -${y * pieceSize}px`;
      piece.dataset.correctX = x;
      piece.dataset.correctY = y;
      pieces.push(piece);
    }
  }

  shuffleArray(pieces);
  pieces.forEach(piece => {
    piecesContainer.appendChild(piece);
    enableDrag(piece);
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function enableDrag(piece) {
  let offsetX, offsetY;

  piece.addEventListener('mousedown', (e) => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    piece.style.zIndex = 3;
    piece.style.position = 'absolute';
    document.body.appendChild(piece);

    const moveAt = (pageX, pageY) => {
      piece.style.left = pageX - offsetX + 'px';
      piece.style.top = pageY - offsetY + 'px';
    };

    moveAt(e.pageX, e.pageY);

    const onMouseMove = (e) => moveAt(e.pageX, e.pageY);
    const onMouseUp = (e) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const boardRect = board.getBoundingClientRect();
      const relX = e.pageX - boardRect.left;
      const relY = e.pageY - boardRect.top;

      const x = Math.floor(relX / pieceSize);
      const y = Math.floor(relY / pieceSize);

      // Условия допустимого попадания
      const snapTolerance = 40;

const centerX = x * pieceSize + pieceSize / 2;
const centerY = y * pieceSize + pieceSize / 2;

const dist = Math.sqrt(
  Math.pow(e.pageX - (boardRect.left + centerX), 2) +
  Math.pow(e.pageY - (boardRect.top + centerY), 2)
);

const isCloseToCenter = dist <= snapTolerance;

      const occupied = Array.from(board.children).some(el => {
        return (
          el.classList.contains('piece') &&
          parseInt(el.dataset.currentX) === x &&
          parseInt(el.dataset.currentY) === y
        );
      });

      if (x >= 0 && x < size && y >= 0 && y < size && !occupied && isCloseToCenter) {
        piece.style.left = `${x * pieceSize}px`;
        piece.style.top = `${y * pieceSize}px`;
        board.appendChild(piece);
        piece.style.position = 'absolute';
        piece.dataset.currentX = x;
        piece.dataset.currentY = y;
        checkWin();
      } else {
        returnToPool(piece);
      }

      piece.style.zIndex = 2;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function returnToPool(piece) {
  piece.style.position = 'static';
  piece.style.left = 'unset';
  piece.style.top = 'unset';
  piecesContainer.appendChild(piece);
  delete piece.dataset.currentX;
  delete piece.dataset.currentY;
}

function checkWin() {
  const placed = board.querySelectorAll('.piece');
  if (placed.length !== size * size) return;

  let correct = true;
  placed.forEach(p => {
    const cx = p.dataset.currentX;
    const cy = p.dataset.currentY;
    const correctX = p.dataset.correctX;
    const correctY = p.dataset.correctY;

    if (cx === undefined || cy === undefined || cx !== correctX || cy !== correctY) {
      correct = false;
    }
  });

  if (correct && !codeShown) {
    showWinCode();
    codeShown = true;
  }
}

function showWinCode() {
  piecesContainer.innerHTML = `
    <p>${descriptions[currentPuzzle]}</p>
    <p style="margin-top: 20px; font-weight: bold;">Код: NN2025-TOUR</p>
    <button class="copy-button" onclick="navigator.clipboard.writeText('NN2025-TOUR')">Скопировать код</button>
  `;

  launchFireworks();
}

function launchFireworks() {
  const container = document.getElementById('fireworks-container');
  for (let i = 0; i < 50; i++) {
    const f = document.createElement('div');
    f.className = 'firework';
    f.style.left = Math.random() * window.innerWidth + 'px';
    f.style.top = Math.random() * window.innerHeight + 'px';
    f.style.setProperty('--x', (Math.random() - 0.5) * 400 + 'px');
    f.style.setProperty('--y', (Math.random() - 0.5) * 400 + 'px');
    f.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    container.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }
}

resetButton.addEventListener('click', init);
init();
