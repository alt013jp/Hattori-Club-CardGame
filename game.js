// ===========================
// game.js - ゲームロジック（非同期対応版）
// ===========================

// フェイズ定数
const PHASE = {
    DRAW: 'ドローフェイズ',
    MAIN: 'メインフェイズ',
    BATTLE: 'バトルフェイズ',
    END: 'エンドフェイズ'
};

// ゲームモード定数
const MODE = {
    NORMAL: 'normal',
    TEST: 'test',
    CPU: 'cpu'
};

// ===============================
// プレイヤークラス
// ===============================
class Player {
    constructor(name, isHuman = true) {
        this.name = name;
        this.isHuman = isHuman;
        this.lp = 4000;
        this.hand = [];
        this.fieldMonster = [null]; // 1対1: 最大1枚
        this.fieldMagic = [null];   // 1対1: 最大1枚
        this.graveyard = [];
        this.skipNextDraw = false;
        this.delayedEffects = []; // { type: 'damage', amount: 2000, countdown: 2, message: '...' }
    }

    // 実効ATK計算（バフ/デバフ込み）- 個別スロット指定版
    getEffectiveAtk(gameState, slotIndex) {
        if (!this.fieldMonster || !this.fieldMonster[slotIndex]) return 0;
        const monster = this.fieldMonster[slotIndex];
        const base = monster.atk;
        const temp = monster.tempAtkBonus || 0;
        const penalty = monster.tempAtkPenalty || 0;
        const permanent_card = monster.permanentAtkBonus || 0;

        // 永続効果（氷見高校）
        let permanent = 0;
        if (gameState && gameState.permanentEffects) {
            gameState.permanentEffects
                .filter(e => e.id === CARD_ID.HIMI_HIGH)
                .forEach(e => { permanent += e.atkBonus; });
        }

        return Math.max(0, base + temp + permanent + permanent_card - penalty);
    }
}

// ヘルパー：空きスロットを探す
function getFirstEmptySlot(fieldArray) {
    if (!fieldArray) return -1;
    for (let i = 0; i < fieldArray.length; i++) {
        if (fieldArray[i] === null) return i;
    }
    return -1;
}

// ===============================
// ゲーム状態クラス
// ===============================
class GameState {
    constructor(mode = MODE.NORMAL) {
        this.mode = mode;
        this.player1 = new Player('プレイヤー1', true);
        this.player2 = new Player(
            mode === MODE.TEST ? '仮想相手' : (mode === MODE.CPU ? 'CPU (NORMAL)' : 'プレイヤー2'),
            mode !== MODE.TEST && mode !== MODE.CPU
        );
        this.currentPlayer = null;
        this.opponentPlayer = null;
        this.phase = PHASE.DRAW;
        this.turnCount = 1;
        this.logs = [];
        this.diceResult = null;
        this.diceForceMaxOwner = null; // 変更: 誰が確定ダイスを持っているか
        this.permanentEffects = []; // { id, owner, ... }
        this.monsterUsedThisTurn = false;
        this.attackDeclaredThisTurn = false;
        this.gameOver = false;
        this.winner = null;
        this.firstPlayer = null;    // 先攻プレイヤー
        this.isFirstTurn = false;   // 先攻第1ターンのみtrue
    }

    log(msg) {
        const entry = `[T${this.turnCount}] ${msg}`;
        this.logs.push(entry);
        renderLog(entry);
    }

    // 非同期ダイスロール（演出待ち）
    async rollDice() {
        // フルスクリーンのダイスアニメーションを表示
        const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        let result;
        if (this.diceForceMaxOwner && this.diceForceMaxOwner === this.currentPlayer) {
            result = 6;
        } else {
            result = Math.floor(Math.random() * 6) + 1;
        }
        this.diceResult = result;
        const faceChar = faces[result] || result;

        const overlay = document.createElement('div');
        overlay.className = 'central-dice-overlay';

        const cube = document.createElement('div');
        cube.className = 'central-dice-cube';
        cube.textContent = '🎲';

        const resText = document.createElement('div');
        resText.className = 'dice-result-text';
        resText.textContent = `結果: ${result}`;

        overlay.appendChild(cube);
        document.body.appendChild(overlay);

        // 1.5秒間は回転アニメーション、その後に目を確定させて結果の数字も出す
        await new Promise(r => setTimeout(r, 1500));
        cube.textContent = faceChar;
        overlay.appendChild(resText);

        // 回転後さらに1秒ほど結果を表示してから消去
        await new Promise(r => setTimeout(r, 1000));
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

        // 従来の小さなダイス表示も一応更新しておく
        renderDice(result);

        return result;
    }

    drawCard(player) {
        const card = getRandomCard();
        player.hand.push(card);

        // アニメーション再生（自身の場合のみ、または両方）
        if (player === this.currentPlayer || !this._isOnlineHost) {
            this.playDrawAnimation();
        }

        return card;
    }

    playDrawAnimation() {
        const animEl = document.createElement('div');
        animEl.className = 'card card-back draw-anim-card';
        // シンプルな裏面デザイン
        animEl.style.background = 'linear-gradient(135deg, #111, #333)';
        animEl.style.border = '2px solid #555';
        animEl.style.display = 'flex';
        animEl.style.justifyContent = 'center';
        animEl.style.alignItems = 'center';
        animEl.style.color = '#fff';
        animEl.innerHTML = '<span style="font-size:3rem;">🎩</span>';
        document.body.appendChild(animEl);

        // 初期位置（右端中央あたりを想定）
        animEl.style.position = 'fixed';
        animEl.style.top = '30%';
        animEl.style.right = '-20%';
        animEl.style.zIndex = '10000';
        animEl.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        animEl.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(15deg)';
        animEl.style.width = '100px';
        animEl.style.height = '140px';
        animEl.style.borderRadius = '8px';

        // わずかな遅延の後にアニメーション先（画面下部中央）へ移動
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                animEl.style.top = '90%';
                animEl.style.right = '50%';
                animEl.style.transform = 'translate(50%, -50%) scale(0.8) rotate(-10deg)';
                animEl.style.opacity = '0';
            });
        });

        // 終了後にDOM削除
        setTimeout(() => {
            if (animEl.parentElement) animEl.parentElement.removeChild(animEl);
        }, 500);
    }

    drawCardForTurn(player) {
        if (player.skipNextDraw) {
            player.skipNextDraw = false;
            this.log(`【${player.name}】Welcome to Gero!の効果！ドローできない！`);
            return null;
        }
        return this.drawCard(player);
    }

    getOpponent(player) {
        return player === this.player1 ? this.player2 : this.player1;
    }

    resetTempEffects(player) {
        if (player.fieldMonster && player.fieldMonster[0]) {
            const m = player.fieldMonster[0];
            // ヤニくさいジャケットの効果終了処理（1ターン経過後 / またはバトルフェイズ終了後）
            if (m.equipped === CARD_ID.YANI_JACKET) {
                m.equipped = null;
                if (player.fieldMagic && player.fieldMagic[0] && player.fieldMagic[0].id === CARD_ID.YANI_JACKET) {
                    player.graveyard.push(player.fieldMagic[0]);
                    player.fieldMagic[0] = null;
                    gs && gs.log(`【効果終了】VISION ヤニくさいジャケットが破棄されました`);
                }
            }
            m.tempAtkBonus = 0;
            m.tempAtkPenalty = 0;
        }
        // 装備カード以外はターン終了時に破壊される魔法（HATTORI CLUBとか）
        // ただし現状の魔法は即時効果or装備or永続なので、ここでfieldMagicを破壊するのは装備カードまで破壊してしまうリスクがある。
        // cards.js の onPlay 戻り値 dontGraveyard で制御しているため、
        // ここで fieldMagic を消すのは「装備魔法以外がフィールドに残ってしまった場合」の掃除用。
        // 基本的には useMagicCard で墓地に行っているはず。

        // 基本的には useMagicCard で墓地に行っているはず。

        this.diceForceMaxOwner = null;
        this.monsterUsedThisTurn = false;
        this.attackDeclaredThisTurn = false;
    }

    checkGameOver() {
        if (this.mode === MODE.TEST) return false;
        if (this.player1.lp <= 0) {
            this.gameOver = true;
            this.winner = this.player2;
            return true;
        }
        if (this.player2.lp <= 0) {
            this.gameOver = true;
            this.winner = this.player1;
            return true;
        }
        return false;
    }
}

// ===============================
// グローバル変数
// ===============================
let gs = null;
let pendingSwitchCallback = null;
let _lastGuestCpIdx = -1; // ゲスト用のターン進行トラッキング
let _awaitingAttackTargetIdx = -1; // 攻撃対象選択中の自分のモンスロット(-1で非アクティブ)

// ===============================
// タイトル画面から呼ばれる初期化関数
// ===============================
function startNormalGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('gameover-overlay').style.display = 'none';
    clearLog();
    updateLayoutDirection(true); // P1を手前(下)に
    initGame(MODE.NORMAL);
}

function startTestGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('gameover-overlay').style.display = 'none';
    clearLog();
    updateLayoutDirection(true); // P1を手前(下)に
    initGame(MODE.TEST);
}

function startCPUGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('gameover-overlay').style.display = 'none';
    clearLog();
    // CPU戦はプレイヤーがP1、CPUがP2
    updateLayoutDirection(true);
    initGame(MODE.CPU);
}

function goToTitle() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('gameover-overlay').style.display = 'none';
    document.getElementById('player-switch-overlay').style.display = 'none';
    document.getElementById('turn-overlay').style.display = 'none';
    // 特殊勝利オーバーレイがあれば消す
    const winOverlay = document.querySelector('.win-effect-overlay');
    if (winOverlay) winOverlay.remove();

    document.getElementById('title-screen').style.display = 'flex';
    clearLog();
    gs = null;
}

function clearLog() {
    const logEl = document.getElementById('log-container');
    if (logEl) logEl.innerHTML = '';
}

// ===============================
// ゲーム初期化
// ===============================
function initGame(mode) {
    gs = new GameState(mode);

    // 先攻後攻ランダム決定
    const first = Math.random() < 0.5;
    gs.currentPlayer = first ? gs.player1 : gs.player2;
    gs.opponentPlayer = first ? gs.player2 : gs.player1;

    // 初期手札5枚
    for (let i = 0; i < 5; i++) {
        gs.drawCard(gs.player1);
        gs.drawCard(gs.player2);
    }

    gs.log(`ゲーム開始！[${mode === MODE.TEST ? '🧪テストモード' : '⚔️通常対戦'}]`);
    gs.log(`先攻：${gs.currentPlayer.name}`);

    // 先攻プレイヤーを記録（第1ターン攻撃禁止用）
    gs.firstPlayer = gs.currentPlayer;
    gs.isFirstTurn = true;

    renderAll();
    startTurn();
}

// ===============================
// プレイヤー切替オーバーレイ
// ===============================
function showPlayerSwitch(playerName, callback) {
    const msg = document.getElementById('switch-msg');
    if (msg) msg.textContent = `${playerName} のターンです`;
    document.getElementById('player-switch-overlay').style.display = 'flex';
    pendingSwitchCallback = callback;
}

function dismissPlayerSwitch() {
    document.getElementById('player-switch-overlay').style.display = 'none';
    if (pendingSwitchCallback) {
        const fn = pendingSwitchCallback;
        pendingSwitchCallback = null;
        fn();
    }
}

