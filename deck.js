// deck.js - デッキ構築およびローカルストレージ管理

const DECK_STORAGE_KEY = 'hattori_club_decks';
const MIN_DECK_SIZE = 30;
const MAX_DECK_SIZE = 60;
const MAX_SAME_CARD = 3;

// データ構造:
// decks = [ { id: string, name: string, cards: [cardId, cardId, ...] }, ... ]

let userDecks = [];
let editingDeckId = null;
let editingDeckCards = []; // [cardId, ...]

function loadDecks() {
    try {
        const data = localStorage.getItem(DECK_STORAGE_KEY);
        if (data) {
            userDecks = JSON.parse(data);
        } else {
            // デフォルトのスターターデッキを1つ用意する
            createDefaultDeck();
        }
    } catch (e) {
        console.error("デッキの読み込みに失敗しました", e);
        userDecks = [];
        createDefaultDeck();
    }
}

function saveDecks() {
    try {
        localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(userDecks));
    } catch (e) {
        console.error("デッキの保存に失敗しました", e);
    }
}

function createDefaultDeck() {
    // 30枚の適当なカードを詰めたデフォルトデッキ
    const starterCards = [];
    const baseCards = ALL_CARDS.filter(c => !c.evolved && c.id !== CARD_ID.DEBUG_DRAW);

    // とりあえず30枚になるまで適当なカードを3枚ずつ入れる
    let count = 0;
    for (const card of baseCards) {
        starterCards.push(card.id);
        starterCards.push(card.id);
        starterCards.push(card.id);
        count += 3;
        if (count >= 30) break;
    }

    userDecks = [{
        id: 'deck_' + Date.now(),
        name: 'スターターデッキ',
        cards: starterCards
    }];
    saveDecks();
}

// ==========================================
// デッキ編集 UI 制御
// ==========================================

function openDeckEditor(deckId = null) {
    document.getElementById('title-screen').style.display = 'none';
    const editorEl = document.getElementById('deck-editor-screen');
    editorEl.style.display = 'flex';

    if (deckId) {
        const deck = userDecks.find(d => d.id === deckId);
        editingDeckId = deck.id;
        editingDeckCards = [...deck.cards];
        document.getElementById('edit-deck-name').value = deck.name;
    } else {
        editingDeckId = null;
        editingDeckCards = [];
        document.getElementById('edit-deck-name').value = '新規デッキ';
    }

    renderCardPool();
    renderEditingDeck();
}

function closeDeckEditor() {
    document.getElementById('deck-editor-screen').style.display = 'none';
    showDeckSelectionOverlay(null); // デッキ選択画面に戻る場合
    // タイトルに戻る場合は別に処理
}

function renderCardPool() {
    const poolContainer = document.getElementById('deck-editor-pool');
    if (!poolContainer) return;
    poolContainer.innerHTML = '';

    // TODO: フィルタリング機能
    const validCards = ALL_CARDS.filter(c => c.id !== CARD_ID.DEBUG_DRAW);

    validCards.forEach(card => {
        const countInDeck = editingDeckCards.filter(id => id === card.id).length;
        const reachedMax = countInDeck >= MAX_SAME_CARD;

        const cardEl = document.createElement('div');
        cardEl.className = `pool-card-item ${reachedMax ? 'max-reached' : ''}`;

        let typeInfo = card.type === CARD_TYPE.MONSTER ? `ATK:${card.atk}` : '魔法';
        if (card.evolved) typeInfo += ' (進化)';

        cardEl.innerHTML = `
            <div class="pool-card-img" style="background-image: url('images/${card.imageFile || 'default.jpg'}');"></div>
            <div class="pool-card-info">
                <div class="pool-card-name">${card.emoji || '🃏'} ${card.name}</div>
                <div class="pool-card-stats">${typeInfo}</div>
            </div>
            <div class="pool-card-count">所持: ${countInDeck}/${MAX_SAME_CARD}</div>
        `;

        // タップで追加
        cardEl.onclick = () => {
            if (countInDeck < MAX_SAME_CARD && editingDeckCards.length < MAX_DECK_SIZE) {
                editingDeckCards.push(card.id);
                renderCardPool();
                renderEditingDeck();
            } else if (editingDeckCards.length >= MAX_DECK_SIZE) {
                alert(`デッキは最大${MAX_DECK_SIZE}枚までです`);
            } else {
                alert(`同名カードは${MAX_SAME_CARD}枚までです`);
            }
        };

        // 右クリック等でプレビュー（スマホなら長押し対応が必要だがここでは一旦クリックのみ）
        poolContainer.appendChild(cardEl);
    });
}

