// cpu.js - CPU思考ルーチンとターン処理

const CPU_DELAY_MS = 1500; // 人間が視認可能なようなディレイ

async function processCPUTurn(gs) {
    if (!gs || gs.gameOver || gs.currentPlayer.isHuman) return;

    gs.log(`🤖 CPUが思考中...`);

    // ループ暴走検知用
    let loopCount = 0;
    const MAX_LOOP = 50;

    // フェイズに応じた行動をループで処理
    while (!gs.gameOver && gs.currentPlayer === gs.player2 && !gs.currentPlayer.isHuman && loopCount < MAX_LOOP) {
        loopCount++;
        await wait(CPU_DELAY_MS);

        if (gs.phase === PHASE.DRAW) {
            // ドローフェイズはDoStartTurnで既に終わってMAINに遷移しているはずなので何もしない
            // 念のため
            gs.phase = PHASE.MAIN;
            renderPhase(gs.phase);
        } else if (gs.phase === PHASE.MAIN) {
            const action = chooseMainPhaseAction(gs);
            if (action && action.type !== 'END_PHASE') {
                // 無限ループ防止のため手札が減らなかったり場が変わらなかった場合はスキップ等の対応が必要だが、
                // MAX_LOOPを超えたら強制終了させるようにした
                await evaluateAndExecuteAction(gs, action);
            } else {
                // アクションがない場合はバトルフェイズへ
                gs.phase = PHASE.BATTLE;
                renderPhase(gs.phase);
            }
        } else if (gs.phase === PHASE.BATTLE) {
            const action = chooseBattlePhaseAction(gs);
            if (action && action.type !== 'END_PHASE') {
                await evaluateAndExecuteAction(gs, action);
            } else {
                // アクションがない、またはフェイズ終了の場合はエンドターンへ
                await endTurn(true);
                break; // ターン終了なのでループを抜ける
            }
        } else {
            break;
        }
    }

    if (loopCount >= MAX_LOOP) {
        console.error("CPU loop ran away! Forcing end turn.");
        await endTurn(true);
    }
}

// 待機関数
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// メインフェイズの行動を選択
function chooseMainPhaseAction(gs) {
    const cpu = gs.currentPlayer;
    const actions = [];

    // 1. 手札のカードを使用するアクションの収集
    for (let i = 0; i < cpu.hand.length; i++) {
        const card = cpu.hand[i];

        // 使用条件を満たしているか
        if (card.canUse(gs, cpu)) {
            // モンスターカードは1ターン1枚のみ
            if (card.type === CARD_TYPE.MONSTER && gs.monsterUsedThisTurn) {
                continue;
            }
            // 空きスロットがあるか
            let hasSlot = false;
            if (card.type === CARD_TYPE.MONSTER) {
                hasSlot = getFirstEmptySlot(cpu.fieldMonster) !== -1;
            } else if (card.type === CARD_TYPE.MAGIC) {
                hasSlot = getFirstEmptySlot(cpu.fieldMagic) !== -1;
            }

            if (hasSlot) {
                actions.push({
                    type: 'USE_CARD',
                    cardIndex: i,
                    card: card,
                    score: scoreCardUse(gs, cpu, card)
                });
            }
        }
    }

    // 2. フェイズ終了(何もしない)アクション
    actions.push({
        type: 'END_PHASE',
        score: 10 // 基本スコア。他に良い手がなければフェイズを終える
    });

    return selectActionByDifficulty(gs, actions);
}

// バトルフェイズの行動を選択
function chooseBattlePhaseAction(gs) {
    const cpu = gs.currentPlayer;
    const actions = [];

    // モンスターが居て、まだ攻撃していないなら攻撃可能
    const myMonster = cpu.fieldMonster[0];
    const canAttackTurn = !(gs.isFirstTurn && cpu === gs.firstPlayer); // 先攻1ターン目は攻撃不可

    if (myMonster && !gs.attackDeclaredThisTurn && canAttackTurn) {
        const myAtk = cpu.getEffectiveAtk(gs, 0);
        const oppMonster = gs.opponentPlayer.fieldMonster[0];

        if (oppMonster) {
            const oppAtk = gs.opponentPlayer.getEffectiveAtk(gs, 0);

            // 相手モンスターへの攻撃アクション
            let score = 0;
            if (myAtk >= oppAtk) {
                // 勝てるか相打ちなら基本攻撃する（有利盤面の維持）
                score = 100 + (myAtk - oppAtk);
                // ダメージが十分大きい場合
                if (gs.opponentPlayer.lp <= (myAtk - oppAtk)) {
                    score += 10000; // 即勝利
                }
            } else {
                // 負ける場合は基本攻撃しない（自爆）
                score = -100;
            }

            actions.push({
                type: 'ATTACK_MONSTER',
                targetIndex: 0,
                score: score
            });
        } else {
            // 直接攻撃
            let score = 200 + myAtk;
            if (gs.opponentPlayer.lp <= myAtk) {
                score += 10000; // 即勝利
            }
            actions.push({
                type: 'DIRECT_ATTACK',
                score: score
            });
        }
    }

    // 攻撃しない（フェイズ終了）アクション
    actions.push({
        type: 'END_PHASE',
        score: 50 // 負ける攻撃をするくらいならターンを終える
    });

    return selectActionByDifficulty(gs, actions);
}