// ===============================
// ターン開始 (Async)
// ===============================
async function startTurn() {
    if (!gs || gs.gameOver) {
        if (gs && gs.gameOver) renderGameOver();
        return;
    }

    gs.phase = PHASE.DRAW;
    gs.monsterUsedThisTurn = false;
    gs.attackDeclaredThisTurn = false;

    // テストモード：P2 のターンは即スキップ
    if (gs.mode === MODE.TEST && gs.currentPlayer === gs.player2) {
        gs.log('--- 仮想相手ターンをスキップ ---');
        const prev = gs.currentPlayer;
        gs.currentPlayer = gs.opponentPlayer;
        gs.opponentPlayer = prev;
        gs.turnCount++;
        // 再帰でP1のターンへ（P1でdoStartTurnが呼ばれる）
        startTurn();
        return;
    }

    // 通常対戦モード：ターン2以降でプレイヤー切替画面（オンラインホスト時はスキップ）
    if (gs.mode === MODE.NORMAL && gs.turnCount > 1 && !gs._isOnlineHost) {
        renderAll();
        showPlayerSwitch(gs.currentPlayer.name, doStartTurn);
        return;
    }

    doStartTurn();
}

async function doStartTurn() {
    if (!gs) return;
    gs.phase = PHASE.DRAW;
    renderPhase(gs.phase);
    gs.log(`--- ${gs.currentPlayer.name} のターン開始（T${gs.turnCount}） ---`);

    // ターン開始インジケータの表示
    let msg = "";
    if (gs.mode === MODE.NORMAL) {
        if (gs._isOnlineHost) {
            msg = (gs.currentPlayer === gs.player1) ? "あなたのターン" : "相手のターン";
        } else {
            msg = `${gs.currentPlayer.name} のターン`;
        }
    } else {
        msg = (gs.currentPlayer === gs.player1) ? "あなたのターン" : "仮想相手のターン";
    }
    showTurnIndicator(msg);

    // バチイケになった俺の反動 (nextTurnAtkDown)
    if (gs.currentPlayer.fieldMonster && gs.currentPlayer.fieldMonster.nextTurnAtkDown) {
        const penalty = gs.currentPlayer.fieldMonster.nextTurnAtkDown;
        gs.currentPlayer.fieldMonster.tempAtkBonus = (gs.currentPlayer.fieldMonster.tempAtkBonus || 0) - penalty;
        gs.currentPlayer.fieldMonster.nextTurnAtkDown = 0;
        gs.log(`【${gs.currentPlayer.name}】バチイケになった俺の反動… ATK-${penalty}`);
    }

    // 遅延エフェクト処理 (盗撮された立ちション等)
    if (gs.currentPlayer.delayedEffects && gs.currentPlayer.delayedEffects.length > 0) {
        for (let i = gs.currentPlayer.delayedEffects.length - 1; i >= 0; i--) {
            const eff = gs.currentPlayer.delayedEffects[i];
            eff.countdown--;
            if (eff.countdown <= 0) {
                if (eff.type === 'damage') {
                    gs.currentPlayer.lp -= eff.amount;
                    if (gs.currentPlayer.lp < 0) gs.currentPlayer.lp = 0;
                    gs.log(`【遅延ダメージ】${eff.message || ''} ${eff.amount}ダメージ！(LP:${gs.currentPlayer.lp})`);
                }
                gs.currentPlayer.delayedEffects.splice(i, 1);
            }
        }
    }

    // 時限自壊 (lifespan) - 高森(メディア)用
    if (gs.currentPlayer.fieldMonster && typeof gs.currentPlayer.fieldMonster.lifespan === 'number') {
        gs.currentPlayer.fieldMonster.lifespan--;
        if (gs.currentPlayer.fieldMonster.lifespan <= 0) {
            gs.log(`【${gs.currentPlayer.name}】${gs.currentPlayer.fieldMonster.name}の寿命が尽きた…`);
            destroyMonster(gs.currentPlayer);
        }
    }

    // ドローフェイズ（skipNextDraw対応）
    const drawn = gs.drawCardForTurn(gs.currentPlayer);
    if (drawn) gs.log(`${gs.currentPlayer.name} がカードを1枚ドローしました`);
    else if (!gs.currentPlayer.skipNextDraw) gs.log(`ドローフェイズ：ドローデッキが空！`);

    // メインフェイズへ
    gs.phase = PHASE.MAIN;
    renderPhase(gs.phase);
    renderAll();

    // CPUのターンの場合、自動処理を開始
    if (gs.mode === MODE.CPU && !gs.currentPlayer.isHuman) {
        if (typeof processCPUTurn === 'function') {
            processCPUTurn(gs);
        }
    }
}

// ===============================
// ターン終了 (Async)
// ===============================
async function endTurn(isAuto = false) {
    if (!gs || gs.gameOver) return;
    if (!isAuto && gs.mode === MODE.CPU && !gs.currentPlayer.isHuman) return;

    // コルティレの持続終了（自分のエンドフェイズ時に、自分のフラグを解除。もし持続が「相手のエンドフェイズまで」なら、相手のフラグを解除する）
    // 要望: 「相手のエンドフェイズまで効果が持続」→ つまり相手がターンを終了する時に解除
    const opp = gs.getOpponent(gs.currentPlayer);
    if (opp.cortileActive) {
        opp.cortileActive = false;
        gs.log(`【${opp.name}】着払いの名所 コルティレの効果が終了しました。`);
    }

    gs.phase = PHASE.END;
    renderPhase(gs.phase);
    gs.log(`${gs.currentPlayer.name} のターン終了`);

    // 先攻第1ターン終了時にフラグをリセット
    if (gs.isFirstTurn && gs.currentPlayer === gs.firstPlayer) {
        gs.isFirstTurn = false;
    }

    // 一時効果リセット（現在プレイヤーのフィールドのみ）
    gs.resetTempEffects(gs.currentPlayer);

    // 相手フィールドのターン系デバフもリセット
    if (gs.opponentPlayer.fieldMonster && gs.opponentPlayer.fieldMonster[0]) {
        gs.opponentPlayer.fieldMonster[0].tempAtkPenalty = 0;
        // 柳の手汗など、効果無効化のリセット
        gs.opponentPlayer.fieldMonster[0].effectNegated = false;
    }

    // 次のプレイヤーへ
    const prev = gs.currentPlayer;
    gs.currentPlayer = gs.opponentPlayer;
    gs.opponentPlayer = prev;
    gs.turnCount++;

    // CPUモードやNORMAL/TESTモードはそのまま進行
    renderAll();
    startTurn();
}

// ===============================
// カード使用処理 (Async)
// ===============================
async function useCard(cardIndex, isAuto = false) {
    if (!gs || gs.gameOver) return;
    if (!isAuto && gs.mode === MODE.CPU && !gs.currentPlayer.isHuman) return;
    if (gs._isOnlineHost && gs.currentPlayer !== gs.player1) return;
    if (gs.phase !== PHASE.MAIN) {
        gs.log('⚠ メインフェイズ以外はカードを使用できません');
        return;
    }

    const player = gs.currentPlayer;
    const card = player.hand[cardIndex];
    if (!card) return;

    // モンスターは1ターン1枚まで
    if (card.type === CARD_TYPE.MONSTER && gs.monsterUsedThisTurn) {
        gs.log('⚠ このターンはすでにモンスターカードを使用しました（1ターン1枚まで）');
        return;
    }

    // 使用条件チェック
    if (!card.canUse(gs, player)) {
        gs.log(`⚠ ${card.name} は使用条件を満たしていません`);
        return;
    }

    // 手札から除く
    player.hand.splice(cardIndex, 1);

    if (card.type === CARD_TYPE.MONSTER) {
        // MONSTER：空き枠を探す。空きがなければ（1枠ルールの場合は）既存のものを破壊して上書き召喚
        let slotIdx = getFirstEmptySlot(player.fieldMonster);
        if (slotIdx === -1) {
            // スロットが全て埋まっている場合（通常は1枠なのでインデックス0）
            slotIdx = 0;
            gs.log(`【退場】${player.name} の ${player.fieldMonster[slotIdx].name} が墓地へ送られ、新たなモンスターが召喚されます`);
            destroyMonster(player, slotIdx);
        }
        await useMonsterCard(card, player, slotIdx);
        gs.monsterUsedThisTurn = true; // モンスターはこのターン使用済み
    } else if (card.type === CARD_TYPE.MAGIC) {
        // MAGIC：空き枠を探す
        const slotIdx = getFirstEmptySlot(player.fieldMagic);
        if (slotIdx === -1) {
            gs.log('⚠ フィールド(魔法)に空きがありません！');
            player.hand.splice(cardIndex, 0, card); // 手札に戻す
            return;
        }
        await useMagicCard(card, player, slotIdx);
        // 魔法は何枚でも使用可能（フラグを立てない）
    }

    renderAll();

    if (gs.checkGameOver()) {
        renderGameOver();
    }
}

async function useMonsterCard(card, player, slotIdx) {
    // 上位進化のコスト処理
    if (card.evolved && card.costCardId) {
        const handIdx = player.hand.findIndex(c => c.id === card.costCardId);
        if (handIdx !== -1) {
            // 手札を使用
            const cost = player.hand.splice(handIdx, 1)[0];
            player.graveyard.push(cost);
            gs.log(`手札の${cost.name}を捨てて進化！`);
        } else {
            // フィールドを使用
            const fieldIdx = player.fieldMonster.findIndex(c => c && c.id === card.costCardId);
            if (fieldIdx !== -1) {
                gs.log(`フィールドの${player.fieldMonster[fieldIdx].name}を進化！`);
                player.graveyard.push(player.fieldMonster[fieldIdx]);
                player.fieldMonster[fieldIdx] = null;
            }
        }
    }

    player.fieldMonster[slotIdx] = card;
    card.tempAtkBonus = 0;
    card.tempAtkPenalty = 0;

    gs.log(`【召喚】${player.name} が「${card.name}」を召喚しました！`);

    // 上出 瑠星の相手フィールド効果
    const opponent = gs.getOpponent(player);
    if ((card.id === CARD_ID.HORIE || card.id === CARD_ID.JOSOU_HORIE) &&
        opponent.fieldMonster.some(m => m && (m.id === CARD_ID.KAMIDE || m.id === CARD_ID.AI_KAMIDE))) {
        gs.drawCard(opponent);
        gs.log(`【${opponent.name}】上出 瑠星の効果！堀江 俊郎召喚に反応で1枚ドローしました`);
    }

    // onPlay（コスト処理・効果発動） ※現状のonPlayの仕様は引数2つだが後ほどスロット対応等が必要になる場合あり
    if (card.onPlay) await card.onPlay(gs, player);

    // エフェクト
    if (card.evolved) {
        triggerEvolvedEffect();
    } else {
        triggerMonsterLandEffect();
    }
}

async function useMagicCard(card, player, slotIdx) {
    player.fieldMagic[slotIdx] = card;
    gs.log(`【発動】${player.name} が「${card.name}」を使用しました！`);

    // 発動した魔法カードを盤面に表示して一時待機（視覚化）
    renderAll();
    await new Promise(resolve => setTimeout(resolve, 800));

    // 非同期onPlay対応
    const result = card.onPlay ? await card.onPlay(gs, player) : null;

    // キモ草大ハットリ会卍特殊勝利
    if (result && result.win) {
        triggerWinEffect(player);
        gs.gameOver = true;
        gs.winner = player;
        renderGameOver();
        return;
    }

    // 墓地選択 UI or CPU Auto Select
    if (result && result.needsGraveyardSelect) {
        if (!player.isHuman && player.graveyard.length > 0) {
            // CPUの場合は自動で先頭のカード（またはランダム）を選択して回収/召喚
            const selected = player.graveyard.splice(0, 1)[0];
            if (result.specialSummon) {
                const emptySlot = player.fieldMonster.indexOf(null);
                if (emptySlot !== -1) {
                    player.fieldMonster[emptySlot] = selected;
                    gs.log(`🤖 CPU Action: 効果で墓地の${selected.name}を特殊召喚しました`);
                }
            } else {
                player.hand.push(selected);
                gs.log(`🤖 CPU Action: STAR BUCKSの効果で墓地の${selected.name}を回収しました`);
            }
        } else {
            showGraveyardSelect(result.player, result);
        }
    }

    // 装備カード以外は即墓地へ
    if (!result || !result.dontGraveyard) {
        player.fieldMagic[slotIdx] = null;
        player.graveyard.push(card);
    }
    triggerMagicCastEffect();
}