function renderEditingDeck() {
    const listContainer = document.getElementById('deck-editor-list');
    const countLabel = document.getElementById('deck-editor-count');
    if (!listContainer || !countLabel) return;

    listContainer.innerHTML = '';
    countLabel.textContent = `${editingDeckCards.length} / ${MAX_DECK_SIZE} 枚`;

    if (editingDeckCards.length < MIN_DECK_SIZE) {
        countLabel.style.color = '#ff4444';
    } else {
        countLabel.style.color = '#00ff88';
    }

    // ID順等にソートしてグループ化
    const grouped = {};
    editingDeckCards.forEach(id => {
        grouped[id] = (grouped[id] || 0) + 1;
    });

    Object.keys(grouped).forEach(id => {
        const count = grouped[id];
        const card = ALL_CARDS.find(c => c.id === id);
        if (!card) return;

        const item = document.createElement('div');
        item.className = 'deck-list-item';
        item.innerHTML = `
            <span class="dl-name">${card.emoji || '🃏'} ${card.name}</span>
            <span class="dl-count">x${count}</span>
        `;

        // タップで1枚削除
        item.onclick = () => {
            const idx = editingDeckCards.indexOf(card.id);
            if (idx !== -1) {
                editingDeckCards.splice(idx, 1);
                renderCardPool();
                renderEditingDeck();
            }
        };

        listContainer.appendChild(item);
    });
}

function saveEditingDeck() {
    if (editingDeckCards.length < MIN_DECK_SIZE) {
        alert(`デッキは最低${MIN_DECK_SIZE}枚必要です（現在${editingDeckCards.length}枚）`);
        return;
    }

    const nameInput = document.getElementById('edit-deck-name').value.trim() || '名称未設定デッキ';

    if (editingDeckId) {
        const deck = userDecks.find(d => d.id === editingDeckId);
        if (deck) {
            deck.name = nameInput;
            deck.cards = [...editingDeckCards];
        }
    } else {
        userDecks.push({
            id: 'deck_' + Date.now(),
            name: nameInput,
            cards: [...editingDeckCards]
        });
    }

    saveDecks();
    alert('デッキを保存しました！');
    closeDeckEditor();
}

function deleteEditingDeck() {
    if (!editingDeckId) {
        closeDeckEditor();
        return;
    }

    if (userDecks.length <= 1) {
        alert('最後のデッキは削除できません！');
        return;
    }

    if (confirm('このデッキを削除してもよろしいですか？')) {
        userDecks = userDecks.filter(d => d.id !== editingDeckId);
        saveDecks();
        closeDeckEditor();
    }
}

// ==========================================
// デッキ選択オーバーレイ (対戦開始前)
// ==========================================

let _pendingGameStartCb = null;

function showDeckSelectionOverlay(startCb) {
    if (startCb) {
        _pendingGameStartCb = startCb;
    }

    document.getElementById('title-screen').style.display = 'none';
    const overlay = document.getElementById('deck-selection-screen');
    overlay.style.display = 'flex';

    const list = document.getElementById('deck-selection-list');
    list.innerHTML = '';

    loadDecks(); // 最新を取得

    userDecks.forEach(deck => {
        const cardThumbnails = deck.cards.slice(0, 3).map(id => {
            const c = ALL_CARDS.find(card => card.id === id);
            return c ? c.emoji : '🃏';
        }).join('');

        const item = document.createElement('div');
        item.className = 'deck-select-item';
        item.innerHTML = `
            <div class="ds-info">
                <h3>${deck.name}</h3>
                <p>${deck.cards.length}枚 | ${cardThumbnails}...</p>
            </div>
            <div class="ds-actions">
                <button class="btn btn-battle" onclick="selectDeckAndStart('${deck.id}')">使用</button>
                <button class="btn btn-test" onclick="openDeckEditor('${deck.id}')">編集</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function selectDeckAndStart(deckId) {
    const deck = userDecks.find(d => d.id === deckId);
    if (!deck) return;

    if (deck.cards.length < MIN_DECK_SIZE) {
        alert(`このデッキは${MIN_DECK_SIZE}枚未満のため使用できません。`);
        return;
    }

    // gs（グローバルステート）にデッキ情報を持たせるため、game.js側で処理する
    // CPU戦やテストなどのモードに合わせた初期化を行う
    document.getElementById('deck-selection-screen').style.display = 'none';

    // game.js が保持する _pendingGameStartCb を呼び出す
    if (typeof _pendingGameStartCb === 'function') {
        _pendingGameStartCb(deck);
    }
}

function cancelDeckSelection() {
    document.getElementById('deck-selection-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    _pendingGameStartCb = null;
}

// 初期ロード
document.addEventListener('DOMContentLoaded', () => {
    loadDecks();
});