// 難易度（NORMAL）に基づいたアクション選択
function selectActionByDifficulty(gs, actions) {
    if (actions.length === 0) return null;
    if (actions.length === 1) return actions[0];

    // スコア順に降順ソート
    actions.sort((a, b) => b.score - a.score);

    // マイナススコアの行動を除外（自爆などの明らかなミスはしない）
    let validActions = actions.filter(a => a.score >= 0);
    if (validActions.length === 0) return null; // 全部マイナスなら何もしない

    // プレイヤーが劣勢かどうかの判定（CPUのLPがプレイヤーより2000以上多い、またはプレイヤーの盤面が空でLP1500未満）
    const player = gs.player1;
    const cpu = gs.player2;
    const isPlayerLosing = (cpu.lp - player.lp > 2000) || (!player.fieldMonster[0] && player.lp < 1500);

    let bestProb = 0.70;
    let secondProb = 0.20;
    let randomProb = 0.10;

    // 救済バランス: プレイヤーが劣勢の場合、ランダム行動（最適でない行動）の割合を増やす（「減らす」という記述もあったが接待バランスとして次善・ランダムを増やす解釈）
    // 逆に「明確なミスはしない」ので完全ランダムよりは次善手を増やす
    if (isPlayerLosing && validActions.length > 1) {
        bestProb = 0.50;
        secondProb = 0.40;
        randomProb = 0.10;
    }

    const rand = Math.random();

    // 1位のアクション
    if (rand < bestProb || validActions.length === 1) {
        return validActions[0];
    }

    // 2位のアクション
    if (rand < bestProb + secondProb && validActions.length > 1) {
        return validActions[1];
    }

    // ランダム（3位以下からランダム。なければ2位）
    if (validActions.length > 2) {
        const randomIdx = Math.floor(Math.random() * (validActions.length - 2)) + 2;
        return validActions[randomIdx];
    } else {
        return validActions[1];
    }
}

// カードのプレイスコア評価（盤面維持・将来性・コスト効率など）
function scoreCardUse(gs, cpu, card) {
    let score = 50; // 基本スコア

    const myMonster = cpu.fieldMonster[0];
    const oppMonster = gs.opponentPlayer.fieldMonster[0];
    const myAtk = myMonster ? cpu.getEffectiveAtk(gs, 0) : 0;
    const oppAtk = oppMonster ? gs.opponentPlayer.getEffectiveAtk(gs, 0) : 0;

    if (card.type === CARD_TYPE.MONSTER) {
        // モンスターがいない場合は召喚優先度高
        if (!myMonster) {
            score += 150;
            if (card.atk > oppAtk) {
                score += 100; // 相手を倒せるならさらに高い
            }
        } else if (card.evolved && card.costCardId) {
            // 上位進化可能な場合
            score += 200; // 基本的に進化は強いので優先
        } else if (card.atk > myAtk) {
            // より強いモンスターを出せる場合（ただし現状1枠なので通常は出せない。上書きルールなら）
            score += 50;
        }
    } else if (card.type === CARD_TYPE.MAGIC) {
        // 魔法カードの個別評価
        if (card.id === CARD_ID.ROBOT_ARMSPIN) {
            // 相手モンスターがいるなら破壊優先
            if (oppMonster) {
                score += 180 + oppAtk; // 相手が強いほど破壊価値が高い
            } else {
                score -= 100; // 空撃ち防止
            }
        } else if (card.id === CARD_ID.ROBOT_ROBOLASER) {
            // ハンデス：相手の手札が多いほど優先
            if (gs.opponentPlayer.hand.length >= 2) {
                score += 120;
            } else if (gs.opponentPlayer.hand.length === 1) {
                score += 80;
            } else {
                score -= 50;
            }
        } else if (card.id === CARD_ID.HIMI_HIGH || card.id === CARD_ID.MAGIC_DRAW) {
            // ドロー・サーチ：自分の手札が少ないほど優先
            if (cpu.hand.length <= 2) {
                score += 160;
            } else {
                score += 80;
            }
        } else if (card.id === CARD_ID.TSUMA) {
            // HP回復：ダメージを受けているほど優先
            const damageTaken = 4000 - cpu.lp;
            score += damageTaken > 1500 ? 150 : 50;
        } else {
            // その他のバフ魔法など
            score += 60;
            if (myMonster && oppMonster && myAtk <= oppAtk) {
                score += 100; // 戦闘で負けているならバフ優先
            }
        }
    }

    return score;
}

// アクションの実行（game.jsの非同期関数を呼び出す）
async function evaluateAndExecuteAction(gs, action) {
    if (action.type === 'USE_CARD') {
        gs.log(`🤖 CPU Action: [${action.card.name}] を使用します (Score: ${action.score})`);
        await useCard(action.cardIndex, true);
    } else if (action.type === 'ATTACK_MONSTER') {
        gs.log(`🤖 CPU Action: 相手モンスターに攻撃します (Score: ${action.score})`);
        // attack processing needs target elements or direct function call
        // 攻撃対象を選択してdeclareAttackを呼ぶ
        await declareAttack(0, action.targetIndex, true);
    } else if (action.type === 'DIRECT_ATTACK') {
        gs.log(`🤖 CPU Action: プレイヤーに直接攻撃します (Score: ${action.score})`);
        await declareAttack(0, -1, true);
    } else if (action.type === 'END_PHASE') {
        // フェイズ終了は呼び出し元で処理
    }
}