// ===============================
// 攻撃宣言 (Async)
// ===============================
async function declareAttack(atkSlot, defSlot = -1, isAuto = false) {
    if (!gs || gs.gameOver) return;
    if (!isAuto && gs.mode === MODE.CPU && !gs.currentPlayer.isHuman) return;
    if (gs.phase !== PHASE.MAIN && gs.phase !== PHASE.BATTLE) {
        gs.log('⚠ メインフェイズかバトルフェイズのみ攻撃できます');
        return;
    }
    // 先攻第1ターンは攻撃不可
    if (gs.isFirstTurn && gs.currentPlayer === gs.firstPlayer) {
        gs.log('⚠ 先攻プレイヤーは最初のターンに攻撃できません');
        return;
    }
    if (gs.attackDeclaredThisTurn) {
        gs.log('⚠ このターンはすでに攻撃しました');
        return;
    }

    const attacker = gs.currentPlayer;
    const defender = gs.getOpponent(attacker);

    if (atkSlot === undefined || atkSlot === -1) {
        gs.log('⚠ 攻撃するモンスターが選択されていません');
        return;
    }

    const atkMonster = attacker.fieldMonster[atkSlot];
    const defMonster = defSlot !== -1 ? defender.fieldMonster[defSlot] : null;

    if (!atkMonster) return;

    gs.phase = PHASE.BATTLE;
    renderPhase(gs.phase);

    const atkAtk = attacker.getEffectiveAtk(gs, atkSlot);
    const defAtk = defMonster ? defender.getEffectiveAtk(gs, defSlot) : 0;

    if (defMonster) {
        gs.log(`【攻撃】${atkMonster.name}(ATK:${atkAtk}) vs ${defMonster.name}(ATK:${defAtk})`);
    } else {
        gs.log(`【直接攻撃】${atkMonster.name}(ATK:${atkAtk}) → ${defender.name}`);
    }

    // ===== 必勝判定 =====
    let forceWin = false;

    // イエローパークのG vs 柳 克憲
    if (atkMonster.id === CARD_ID.YELLOW_G &&
        defMonster &&
        (defMonster.id === CARD_ID.YANAGI || defMonster.id === CARD_ID.VISION_YANAGI)) {
        forceWin = true;
        gs.log('✨ イエローパークのG：柳 克憲に必勝！');
    }

    // ツインドラゴン vs 上出 瞑星
    if (attacker.fieldMonster.id === CARD_ID.TWIN_DRAGON &&
        defender.fieldMonster &&
        (defender.fieldMonster.id === CARD_ID.KAMIDE || defender.fieldMonster.id === CARD_ID.AI_KAMIDE)) {
        forceWin = true;
        gs.log('✨ ツインドラゴン：上出 瑠星に必勝！');
    }

    // 角地 駿汰：攻撃時ダイス5〜6で必勝
    if (attacker.fieldMonster.id === CARD_ID.KAKUCHI) {
        const roll = await gs.rollDice(); // Async
        gs.log(`角地 駿汰の効果！ダイス：${roll}`);
        if (roll >= 5) {
            forceWin = true;
            gs.log('✨ ダイス5以上！必勝！');
        }
    }

    // ===== 戦闘処理 =====
    // 二割引の生麺チェック（ダメージ0.8倍、1回使い切り）
    let damageMultiplier = 1.0;
    const niwariIdx = gs.permanentEffects.findIndex(e => e.id === CARD_ID.NIWARIBIKI && e.owner === defender.name);
    if (niwariIdx !== -1) {
        damageMultiplier = 0.8;
        gs.permanentEffects.splice(niwariIdx, 1); // 1回のみ
        gs.log(`【${defender.name}】二割引の生麺適用！ダメージ20%軽減`);
    }

    let attackerDmgTarget = attacker;
    let defenderDmgTarget = defender;

    // 着払いの名所 コルティレ (CORTILE)
    if (attacker.cortileActive) attackerDmgTarget = defender;
    if (defender.cortileActive) defenderDmgTarget = attacker;

    // 直接攻撃
    const isDirectAttack = !defMonster;
    if (isDirectAttack) {
        const dmg = Math.floor(atkAtk * damageMultiplier);
        defenderDmgTarget.lp = Math.max(0, defenderDmgTarget.lp - dmg);
        showFloatingDamage(dmg, defenderDmgTarget === gs.player1, true);
        gs.log(`${defenderDmgTarget.name}に${dmg}ダメージ！(LP:${defenderDmgTarget.lp})`);

        // CURTAIN BREAKER 追加ダメージ
        if (atkMonster.id === CARD_ID.CURTAIN_HASHIMOTO && atkMonster.onBattleWin) {
            atkMonster.onBattleWin(gs, attacker, defender);
        }
    } else {
        // モンスター同士の戦闘
        // forceWinなら攻撃側勝利扱い
        const attackerWins = forceWin || atkAtk > defAtk;
        const isDraw = !forceWin && atkAtk === defAtk;

        if (isDraw) {
            gs.log('引き分け！両モンスター墓地へ');
            destroyMonster(attacker, atkSlot);
            destroyMonster(defender, defSlot);
        } else if (attackerWins) {
            const diff = forceWin ? atkAtk : (atkAtk - defAtk);
            const dmg = Math.floor(diff * damageMultiplier);

            gs.log(`${atkMonster.name}が勝利！差分${dmg}ダメージ`);
            defenderDmgTarget.lp = Math.max(0, defenderDmgTarget.lp - dmg);
            showFloatingDamage(dmg, defenderDmgTarget === gs.player1, true);
            gs.log(`${defenderDmgTarget.name} LP:${defenderDmgTarget.lp}`);

            if (defMonster.indestructible && !defMonster.effectNegated) {
                gs.log(`${defMonster.name}は戦闘では破壊されない！`);
                // 道下 政功：破壊成功時にATK+600（永続スタック）
                if (atkMonster.id === CARD_ID.MICHISHITA) {
                    atkMonster.permanentAtkBonus = (atkMonster.permanentAtkBonus || 0) + 600;
                    gs.log(`道下 政功 ATK+600スタック！現在ATK:${attacker.getEffectiveAtk(gs, atkSlot)}`);
                }
            } else if (defMonster.battleResist && defMonster.battleResist > 0) {
                defMonster.battleResist -= 1;
                gs.log(`${defMonster.name}は戦闘ダメージを耐えた！(残り耐性: ${defMonster.battleResist}回)`);
            } else {
                // 道下 政功：相手破壊成功でATK+600
                if (atkMonster.id === CARD_ID.MICHISHITA) {
                    atkMonster.permanentAtkBonus = (atkMonster.permanentAtkBonus || 0) + 600;
                    gs.log(`道下 政功 ATK+600スタック！現在ATK:${attacker.getEffectiveAtk(gs, atkSlot)}`);
                }
                // CURTAIN BREAKER
                if (atkMonster.id === CARD_ID.CURTAIN_HASHIMOTO && atkMonster.onBattleWin) {
                    atkMonster.onBattleWin(gs, attacker, defender);
                }
                destroyMonster(defender, defSlot, false);
            }
        } else {
            // 防御側勝利
            const diff = defAtk - atkAtk;
            gs.log(`${defMonster.name}が防御勝利！差分${diff}ダメージ`);
            // 攻撃側への反動ダメージには防御側（受け手でない）の二割引は適用されない
            attackerDmgTarget.lp = Math.max(0, attackerDmgTarget.lp - diff);
            showFloatingDamage(diff, attackerDmgTarget === gs.player1, true);
            gs.log(`${attackerDmgTarget.name} LP:${attackerDmgTarget.lp}`);

            if (atkMonster.indestructible && !atkMonster.effectNegated) {
                gs.log(`${atkMonster.name}は戦闘では破壊されない！`);
                // 道下（防御側）：相手破壊でATK+600
                if (defMonster.id === CARD_ID.MICHISHITA) {
                    defMonster.permanentAtkBonus = (defMonster.permanentAtkBonus || 0) + 600;
                    gs.log(`道下 政功 ATK+600スタック！現在ATK:${defender.getEffectiveAtk(gs, defSlot)}`);
                }
            } else if (atkMonster.battleResist && atkMonster.battleResist > 0) {
                atkMonster.battleResist -= 1;
                gs.log(`${atkMonster.name}は戦闘ダメージを耐えた！(残り耐性: ${atkMonster.battleResist}回)`);
            } else {
                // 道下 政功（防御側）：相手破壊でATK+600
                if (defMonster.id === CARD_ID.MICHISHITA) {
                    defMonster.permanentAtkBonus = (defMonster.permanentAtkBonus || 0) + 600;
                    gs.log(`道下 政功 ATK+600スタック！現在ATK:${defender.getEffectiveAtk(gs, defSlot)}`);
                }
                destroyMonster(attacker, atkSlot, false);
            }
        }
    }

    // 攻撃宣言後の処理
    // 橋本 泰成: 戦闘終了後、勝敗に関わらず墓地へ
    if (atkMonster && atkMonster.oneTimeAttacker) {
        gs.log(`${atkMonster.name}は戦闘を終えて墓地へ…`);
        destroyMonster(attacker, atkSlot);
    }

    gs.attackDeclaredThisTurn = true;
    renderAll();

    if (gs.checkGameOver()) {
        renderGameOver();
    }
}

// ===============================
// モンスター破壊処理
// ===============================
function destroyMonster(player, slotIndex, isDirectAttack = false) {
    if (!player.fieldMonster || !player.fieldMonster[slotIndex]) return;
    const monster = player.fieldMonster[slotIndex];
    if (monster.onDestroy && !monster.effectNegated) {
        monster.onDestroy(gs, player, isDirectAttack);
    }
    // 装備カードも墓地へ(暫定: 対象をインデックスで合わせる)
    if (monster.equipped === CARD_ID.YANI_JACKET && player.fieldMagic && player.fieldMagic[slotIndex]) {
        player.graveyard.push(player.fieldMagic[slotIndex]);
        player.fieldMagic[slotIndex] = null;
    }
    player.graveyard.push(monster);
    player.fieldMonster[slotIndex] = null;
    gs.log(`${player.name}の${monster.name}が破壊され墓地へ`);
}

// ===============================
// ダメージポップアップ演出
// ===============================
function showFloatingDamage(amount, isPlayer1, isDirectAttack = false, slotIdx = 0) {
    if (amount <= 0) return;

    // LPテキスト直下の赤テキストアニメーション
    const dmgElId = isPlayer1 ? 'p1-damage-text' : 'p2-damage-text';
    const dmgEl = document.getElementById(dmgElId);
    if (dmgEl) {
        dmgEl.textContent = `-${amount}`;
        dmgEl.classList.remove('damage-anim');
        void dmgEl.offsetWidth; // reflow
        dmgEl.classList.add('damage-anim');
    }

    // 従来のフィールドの対象モンスター等から浮き出るダメージ
    const overlay = document.createElement('div');
    overlay.className = 'floating-damage';
    overlay.textContent = `-${amount}`;

    let targetEl;
    if (isDirectAttack) {
        targetEl = document.getElementById(isPlayer1 ? 'p1-lp' : 'p2-lp');
    } else {
        const zoneId = isPlayer1 ? 'p1-monster-zone' : 'p2-monster-zone';
        const zone = document.getElementById(zoneId);
        if (zone) {
            const slots = zone.querySelectorAll('.field-slot');
            if (slots[slotIdx]) targetEl = slots[slotIdx];
        }
    }

    if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        overlay.style.left = `${rect.left + rect.width / 2 - 20}px`;
        overlay.style.top = `${rect.top + rect.height / 2 - 20}px`;
    } else {
        overlay.style.left = '50%';
        overlay.style.top = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
    }

    document.body.appendChild(overlay);
    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 1000);
}

// ===============================
// レンダリング
// ===============================
function renderAll() {
    if (!gs) return;

    if (_awaitingAttackTargetIdx !== -1) {
        document.getElementById('game-screen').classList.add('targeting-mode');
    } else {
        document.getElementById('game-screen').classList.remove('targeting-mode');
    }

    renderPlayerInfo(gs.player1, 'p1');
    renderPlayerInfo(gs.player2, 'p2');

    // P1, P2名を設定 (ホスト時の(あなた)(相手)を付与)
    const p1NameEl = document.getElementById('p1-name');
    if (p1NameEl) p1NameEl.textContent = gs.player1.name + (gs._isOnlineHost ? ' (あなた)' : '');
    const p2NameEl = document.getElementById('p2-name');
    if (p2NameEl) p2NameEl.textContent = gs.player2.name + (gs._isOnlineHost ? ' (相手)' : '');

    // CPUモードやオンラインホスト時は、相手のターンでも常に自分の手札(player1)を表示する
    let handOwner = gs.currentPlayer;
    if (gs._isOnlineHost || gs.mode === MODE.CPU) {
        handOwner = gs.player1;
    }
    renderHand(handOwner);
    renderField();
    renderGraveyard();
    renderTurnBadge();

    // ホスト時またはCPU時のアクションバーおよびボタン制御
    const atkBtn = document.getElementById('btn-attack');
    const endBtn = document.getElementById('btn-end-turn');
    if (gs._isOnlineHost || gs.mode === MODE.CPU) {
        const isMyTurn = (gs.currentPlayer === gs.player1);
        if (atkBtn) atkBtn.style.display = isMyTurn ? 'inline-block' : 'none';
        if (endBtn) endBtn.style.display = isMyTurn ? 'inline-block' : 'none';
    } else {
        if (atkBtn) atkBtn.style.display = 'inline-block';
        if (endBtn) endBtn.style.display = 'inline-block';
    }

    // スマホ向け：相手の手札の視覚化
    // 自分がP1なら相手はP2、自分がP2なら相手はP1
    if (window.innerWidth <= 768) {
        if (gs._isOnlineHost || gs.mode === MODE.NORMAL || gs.mode === MODE.TEST || gs.mode === MODE.CPU) {
            // CPUやオンライン等でも相手の手札枚数を表示。相手=p2
            renderOppHandVisual(gs.player2, 'p2');
            renderOppHandVisual(gs.player1, 'p1', true); // 自分側はクリア
        }
    } else {
        // PCレイアウト用にクリア
        renderOppHandVisual(gs.player1, 'p1', true);
        renderOppHandVisual(gs.player2, 'p2', true);
    }
}

function renderOppHandVisual(player, prefix, clearOnly = false) {
    const panel = document.getElementById(`${prefix}-panel`);
    if (!panel) return;
    let visContainer = panel.querySelector('.opp-hand-visual');
    if (clearOnly) {
        if (visContainer) visContainer.remove();
        return;
    }

    if (!visContainer) {
        visContainer = document.createElement('div');
        visContainer.className = 'opp-hand-visual';
        // パネル内の名前の次あたりに挿入
        const nameEl = document.getElementById(`${prefix}-name`);
        if (nameEl) nameEl.after(visContainer);
        else panel.appendChild(visContainer);
    }
    visContainer.innerHTML = '';

    // 裏向きカードを枚数分生成
    for (let i = 0; i < player.hand.length; i++) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-magic';
        cardEl.innerHTML = `<div style="font-size:1.5rem;text-align:center;margin-top:10px;">🃏</div>`;
        visContainer.appendChild(cardEl);
    }
}

function renderPlayerInfo(player, prefix) {
    const lpEl = document.getElementById(`${prefix}-lp`);
    if (!lpEl) return;
    lpEl.textContent = player.lp;
    if (player.lp <= 1000) lpEl.style.color = '#ff4444';
    else if (player.lp <= 2000) lpEl.style.color = '#ffaa00';
    else lpEl.style.color = '#00ff88';
}

function renderPhase(phase) {
    const el = document.getElementById('phase-display');
    if (el) el.textContent = phase;
}

function showPhaseIndicator(msg) {
    const el = document.getElementById('phase-indicator-overlay');
    const txt = document.getElementById('phase-indicator-text');
    if (!el || !txt) return;

    txt.textContent = msg;
    el.style.display = 'flex';
    txt.style.animation = 'none';
    void txt.offsetWidth; // reflow
    txt.style.animation = 'phase-indicator-anim 1.5s ease-out forwards';

    setTimeout(() => {
        el.style.display = 'none';
    }, 1500);
}

function showTurnIndicator(msg) {
    const el = document.getElementById('turn-indicator-overlay');
    const txt = document.getElementById('turn-indicator-text');
    if (!el || !txt) return;

    txt.textContent = msg;
    el.style.display = 'flex';
    txt.style.animation = 'none';
    void txt.offsetWidth; // reflow
    txt.style.animation = 'turn-indicator-anim 2s ease-out forwards';

    setTimeout(() => {
        el.style.display = 'none';
    }, 2000);
}

function renderDice(result) {
    const el = document.getElementById('dice-display');
    if (!el) return;
    const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    el.textContent = faces[result] || result;
    el.classList.remove('dice-roll');
    void el.offsetWidth; // reflow でアニメーションリセット
    el.classList.add('dice-roll');
}

function renderLog(msg) {
    const el = document.getElementById('log-modal-container') || document.getElementById('log-container');
    if (!el) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
}

function renderHand(player) {
    const el = document.getElementById('hand-area');
    if (!el) return;

    // 開閉状態を保持
    const wasOpen = !el.classList.contains('hand-closed');
    el.innerHTML = '';

    const cardsEl = document.createElement('div');
    cardsEl.className = 'hand-cards';
    if (!wasOpen) cardsEl.style.display = 'none';

    // 手札をフラットに並べて描画
    player.hand.forEach((card, idx) => {
        const cardNode = createCardElement(card, idx, true);
        cardsEl.appendChild(cardNode);
    });
    // DOM追加は後回し（headerElを先に挿入するため）

    const headerEl = document.createElement('div');
    headerEl.className = 'hand-header';
    headerEl.style.position = 'absolute';
    headerEl.style.top = '0';
    headerEl.style.left = '0';
    headerEl.style.width = '100%';
    headerEl.style.display = 'flex';
    headerEl.style.justifyContent = 'space-between'; // 左右に散らす
    headerEl.style.alignItems = 'center';
    headerEl.style.padding = '0 20px';
    headerEl.style.pointerEvents = 'none'; // クリック貫通
    headerEl.style.zIndex = '200';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-hand-toggle';
    toggleBtn.style.padding = '6px 16px';
    toggleBtn.style.borderRadius = '6px';
    toggleBtn.style.background = 'linear-gradient(135deg, #222, #444)';
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = '2px solid #666';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontWeight = 'bold';
    toggleBtn.style.pointerEvents = 'auto'; // ボタン自体はクリック可能
    toggleBtn.textContent = wasOpen ? '▼ 手札を隠す' : '▲ 手札を見る';
    toggleBtn.onclick = toggleHand;
    headerEl.appendChild(toggleBtn);

    // ターン終了ボタンは画面右下のメニューに移管されたため、手札上部での生成・描画は削除しました

    // headerElを先に挿入し、その後にcardsElを挿入（flex-direction: columnにより縦に並ぶ）
    el.appendChild(headerEl);
    el.appendChild(cardsEl);

    if (!wasOpen) el.classList.add('hand-closed');
}

function createCardElement(card, idx, inHand = false) {
    const el = document.createElement('div');
    let cls = `card ${card.type === CARD_TYPE.MONSTER ? 'card-monster' : 'card-magic'}`;
    if (card.evolved) cls += ' card-evolved';
    if (card.id === CARD_ID.ULTIMATE_PACHINKO) cls += ' card-ultimate';
    el.className = cls;

    // 色統一ロジック
    let cardColor = '#222';
    if (card.evolved) cardColor = '#800080'; // 紫
    else if (card.type === CARD_TYPE.MAGIC) cardColor = '#006400'; // 緑
    else if (card.type === CARD_TYPE.MONSTER) cardColor = '#4682B4'; // 水色

    el.style.setProperty('--card-color', cardColor);

    const inMainPhase = gs && gs.phase === PHASE.MAIN;
    const typeOk = card.type === CARD_TYPE.MONSTER
        ? (inMainPhase && !gs.monsterUsedThisTurn)
        : inMainPhase;
    const isMyTurn = gs._isOnlineHost ? (gs.currentPlayer === gs.player1) : true;
    const canPlay = inHand && isMyTurn && typeOk && card.canUse(gs, gs.currentPlayer);
    if (canPlay) el.classList.add('card-playable');

    const atkDisplay = card.type === CARD_TYPE.MONSTER
        ? `<div class="card-atk">ATK: ${card.atk}</div>` : '';

    const imgArea = card.imageFile
        ? `<div class="card-img-area"><img src="site/images/members/${card.imageFile}" class="card-photo" alt="${card.name}"></div>`
        : `<div class="card-img-area"><span class="card-emoji-large">${card.emoji || '\u{1F0CF}'}</span></div>`;

    // カード名改行対応
    const dispName = card.name;

    el.innerHTML = `
    <div class="card-header">
      <span class="card-type-badge">${card.type === CARD_TYPE.MONSTER ? 'M' : '\u9b54'}</span>
      <span class="card-emoji">${(card.emoji || '\u{1F0CF}').replace(/\?/g, '')}</span>
      ${card.evolved ? '<span class="evolved-badge">\u9032\u5316</span>' : ''}
    </div>
    ${imgArea}
    <div class="card-name">${dispName}</div>
    ${atkDisplay}
    <div class="card-effect">${card.effect || ''}</div>
  `;

    if (inHand && canPlay) {
        // 使用可能な手札：詳細画面を開き、そこから使用する（全デバイス共通）
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (_awaitingAttackTargetIdx !== -1) {
                _awaitingAttackTargetIdx = -1;
                renderAll();
            }
            showCardDetail(card, () => useCard(idx), '✨ 使用 / 召喚する');
        });
    } else {
        // 使用不可な手札、もしくはフィールドのカード
        el.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!inHand) {
                const owner = el.dataset.owner;
                const slot = parseInt(el.dataset.slotIndex, 10);

                // --- ターゲット選択中 ---
                if (_awaitingAttackTargetIdx !== -1) {
                    if (owner === 'opp' && card.type === CARD_TYPE.MONSTER) {
                        // 相手のモンスターを指定して攻撃
                        const atkSlot = _awaitingAttackTargetIdx;
                        _awaitingAttackTargetIdx = -1;
                        renderAll();
                        // ゲストの場合はサーバーに送信、それ以外はローカル処理
                        if (_onlineRole === 'guest') {
                            _sendOnlineAction({ type: 'attack', atkSlot: atkSlot, defSlot: slot });
                        } else {
                            declareAttack(atkSlot, slot);
                        }
                        return;
                    } else {
                        // 対象不適格（自分のモンスターや魔法等）ならキャンセル
                        _awaitingAttackTargetIdx = -1;
                        renderAll();
                        gs.log('攻撃対象の選択をキャンセルしました');
                        return; // 詳細も出さずリセット
                    }
                }

                // --- ターゲット選択中でない場合のフィールドのカード ---
                const inMainPhase = gs && (gs.phase === PHASE.MAIN || gs.phase === PHASE.BATTLE);
                const canAttack = owner === 'me' && inMainPhase && card.type === CARD_TYPE.MONSTER && !gs.attackDeclaredThisTurn && !(gs.isFirstTurn && gs.currentPlayer === gs.firstPlayer);

                let attackCb = null;
                let attackTxt = null;
                if (canAttack) {
                    attackCb = () => {
                        const defender = gs.getOpponent(gs.currentPlayer);
                        const hasOppMonsters = defender.fieldMonster.some(m => m !== null);

                        if (!hasOppMonsters) {
                            if (_onlineRole === 'guest') {
                                _sendOnlineAction({ type: 'attack', atkSlot: slot, defSlot: -1 });
                            } else {
                                declareAttack(slot, -1);
                            }
                        } else {
                            _awaitingAttackTargetIdx = slot;
                            renderAll();
                            gs.log('攻撃対象のモンスターを選択してください（タップ）');
                        }
                    };
                    attackTxt = '⚔️ 攻撃する';
                }

                const canActivate = owner === 'me' && gs.phase === PHASE.MAIN && card.onActivate && !card.hasActivatedThisTurn;
                let activateCb = null;
                let activateTxt = null;
                if (canActivate) {
                    activateCb = () => {
                        card.onActivate(gs, gs.currentPlayer, slot);
                        card.hasActivatedThisTurn = true;
                        renderAll();
                    };
                    activateTxt = '✨ 効果を発動';
                }

                if (attackCb || activateCb) {
                    showCardDetail(card, attackCb, attackTxt, activateCb, activateTxt);
                    return;
                }
            }

            // 単なる詳細表示として開く（アクションボタンなし）
            showCardDetail(card, null, null, null, null);
        });
    }

    // ULTRAMAN IN KANAZAWA: 捨てて発動ボタン
    if (inHand && isMyTurn && card.quickEffect && card.onDiscard && inMainPhase) {
        const discardBtn = document.createElement('button');
        discardBtn.className = 'btn-quick-discard';
        discardBtn.textContent = '★ 捨てて発動';
        discardBtn.onclick = (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
                showCardDetail(card, () => {
                    const i = gs.currentPlayer.hand.indexOf(card);
                    if (i !== -1) { gs.currentPlayer.hand.splice(i, 1); gs.currentPlayer.graveyard.push(card); }
                    card.onDiscard(gs, gs.currentPlayer);
                    renderAll();
                }, '★ 捨てて発動する');
            } else {
                const i = gs.currentPlayer.hand.indexOf(card);
                if (i !== -1) { gs.currentPlayer.hand.splice(i, 1); gs.currentPlayer.graveyard.push(card); }
                card.onDiscard(gs, gs.currentPlayer);
                renderAll();
            }
        };
        el.appendChild(discardBtn);
    }

    return el;
}


function renderField() {
    renderFieldZone('p1-monster-zone', gs.player1.fieldMonster, gs.player1);
    renderFieldZone('p1-magic-zone', gs.player1.fieldMagic, gs.player1);
    renderFieldZone('p2-monster-zone', gs.player2.fieldMonster, gs.player2);
    renderFieldZone('p2-magic-zone', gs.player2.fieldMagic, gs.player2);
}

function renderFieldZone(zoneId, cards, player) {
    const container = document.getElementById(zoneId);
    if (!container) return;

    // slot要素を取得 (今は0のみ = 1枚)
    const slots = container.querySelectorAll('.field-slot');
    if (slots.length === 0) return;

    // 1対1モード: スロットは1つのみ
    const maxSlots = Math.min(slots.length, cards ? cards.length : 1);
    for (let i = 0; i < maxSlots; i++) {
        const slot = slots[i];
        slot.innerHTML = ''; // 既存の表示をクリア
        const card = cards ? cards[i] : null;

        // P1のデータならme/oppをplayer1かどうかで判定
        const isP1Zone = zoneId.startsWith('p1-');
        let ownerAttr;
        if (gs._isOnlineHost) {
            ownerAttr = isP1Zone ? 'me' : 'opp';
        } else {
            // ローカル模輷時: 現在のプレイヤーのスロットが 'me'
            ownerAttr = (player === gs.currentPlayer) ? 'me' : 'opp';
        }

        if (card) {
            const cardEl = createCardElement(card, i, false);
            // 盤面上のカードに属性（インデックス等）を持たせておく
            cardEl.dataset.slotIndex = i;
            cardEl.dataset.owner = ownerAttr;

            if (card.type === CARD_TYPE.MONSTER) {
                const baseAtk = card.atk;
                let effAtk = baseAtk;
                const temp = card.tempAtkBonus || 0;
                const penalty = card.tempAtkPenalty || 0;
                const perm = card.permanentAtkBonus || 0;
                effAtk = Math.max(0, baseAtk + temp + perm - penalty);

                if (effAtk !== baseAtk) {
                    const atkEl = cardEl.querySelector('.card-atk');
                    if (atkEl) atkEl.textContent = `ATK: ${effAtk} (基:${baseAtk})`;
                }

                const badge = document.createElement('div');
                badge.className = 'card-atk-badge';
                badge.textContent = effAtk;
                cardEl.appendChild(badge);
            } else if (card.type === CARD_TYPE.MAGIC) {
                const badge = document.createElement('div');
                badge.className = 'card-magic-badge';
                badge.textContent = '魔';
                cardEl.appendChild(badge);
            }
            slot.appendChild(cardEl);
        } else {
            slot.innerHTML = '<div class="empty-zone">空き</div>';
        }
    }
}

function renderGraveyard() {
    renderGraveyardZone('p1-graveyard', gs.player1.graveyard);
    renderGraveyardZone('p2-graveyard', gs.player2.graveyard);
}

function renderGraveyardZone(zoneId, graveyard) {
    const el = document.getElementById(zoneId);
    if (!el) return;
    el.innerHTML = '';
    const label = document.createElement('div');
    label.className = 'graveyard-label';
    label.textContent = `墓地 (${graveyard.length}枚)`;
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'graveyard-list';
    graveyard.slice(-5).reverse().forEach(c => {
        const item = document.createElement('div');
        item.className = 'graveyard-item';
        item.textContent = `${c.emoji || '🃏'} ${c.name}`;
        item.title = c.effect || '';
        list.appendChild(item);
    });
    el.appendChild(list);
}

function renderTurnBadge() {
    const el = document.getElementById('turn-badge');
    if (el) el.textContent = `ターン ${gs.turnCount} | ${gs.currentPlayer.name} のターン`;

    const modeBadge = document.getElementById('mode-badge');
    if (modeBadge) {
        modeBadge.textContent = gs.mode === MODE.TEST ? '🧪 テストモード' : '⚔️ 対戦モード';
        modeBadge.className = gs.mode === MODE.TEST ? 'mode-badge test-mode' : 'mode-badge normal-mode';
    }
}

function renderGameOver() {
    const el = document.getElementById('gameover-overlay');
    if (!el) return;
    el.style.display = 'flex';
    const msg = document.getElementById('gameover-msg');
    if (msg) {
        msg.textContent = gs.winner ? `🏆 ${gs.winner.name} の勝利！` : 'ゲーム終了';
    }
}

// ===============================
// 手札開閉トグル
// ===============================
function toggleHand() {
    const el = document.getElementById('hand-area');
    if (!el) return;
    const cardsEl = el.querySelector('.hand-cards');
    const btnEl = el.querySelector('.btn-hand-toggle');
    const isClosed = el.classList.contains('hand-closed');
    if (isClosed) {
        el.classList.remove('hand-closed');
        if (cardsEl) cardsEl.style.display = '';
        if (btnEl) btnEl.textContent = '▲ 閉じる';
    } else {
        el.classList.add('hand-closed');
        if (cardsEl) cardsEl.style.display = 'none';
        if (btnEl) btnEl.textContent = '▼ 開く';
    }
}


// ===============================
// エフェクト関数
// ===============================
function triggerEvolvedEffect() {
    const overlay = document.createElement('div');
    overlay.className = 'evolved-summon-overlay';
    overlay.innerHTML = `
      <div class="evolved-burst"></div>
      <div class="evolved-rays"></div>
      <div class="evolved-text">⚡ 上位進化召喚 ⚡</div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2200);
}

function triggerMonsterLandEffect() {
    const gs_screen = document.getElementById('game-screen');
    if (!gs_screen) return;
    gs_screen.classList.add('field-shake');
    setTimeout(() => gs_screen.classList.remove('field-shake'), 500);

    const flash = document.createElement('div');
    flash.className = 'monster-land-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
}

function triggerMagicCastEffect() {
    const flash = document.createElement('div');
    flash.className = 'magic-cast-fx';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 900);

    const circle = document.createElement('div');
    circle.className = 'magic-circle-fx';
    document.body.appendChild(circle);
    setTimeout(() => circle.remove(), 900);
}

// 特殊勝利演出
function triggerWinEffect(winner) {
    const overlay = document.createElement('div');
    overlay.className = 'win-effect-overlay';
    overlay.innerHTML = `
        <div class="win-title">SPECIAL WIN</div>
        <div class="win-subtitle">${winner.name}</div>
        <div class="win-particles"></div>
    `;
    document.body.appendChild(overlay);
    // オーバーレイはずっと表示（ゲームオーバーなので）
}

// ===============================
// スターバックス 墓地選択UI
// ===============================
function showGraveyardSelect(player, result = null) {
    if (!player) return;

    let targetList = [...player.graveyard];
    const isBoth = result && result.bothGraveyards;
    const opp = gs ? gs.getOpponent(player) : null;
    if (isBoth && opp) {
        targetList = [...player.graveyard, ...opp.graveyard];
        if (result.selectType) {
            targetList = targetList.filter(c => c.type === result.selectType);
        }
    }

    if (targetList.length === 0) {
        gs && gs.log(`対象となるカードが墓地にありませんでした`);
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'graveyard-select-modal';
    modal.innerHTML = `
      <div class="graveyard-select-box">
        <div class="graveyard-select-title">☕ 墓地からカードを選択</div>
        <div class="graveyard-select-list" id="gy-select-list"></div>
        <button class="btn-gs-cancel" id="gy-cancel-btn">キャンセル</button>
      </div>
    `;
    document.body.appendChild(modal);

    const list = modal.querySelector('#gy-select-list');
    targetList.forEach((card, i) => {
        const item = document.createElement('div');
        item.className = 'gy-select-item';
        item.innerHTML = `<span class="gy-item-emoji">${card.emoji || '🃏'}</span> ${card.name}`;
        item.onclick = () => {
            // 元の配列から削除する
            let sourceGy = player.graveyard;
            let idx = sourceGy.indexOf(card);
            if (idx === -1 && isBoth) {
                sourceGy = opp.graveyard;
                idx = sourceGy.indexOf(card);
            }

            if (idx !== -1) {
                const selected = sourceGy.splice(idx, 1)[0];
                if (result && result.specialSummon) {
                    const emptySlot = player.fieldMonster.indexOf(null);
                    if (emptySlot !== -1) {
                        player.fieldMonster[emptySlot] = selected;
                        gs.log(`【${player.name}】効果で ${selected.name} を特殊召喚した！`);
                    } else {
                        player.hand.push(selected); // 空きがなければ手札へ
                        gs.log(`【${player.name}】盤面がいっぱいのため ${selected.name} を手札に加えた`);
                    }
                } else {
                    player.hand.push(selected);
                    gs.log(`【${player.name}】墓地の ${selected.name} を手札に加えた！`);
                }
            }
            modal.remove();
            renderAll();
        };
        list.appendChild(item);
    });
    modal.querySelector('#gy-cancel-btn').onclick = () => modal.remove();
}

// ===============================
// カード一覧モード
// ===============================
function showCardGallery() {
    const modal = document.createElement('div');
    modal.className = 'card-gallery-modal';
    modal.innerHTML = `
      <div class="gallery-box">
        <div class="gallery-title">📚 カード一覧</div>
        <div class="gallery-filter">
          <button class="gallery-filter-btn active" data-filter="all">全て</button>
          <button class="gallery-filter-btn" data-filter="monster">モンスター</button>
          <button class="gallery-filter-btn" data-filter="magic">魔法</button>
          <button class="gallery-filter-btn" data-filter="evolved">上位進化</button>
        </div>
        <div class="gallery-grid" id="gallery-grid"></div>
        <button class="btn-gallery-close" id="gallery-close-btn">✕ 閉じる</button>
      </div>
    `;
    document.body.appendChild(modal);

    const grid = modal.querySelector('#gallery-grid');

    function renderGallery(filter) {
        grid.innerHTML = '';
        ALL_CARDS.filter(c => {
            if (filter === 'all') return true;
            if (filter === 'monster') return c.type === CARD_TYPE.MONSTER && !c.evolved;
            if (filter === 'magic') return c.type === CARD_TYPE.MAGIC;
            if (filter === 'evolved') return c.evolved;
            return true;
        }).forEach(card => {
            const el = document.createElement('div');
            el.className = `gallery-card ${card.evolved ? 'gallery-evolved' : ''} ${card.id === CARD_ID.ULTIMATE_PACHINKO ? 'gallery-ultimate' : ''}`;
            el.style.setProperty('--card-color', card.color || '#222');
            const imgArea = card.imageFile
                ? `<div class="gallery-card-img"><img src="site/images/members/${card.imageFile}" alt="${card.name}"></div>`
                : `<div class="gallery-card-img"><span class="gallery-card-emoji">${card.emoji || '🃏'}</span></div>`;

            // ギャラリーも改行対応
            const dispName = card.name;

            el.innerHTML = `
              ${imgArea}
              <div class="gallery-card-name">${dispName}</div>
              ${card.type === CARD_TYPE.MONSTER ? `<div class="gallery-card-atk">ATK: ${card.atk}</div>` : '<div class="gallery-card-atk">魔法カード</div>'}
              <div class="gallery-card-effect">${card.effect || ''}</div>
            `;
            grid.appendChild(el);
        });
    }

    renderGallery('all');

    modal.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.onclick = () => {
            modal.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter);
        };
    });

    modal.querySelector('#gallery-close-btn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}



// ===============================
// ローカル対戦用オーバーレイ
// ===============================
function showTurnOverlay() {
    const ov = document.getElementById('turn-overlay');
    const title = document.getElementById('turn-overlay-title');
    if (title && gs) title.textContent = `${gs.currentPlayer.name} のターン`;

    if (ov) ov.style.display = 'flex';

    const btn = document.getElementById('btn-turn-start');
    if (btn) {
        btn.onclick = () => {
            if (ov) ov.style.display = 'none';
            renderAll();
            startTurn();
        };
    }
}

// ===============================
// 汎用カード選択UI (氷見高校など)
// ===============================
function showCardSelectUI(list, onSelect, titleText = "カードを選択") {
    const modal = document.getElementById('card-select-modal');
    const title = document.getElementById('card-select-title');
    const container = document.getElementById('card-select-list');
    const cancelBtn = document.getElementById('btn-card-select-cancel');

    if (!modal || !container) return;

    title.textContent = titleText;
    container.innerHTML = '';

    list.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'gy-select-item';
        el.innerHTML = `<span class="gy-item-emoji">${item.emoji || '🃏'}</span> ${item.name}`;
        el.onclick = () => {
            onSelect(item, index);
            // モーダルは呼び出し元で閉じるか、ここで閉じるか。
            // 連続選択の可能性を考慮して自動では閉じないのが汎用的だが、
            // 今回は単発選択が多いので閉じてあげる。
            modal.style.display = 'none';
        };
        container.appendChild(el);
    });

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };

    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    // タイトル画面は CSS で flex 表示済み
});

// ============================================================
// オンライン対戦 (Socket.IO) サポート
// ============================================================

let _socket = null;
let _onlineRole = null; // 'host' | 'guest'
let _guestState = null; // 最後に受信したゲーム状態
let _origRenderAll = null;

// ===== モーダル表示 =====
function showOnlineModal() {
    document.getElementById('online-create-section').style.display = 'block';
    document.getElementById('online-waiting-section').style.display = 'none';
    document.getElementById('online-guest-waiting').style.display = 'none';
    document.getElementById('online-modal').style.display = 'flex';
}

function cancelOnlineHosting() {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
    _onlineRole = null;
    document.getElementById('online-waiting-section').style.display = 'none';
    document.getElementById('online-create-section').style.display = 'block';
}

// ===============================
// レイアウト方向制御 (スマホ向け向かい合わせUI用 & 横画面配置固定用)
// ===============================
function updateLayoutDirection(isP1Me) {
    const p1Panel = document.getElementById('p1-panel');
    const p1Zones = document.querySelector('.p1-field');
    const p2Zones = document.querySelector('.p2-field');
    const p2Panel = document.getElementById('p2-panel');

    if (!p1Panel || !p2Panel || !p1Zones || !p2Zones) return;

    // 前回のクラスをリセット
    p1Panel.classList.remove('area-me-panel', 'area-opp-panel');
    p1Zones.classList.remove('area-me-zones', 'area-opp-zones');
    p2Panel.classList.remove('area-me-panel', 'area-opp-panel');
    p2Zones.classList.remove('area-me-zones', 'area-opp-zones');

    // 不要になったインラインスタイルの除去
    p1Panel.style.order = "";
    p1Zones.style.order = "";
    p2Panel.style.order = "";
    p2Zones.style.order = "";

    if (isP1Me) {
        p1Panel.classList.add('area-me-panel');
        p1Zones.classList.add('area-me-zones');
        p2Panel.classList.add('area-opp-panel');
        p2Zones.classList.add('area-opp-zones');
    } else {
        p1Panel.classList.add('area-opp-panel');
        p1Zones.classList.add('area-opp-zones');
        p2Panel.classList.add('area-me-panel');
        p2Zones.classList.add('area-me-zones');
    }
}

// ===== サーバー接続 =====
function _connectOnlineServer(serverUrl) {
    return new Promise((resolve, reject) => {
        if (_socket && _socket.connected) { resolve(_socket); return; }
        try {
            // Socket.IO クライアントの初期化
            const socket = io(serverUrl, {
                reconnection: false, // 今回はシンプルに再接続なし
                timeout: 3000
            });

            socket.on('connect', () => {
                _socket = socket;
                _setupOnlineHandlers();
                resolve(socket);
            });

            socket.on('connect_error', (err) => {
                reject(new Error('サーバーに接続できません。\nstart-server.bat 等が起動しているか確認してください。'));
            });
        } catch (e) { reject(e); }
    });
}

function _setupOnlineHandlers() {
    _socket.on('room_created', ({ code }) => {
        const codeEl = document.getElementById('online-code-display');
        if (codeEl) codeEl.textContent = code;
        document.getElementById('online-create-section').style.display = 'none';
        document.getElementById('online-waiting-section').style.display = 'block';
    });

    _socket.on('guest_joined', () => {
        // ホスト:ゲームを開始する
        document.getElementById('online-modal').style.display = 'none';
        _startAsHost();
    });

    _socket.on('room_joined', ({ code }) => {
        // ゲスト:ホストを待機。実際にはすぐに状態が降ってくるが、画面は切り替える。
        document.getElementById('online-create-section').style.display = 'none';
        const waitingEl = document.getElementById('online-guest-waiting');
        if (waitingEl) waitingEl.style.display = 'block';

        // ゲストとしてゲーム開始画面へ遷移
        document.getElementById('online-modal').style.display = 'none';
        _startAsGuest();
    });

    _socket.on('game_state_update', ({ state }) => {
        if (_onlineRole !== 'guest') return;
        _guestState = state;
        _renderAsGuest(state);
    });

    _socket.on('guest_action', ({ action }) => {
        if (_onlineRole !== 'host') return;
        _executeGuestAction(action);
    });

    _socket.on('opponent_disconnected', () => {
        alert('対戦相手が切断しました');
        _onlineRole = null;
        if (_socket) { _socket.disconnect(); _socket = null; }
        if (gs) { gs = null; if (typeof goToTitle === 'function') goToTitle(); }
    });

    _socket.on('error_msg', ({ message }) => {
        alert('エラー: ' + message);
        cancelOnlineHosting();
    });

    _socket.on('disconnect', () => {
        if (_onlineRole) {
            alert('サーバーとの接続が切れました');
            _onlineRole = null;
            if (gs) { gs = null; if (typeof goToTitle === 'function') goToTitle(); }
        }
    });
}

// ===== ルーム作成 (ホスト) =====
async function onlineCreateRoom() {
    const input = document.getElementById('online-server-url');
    let url = (input && input.value.trim()) || '';
    if (!url || url === 'http://localhost:8080') {
        url = window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:8080';
    }

    try {
        await _connectOnlineServer(url);
        _onlineRole = 'host';
        _socket.emit('create_room');
    } catch (e) {
        alert('接続失敗:\n' + e.message);
        cancelOnlineHosting();
    }
}

// ===== ルーム参加 (ゲスト) =====
async function onlineJoinRoom() {
    const code = document.getElementById('online-room-input')?.value?.trim();
    if (!code || code.length !== 4) { alert('4桁のルームコードを入力してください'); return; }
    const input = document.getElementById('online-server-url');
    let url = (input && input.value.trim()) || '';
    if (!url || url === 'http://localhost:8080') {
        url = window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:8080';
    }

    try {
        await _connectOnlineServer(url);
        _onlineRole = 'guest';
        _socket.emit('join_room', { code });
    } catch (e) {
        alert('接続失敗:\n' + e.message);
        cancelOnlineHosting();
    }
}

// ===== ホスト: ゲーム開始 =====
function _startAsHost() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('gameover-overlay').style.display = 'none';
    clearLog();

    gs = new GameState(MODE.NORMAL);
    gs.player1.name = 'P1';
    gs.player2.name = 'P2';
    gs._isOnlineHost = true;
    // document.getElementById('mode-badge').textContent = '🌐 オンライン(ホスト)';

    // 先攻後攻ランダム決定
    const first = Math.random() < 0.5;
    gs.currentPlayer = first ? gs.player1 : gs.player2;
    gs.opponentPlayer = first ? gs.player2 : gs.player1;

    // 初期手札5枚
    for (let i = 0; i < 5; i++) {
        gs.drawCard(gs.player1);
        gs.drawCard(gs.player2);
    }

    gs.log(`ゲーム開始！[🌐オンライン対戦]`);
    gs.log(`先攻：${gs.currentPlayer.name}`);

    gs.firstPlayer = gs.currentPlayer;
    gs.isFirstTurn = true;

    // renderAll をパッチしてブロードキャストを自動追加
    _patchRenderAllForHost();

    // 初期描画＆ブロードキャスト
    renderAll();

    // ターン開始
    startTurn();
}

// renderAll パッチ（ホスト側で画面更新のたびにブロードキャスト）
function _patchRenderAllForHost() {
    if (_origRenderAll) return; // 二重パッチ防止
    _origRenderAll = window.renderAll;
    window.renderAll = function () {
        _origRenderAll();
        if (gs && gs._isOnlineHost) _broadcastState();
    };
}

// ===== ゲスト: 待機開始 =====
function _startAsGuest() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    _lastGuestCpIdx = -1;
    updateLayoutDirection(false); // ゲストはP2なのでP2を手前(下)に
    // game_stateが届くまで空のスクリーンを表示
}

// ===== ホスト: 状態をブロードキャスト =====
function _broadcastState() {
    if (!_socket) return;
    if (!gs || !gs._isOnlineHost) return;
    try {
        const state = _serializeState();
        _socket.emit('game_state', { state });
    } catch (e) { console.error('broadcastState error:', e); }
}

// ===== 状態シリアライズ =====
function _serializeState() {
    function sc(c) {
        if (!c) return null;
        return {
            id: c.id, name: c.name, atk: c.atk,
            type: c.type, emoji: c.emoji || '🃏', evolved: !!c.evolved,
            effect: c.effect || '', imageFile: c.imageFile || null, color: c.color || '#1a1a2e',
            tempAtkBonus: c.tempAtkBonus || 0, tempAtkPenalty: c.tempAtkPenalty || 0,
            effectNegated: !!c.effectNegated, indestructible: !!c.indestructible,
            lifespan: c.lifespan ?? null
        };
    }
    function sp(p, hideHand) {
        return {
            name: p.name, lp: p.lp,
            hand: hideHand ? p.hand.map(() => ({ id: 'hidden', name: '?', type: 'unknown', emoji: '🃏', color: '#1a1a2e' })) : p.hand.map(sc),
            fieldMonster: p.fieldMonster.map(sc),
            fieldMagic: p.fieldMagic.map(sc),
            graveyard: p.graveyard.map(sc)
        };
    }
    return {
        p1: sp(gs.player1, true), p2: sp(gs.player2, false),
        cpIdx: gs.currentPlayer === gs.player1 ? 0 : 1,
        turnCount: gs.turnCount, phase: gs.phase,
        logs: (gs.gameLog || []).slice(-30),
        dice: gs.diceResult, gameOver: !!gs.gameOver,
        winner: gs.winner?.name ?? null,
        isGuestTurn: gs.currentPlayer === gs.player2
    };
}

function _renderGuestOppHandVisual(prefix, count, clearOnly = false) {
    const panel = document.getElementById(`${prefix}-panel`);
    if (!panel) return;
    let visContainer = panel.querySelector('.opp-hand-visual');
    if (clearOnly) {
        if (visContainer) visContainer.remove();
        return;
    }
    if (!visContainer) {
        visContainer = document.createElement('div');
        visContainer.className = 'opp-hand-visual';
        const nameEl = document.getElementById(`${prefix}-name`);
        if (nameEl) nameEl.after(visContainer);
        else panel.appendChild(visContainer);
    }
    visContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card card-magic';
        cardEl.innerHTML = `<div style="font-size:1.5rem;text-align:center;margin-top:10px;">🃏</div>`;
        visContainer.appendChild(cardEl);
    }
}

// ===== ゲスト: アクション送信 =====
function _sendOnlineAction(actionObj) {
    if (!_socket) return;
    _socket.emit('action', { action: actionObj });
}

// ===== ホスト: ゲストのアクション実行 =====
function _executeGuestAction(action) {
    if (!gs || !gs._isOnlineHost) return;
    switch (action.type) {
        case 'play_hand_card': {
            const idx = Number(action.handIndex);
            const p2 = gs.player2;
            if (gs.currentPlayer === p2 && p2.hand[idx]) {
                const card = p2.hand[idx];
                if (typeof card.canUse === 'function' && card.canUse(gs, p2)) {
                    // playHandCard関数があればそれを使用
                    if (typeof playHandCard === 'function') {
                        playHandCard(p2, idx);
                    } else {
                        // ない場合はカードオブジェクトのonPlayを直接実行
                        const played = p2.hand.splice(idx, 1)[0];
                        if (played.type === 'monster') {
                            p2.fieldMonster = played;
                            if (played.onPlay) played.onPlay(gs, p2);
                        } else if (played.type === 'magic') {
                            const result = played.onPlay ? played.onPlay(gs, p2) : null;
                            if (!result?.dontGraveyard) p2.graveyard.push(played);
                        }
                        renderAll();
                    }
                }
            }
            break;
        }
        case 'end_turn': {
            if (gs.currentPlayer === gs.player2) endTurn();
            break;
        }
        case 'attack': {
            if ((gs.phase === PHASE.MAIN || gs.phase === PHASE.BATTLE) && gs.currentPlayer === gs.player2) {
                const atkSlot = action.atkSlot !== undefined ? action.atkSlot : -1;
                const defSlot = action.defSlot !== undefined ? action.defSlot : -1;
                if (atkSlot !== -1) {
                    declareAttack(atkSlot, defSlot);
                }
            }
            break;
        }
    }
}

// ===== ゲスト: 受信状態を描画 =====
function _renderAsGuest(state) {
    if (!state) return;

    // 待機画面を非表示にする
    const guestWaitingEl = document.getElementById('online-guest-waiting');
    if (guestWaitingEl) guestWaitingEl.style.display = 'none';
    const modalEl = document.getElementById('online-modal');
    if (modalEl) modalEl.style.display = 'none';

    // ヘッダー更新
    const cpName = state.cpIdx === 0 ? state.p1.name : state.p2.name;
    const tb = document.getElementById('turn-badge');
    if (tb) tb.textContent = `ターン ${state.turnCount} | ${cpName} のターン`;
    const ph = document.getElementById('phase-display');
    if (ph) ph.textContent = state.phase || '';

    if (_lastGuestCpIdx !== state.cpIdx) {
        _lastGuestCpIdx = state.cpIdx;
        const msg = state.isGuestTurn ? "あなたのターン" : "相手のターン";
        showTurnIndicator(msg);
    }
    const mb = document.getElementById('mode-badge');
    if (mb) { mb.textContent = '🌐 オンライン対戦'; mb.className = 'mode-badge'; }

    // P1 (相手=ホスト) 情報
    const p1n = document.getElementById('p1-name'); if (p1n) p1n.textContent = state.p1.name + ' (相手)';
    const p1l = document.getElementById('p1-lp'); if (p1l) { p1l.textContent = state.p1.lp; _updLpColor(p1l, state.p1.lp); }
    // P2 (自分=ゲスト) 情報
    const p2n = document.getElementById('p2-name'); if (p2n) p2n.textContent = state.p2.name + ' (あなた)';
    const p2l = document.getElementById('p2-lp'); if (p2l) { p2l.textContent = state.p2.lp; _updLpColor(p2l, state.p2.lp); }

    // フィールド描画
    _renderGuestZone('p1-monster-zone', state.p1.fieldMonster);
    _renderGuestZone('p1-magic-zone', state.p1.fieldMagic);
    _renderGuestZone('p2-monster-zone', state.p2.fieldMonster);
    _renderGuestZone('p2-magic-zone', state.p2.fieldMagic);

    // 墓地
    _renderGuestGY('p1-graveyard', state.p1.graveyard);
    _renderGuestGY('p2-graveyard', state.p2.graveyard);

    // 手札エリア（ゲスト自身の手札 + 相手手札枚数表示）
    const handEl = document.getElementById('hand-area');
    if (handEl) {
        // 開閉状態を保持
        const wasOpen = !handEl.classList.contains('hand-closed');
        handEl.innerHTML = '';

        const headerEl = document.createElement('div');
        headerEl.className = 'hand-header';
        headerEl.style.position = 'absolute';
        headerEl.style.top = '0';
        headerEl.style.left = '0';
        headerEl.style.width = '100%';
        headerEl.style.display = 'flex';
        headerEl.style.justifyContent = 'space-between';
        headerEl.style.alignItems = 'center';
        headerEl.style.padding = '0 20px';
        headerEl.style.pointerEvents = 'none';
        headerEl.style.zIndex = '200';

        const infoLabel = document.createElement('div');
        infoLabel.style.color = '#fff';
        infoLabel.style.fontSize = '0.8rem';
        infoLabel.style.display = 'flex';
        infoLabel.style.alignItems = 'center';
        infoLabel.innerHTML = `相手の手札: ${state.p1.hand.length}枚 | あなたの手札: ${state.p2.hand.length}枚`;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-hand-toggle';
        toggleBtn.style.padding = '6px 16px';
        toggleBtn.style.borderRadius = '6px';
        toggleBtn.style.background = 'linear-gradient(135deg, #222, #444)';
        toggleBtn.style.color = 'white';
        toggleBtn.style.border = '2px solid #666';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontWeight = 'bold';
        toggleBtn.style.pointerEvents = 'auto';
        toggleBtn.textContent = wasOpen ? '▼ 手札を隠す' : '▲ 手札を見る';
        toggleBtn.onclick = toggleHand;

        headerEl.appendChild(infoLabel);
        headerEl.appendChild(toggleBtn);
        handEl.appendChild(headerEl);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'hand-cards';
        if (!wasOpen) cardsContainer.style.display = 'none';

        state.p2.hand.forEach((card, idx) => {
            const isMyTurn = state.isGuestTurn;
            const actionFn = isMyTurn ? () => _sendOnlineAction({ type: 'play_hand_card', handIndex: idx }) : null;
            const el = _makeGuestCardEl(card, actionFn);

            cardsContainer.appendChild(el);
        });
        handEl.appendChild(cardsContainer);

        if (!wasOpen) handEl.classList.add('hand-closed');
    }

    // スマホ向け：相手の手札の視覚化（ゲスト側は相手=p1）
    if (window.innerWidth <= 768) {
        _renderGuestOppHandVisual('p1', state.p1.hand.length);
        _renderGuestOppHandVisual('p2', 0, true); // 自分側はクリア
    } else {
        _renderGuestOppHandVisual('p1', 0, true);
        _renderGuestOppHandVisual('p2', 0, true);
    }

    // アクションバー
    const bar = document.getElementById('guest-action-bar');
    if (bar) {
        bar.innerHTML = '';
        bar.style.display = 'flex';
        const label = document.createElement('span');
        label.style.cssText = 'color:#00b4d8;font-weight:bold;font-size:0.85rem;';
        label.textContent = state.isGuestTurn ? '🎮 あなたのターン' : '⏳ 相手のターン中...';
        bar.appendChild(label);

        if (state.isGuestTurn && !state.gameOver) {
            // 攻撃ボタン（相手フィールドにモンスターがいる場合）
            if (state.p1.fieldMonster && state.p2.fieldMonster) {
                const atkBtn = document.createElement('button');
                atkBtn.className = 'btn btn-attack';
                atkBtn.textContent = '⚔️ 攻撃';
                atkBtn.onclick = () => _sendOnlineAction({ type: 'attack' });
                bar.appendChild(atkBtn);
            }
            // ターン終了ボタン
            const endBtn = document.createElement('button');
            endBtn.className = 'btn btn-end-turn';
            endBtn.textContent = '✅ ターン終了';
            endBtn.onclick = () => _sendOnlineAction({ type: 'end_turn' });
            bar.appendChild(endBtn);
        }
    }

    // ダイス
    const diceEl = document.getElementById('dice-display');
    if (diceEl && state.dice) diceEl.textContent = `🎲 ${state.dice}`;

    // ログ
    const logEl = document.getElementById('log-container');
    if (logEl && state.logs) {
        logEl.innerHTML = state.logs.map(l => `<div class="log-entry">${l}</div>`).join('');
        logEl.scrollTop = logEl.scrollHeight;
    }

    // ゲームオーバー
    if (state.gameOver) {
        const isWinner = state.winner === state.p2.name;
        document.getElementById('gameover-msg').textContent =
            isWinner ? '🎉 あなたの勝利！' : `💀 ${state.winner} の勝利`;
        document.getElementById('gameover-overlay').style.display = 'flex';
    }
}

// ===== ゲストのカードゾーン描画 =====
function _renderGuestZone(zoneId, card) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;
    if (!card) { zone.innerHTML = '<div class="empty-zone">空き</div>'; return; }
    const el = _makeGuestCardEl(card, null);
    el.style.cursor = 'default';
    zone.innerHTML = '';
    zone.appendChild(el);
}

// ===== ゲストのカードDOM生成 =====
function _makeGuestCardEl(card, onClick) {
    const el = document.createElement('div');
    if (!card) return el;
    let cls = `card ${card.type === CARD_TYPE.MONSTER ? 'card-monster' : 'card-magic'}`;
    if (card.evolved) cls += ' card-evolved';
    el.className = cls;

    let cardColor = '#222';
    if (card.evolved) cardColor = '#800080';
    else if (card.type === CARD_TYPE.MAGIC) cardColor = '#006400';
    else if (card.type === CARD_TYPE.MONSTER) cardColor = '#4682B4';
    el.style.setProperty('--card-color', cardColor);

    const atkDisplay = card.type === CARD_TYPE.MONSTER ? `<div class="card-atk">ATK: ${card.atk}</div>` : '';
    const imgArea = card.imageFile
        ? `<div class="card-img-area"><img src="site/images/members/${card.imageFile}" class="card-photo" alt="${card.name}"></div>`
        : `<div class="card-img-area"><span class="card-emoji-large">${card.emoji || '\u{1F0CF}'}</span></div>`;

    el.innerHTML = `
      <div class="card-header">
        <span class="card-type-badge">${card.type === CARD_TYPE.MONSTER ? 'M' : '\u9b54'}</span>
        <span class="card-emoji">${card.emoji || '\u{1F0CF}'}</span>
        ${card.evolved ? '<span class="evolved-badge">\u9032\u5316</span>' : ''}
      </div>
      ${imgArea}
      <div class="card-name">${card.name}</div>
      ${atkDisplay}
      <div class="card-effect">${card.effect || ''}</div>
    `;

    if (onClick) {
        el.title = 'クリックしてプレイ';
        el.onclick = onClick;
    }
    return el;
}

// ===== 墓地描画（ゲスト用） =====
function _renderGuestGY(gyId, cards) {
    const el = document.getElementById(gyId);
    if (!el) return;
    el.innerHTML = `<span style="font-size:0.7rem;opacity:0.7;">GY:${cards.length}</span>`;
    if (cards.length > 0) {
        const last = cards[cards.length - 1];
        el.innerHTML += `<br><span style="font-size:0.6rem;opacity:0.6;">${last.emoji || '🃏'} ${last.name}</span>`;
    }
}

// ===== LP色更新 =====
function _updLpColor(el, lp) {
    if (lp > 2000) el.style.color = '#00ff88';
    else if (lp > 1000) el.style.color = '#ffaa00';
    else el.style.color = '#ff4444';
}

// ===============================
// UIモーダル制御関係 (ハンバーガー等)
// ===============================
function toggleHamburgerMenu() {
    const overlay = document.getElementById('hamburger-overlay');
    if (!overlay) return;
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

function toggleLogModal() {
    const overlay = document.getElementById('log-modal');
    if (!overlay) return;
    // ハンバーガーメニューを閉じる
    document.getElementById('hamburger-overlay').style.display = 'none';

    // ログの内容を転写
    const originalLog = document.getElementById('log-container');
    const modalLog = document.getElementById('log-modal-container');
    if (originalLog && modalLog) {
        modalLog.innerHTML = originalLog.innerHTML;
        modalLog.scrollTop = modalLog.scrollHeight;
    }

    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

function showCardDetail(card, actionCallback = null, actionText = '使用する', activateCallback = null, activateText = '✨ 効果を発動') {
    const modal = document.getElementById('card-detail-modal');
    const view = document.getElementById('card-detail-view');
    const btnContainer = document.getElementById('card-detail-buttons');
    if (!modal || !view || !card) return;

    // 大きなカード表示用構築
    const isMonster = card.type === CARD_TYPE.MONSTER;

    const imgArea = card.imageFile
        ? `<img src="site/images/members/${card.imageFile}" class="card-photo-detail" alt="${card.name}">`
        : `<span class="card-emoji-large" style="font-size:5rem;">${card.emoji || '\u{1F0CF}'}</span>`;

    // 独立ウィンドウレイアウト
    let html = `
      <div class="detail-split-layout">
        <!-- 左: 画像ウィンドウ -->
        <div class="detail-window image-window">
          ${imgArea}
        </div>

        <!-- 右: 情報ウィンドウ群 -->
        <div class="detail-info-group">
          <!-- 名前ウィンドウ -->
          <div class="detail-window name-window">
            <div class="detail-type-text" style="color:${isMonster ? '#4682B4' : '#006400'}">
              ${isMonster ? '【 モンスター 】' : '【 魔法 】'}
            </div>
            <div class="detail-name-text">${card.name}</div>
            ${isMonster ? `<div class="detail-atk-text">ATK: ${card.atk}</div>` : ''}
          </div>

          <!-- 効果ウィンドウ -->
          <div class="detail-window effect-window">
            <div class="detail-effect-text">${card.effect || '効果なし'}</div>
          </div>

          <!-- アクション用の空コンテナ (JSで後乗せ) -->
          <div class="detail-window action-window" id="inner-action-container"></div>
        </div>
      </div>
    `;

    view.innerHTML = html;

    // 以前の固定ボタンコンテナはクリアする
    if (btnContainer) {
        btnContainer.innerHTML = '';
        btnContainer.style.display = 'none'; // 非表示にする
    }

    // 新たに 右側のアクションウィンドウ内にボタンを展開
    const innerBtnContainer = document.getElementById('inner-action-container');
    if (innerBtnContainer) {
        if (actionCallback) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'btn btn-large btn-action-main';
            actionBtn.textContent = actionText || (isMonster ? '召喚' : '使用');
            actionBtn.onclick = (e) => {
                e.stopPropagation();
                closeCardDetail();
                actionCallback();
            };
            innerBtnContainer.appendChild(actionBtn);
        }

        if (activateCallback) {
            const activateBtn = document.createElement('button');
            activateBtn.className = 'btn btn-large btn-action-activate';
            activateBtn.style.background = 'linear-gradient(135deg, #FF8C00, #FF4500)';
            activateBtn.style.color = '#fff';
            activateBtn.style.border = '2px solid #fff';
            activateBtn.textContent = activateText;
            activateBtn.onclick = (e) => {
                e.stopPropagation();
                closeCardDetail();
                activateCallback();
            };
            innerBtnContainer.appendChild(activateBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-close btn-action-close';
        closeBtn.innerHTML = '✖ 閉じる';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeCardDetail();
        };
        innerBtnContainer.appendChild(closeBtn);
    }

    modal.style.display = 'flex';
}

function closeCardDetail() {
    const modal = document.getElementById('card-detail-modal');
    if (modal) modal.style.display = 'none';
}

function toggleHand() {
    const el = document.getElementById('hand-area');
    if (!el) return;
    if (el.classList.contains('hand-closed')) {
        el.classList.remove('hand-closed');
    } else {
        el.classList.add('hand-closed');
    }
    renderAll();
}

function renderGraveyard() {
    if (!gs) return;

    // Update counts
    const p1Count = document.getElementById('p1-grave-count');
    if (p1Count) p1Count.textContent = gs.player1.graveyard.length;

    const p2Count = document.getElementById('p2-grave-count');
    if (p2Count) p2Count.textContent = gs.player2.graveyard.length;

    // 動的スタイル変更
    const p1Btn = document.querySelector(`button[onclick="showGraveyard('p1')"]`);
    if (p1Btn) {
        if (gs.player1.graveyard.length === 0) {
            p1Btn.style.opacity = '0.5';
            p1Btn.style.background = '#333';
        } else {
            p1Btn.style.opacity = '1';
            p1Btn.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        }
    }

    const p2Btn = document.querySelector(`button[onclick="showGraveyard('p2')"]`);
    if (p2Btn) {
        if (gs.player2.graveyard.length === 0) {
            p2Btn.style.opacity = '0.5';
            p2Btn.style.background = '#333';
        } else {
            p2Btn.style.opacity = '1';
            p2Btn.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        }
    }
}

function showGraveyard(prefix) {
    if (!gs) return;
    const player = (prefix === 'p1') ? gs.player1 : gs.player2;
    const modal = document.getElementById('graveyard-modal');
    const list = document.getElementById('graveyard-list');
    const title = document.getElementById('graveyard-title');

    if (!modal || !list) return;

    title.textContent = `🪦 ${player.name} の墓地 (${player.graveyard.length}枚)`;
    list.innerHTML = '';

    if (player.graveyard.length === 0) {
        list.innerHTML = '<div style="color:#aaa; text-align:center; padding:20px;">墓地にカードはありません</div>';
    } else {
        player.graveyard.forEach((card, idx) => {
            const item = document.createElement('div');
            item.className = 'graveyard-item';
            // カード名と簡易情報を表示
            const isMonster = card.type === CARD_TYPE.MONSTER;
            item.innerHTML = `
                <div class="graveyard-card-name">
                    <span style="color:${isMonster ? '#4682B4' : '#006400'}; font-weight:bold;">
                        ${isMonster ? '[M]' : '[魔]'}
                    </span> 
                    ${card.name}
                </div>
                <div style="font-size:0.8rem; color:#ccc;">${card.effect ? card.effect.substring(0, 30) + '...' : ''}</div>
            `;
            // クリックで詳細表示（オプション）
            item.onclick = (e) => {
                e.stopPropagation();
                showCardDetail(card);
            };
            list.appendChild(item);
        });
    }

    modal.style.display = 'flex';
}

function closeGraveyardModal() {
    const modal = document.getElementById('graveyard-modal');
    if (modal) modal.style.display = 'none';
}

function toggleHand() {
    const el = document.getElementById('hand-area');
    if (!el) return;
    el.classList.toggle('hand-closed');
    const wasOpen = !el.classList.contains('hand-closed');

    const cardsEl = el.querySelector('.hand-cards');
    if (cardsEl) cardsEl.style.display = wasOpen ? 'flex' : 'none';

    const toggleBtn = el.querySelector('.btn-hand-toggle');
    if (toggleBtn) toggleBtn.textContent = wasOpen ? '▲ 閉じる' : '▼ 開く';
}

function toggleLogModal() {
    const modal = document.getElementById('log-modal');
    if (!modal) return;
    // Toggle display
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        // Scroll to bottom when opened
        const logContainer = document.getElementById('log-modal-container');
        if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
    } else {
        modal.style.display = 'none';
    }
}
