const fs = require('fs');
let content = fs.readFileSync('cards.js', 'utf8');

// Update TEQUILA
content = content.replace(
    /name: 'テキーラリボルバーショット',[ \s\S]*?effect: '100~1000のランダムダメージ',[ \s\S]*?onPlay: \(gs, owner\) => \{[\s\S]*?\}\s*\}/,
    
ame: 'テキーラリボルバーショット',
    type: CARD_TYPE.MAGIC,
    effect: '相手プレイヤーのライフポイントに500のダメージをあたえる。',
    color: '#330000',
    emoji: '🔫',
    imageFile: 'TEQUILA.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      opponent.lp -= 500;
      if (opponent.lp < 0) opponent.lp = 0;
      gs.log(\【\】テキーラリボルバーショット！500ダメージ！(LP:\)\);
    }
  }
);

// Add new IDs (after RECEDING_HAIRLINE)
content = content.replace(
    /RECEDING_HAIRLINE: 'receding_hairline',/,
    \RECEDING_HAIRLINE: 'receding_hairline',
  ZOMBIE_KATSUNORI: 'zombie_katsunori',
  TAKAOKA_KAERE: 'takaoka_kaere',
  GEKIBUTORI: 'gekibutori',\
);

// Add ZOMBIE_KATSUNORI
content = content.replace(
    /export const MONSTER_CARDS = \[/,
    \export const MONSTER_CARDS = [
  {
    id: CARD_ID.ZOMBIE_KATSUNORI,
    name: 'ゾンビ・カツノリ',
    type: CARD_TYPE.MONSTER,
    atk: 1500,
    effect: 'このカードが手札から墓地に捨てられた時、自分はデッキから1枚ドローする。さらに、自分の墓地のカードを3枚除外することで、このカードを墓地からフィールドに特殊召喚できる。',
    color: '#3a5f41',
    emoji: '🧟',
    imageFile: 'zombie_katsunori.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(\【\】ゾンビ・カツノリを召喚！(ATK:1500)\);
    },
    onDiscard: (gs, owner) => {
      gs.drawCard(owner);
      gs.log(\【\】ゾンビ・カツノリが捨てられ、1枚ドローした！\);
    }
  },\
);

// Add TAKAOKA_KAERE and GEKIBUTORI
content = content.replace(
    /export const MAGIC_CARDS = \[/,
    \export const MAGIC_CARDS = [
  {
    id: CARD_ID.TAKAOKA_KAERE,
    name: '高岡信二「お前もう帰れ」',
    type: CARD_TYPE.MAGIC,
    effect: '相手フィールドのモンスター1体を選び、持ち主の手札に戻す。',
    color: '#333333',
    emoji: '🚪',
    imageFile: '',
    canUse: (gs, player) => {
      const opponent = gs.getOpponent(player);
      return opponent.fieldMonster.some(m => m !== null);
    },
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      const targetList = opponent.fieldMonster.filter(m => m !== null);
      if (targetList.length > 0) {
        // 現在は1スロット前提のため0番目を戻す
        const target = opponent.fieldMonster[0];
        opponent.hand.push(target);
        opponent.fieldMonster[0] = null;
        gs.log(\【\】高岡信二「お前もう帰れ」！相手の「\」を手札に戻した！\);
      }
    }
  },
  {
    id: CARD_ID.GEKIBUTORI,
    name: '激太り',
    type: CARD_TYPE.MAGIC,
    effect: '1ターンの間、自分フィールドのモンスターの攻撃力を2倍にする。ただし、1ターン後にそのカードの攻撃力は半分になる。',
    color: '#e8cfa6',
    emoji: '🍔',
    imageFile: '',
    canUse: (gs, player) => player.fieldMonster[0] !== null,
    onPlay: (gs, owner) => {
      const target = owner.fieldMonster[0];
      if (target) {
        const bonus = target.atk; // 2倍にするため、ベースATK分を一時ボーナスとして付与
        target.tempAtkBonus = (target.tempAtkBonus || 0) + bonus;
        gs.log(\【\】激太り！「\」の攻撃力が2倍になった！\);
        
        // 1ターン後に半分にする遅延効果（ゲームの進行処理に合わせて調整）
        gs.delayedEffects.push({
            type: 'gekibutori_debuff',
            targetPlayer: owner,
            targetCardId: target.id,
            countdown: 2, // 相手ターン、自分ターンと跨ぐため
            execute: (gsInstance) => {
                const currentMonster = owner.fieldMonster[0];
                if (currentMonster && currentMonster.id === target.id) {
                    currentMonster.permanentAtkPenalty = (currentMonster.permanentAtkPenalty || 0) + Math.floor(currentMonster.atk / 2);
                    gsInstance.log(\激太りの副作用！「\」の攻撃力が半分に（-\）！\);
                }
            }
        });
      }
    }
  },\
);

const mapping = {
    '最強のふたり': 'double.png',
    '川北の花火に': 'kawakita.PNG',
    '復活演出': 'enshutu.jpg',
    '破壊されたカップ麺': 'cup.png',
    '後退した前髪': 'koutai.png',
    '着払いの名所 コルティレ': 'koru.jpeg',
    '堀江家の焼酎': 'shoutyuu.jpg',
    '動物園展示物 カツノリくん': 'katsunorikun.jpg',
    'ハットリ会の足 ハスラー': 'husler.png',
    '愛を知る男 上出 瑠星': 'ai.png',
    '新幹線': 'sinkansen.jpg',
    '聖夜のコンビニ店員': 'christmas.jpg',
    'ヴィジョンを盗みし者': 'vision_stealer.png',
    '伏木のヤクザ': 'hushiki.png',
    '温泉卵ソフト': 'onsen.png',
    'イッちゃってる！？': 'iki.jpg'
};

for (const [name, img] of Object.entries(mapping)) {
    const regex = new RegExp(\(name:\\s*'\',[\\s\\S]*?imageFile:\\s*)'[^']*'\);
    content = content.replace(regex, \\'\'\);
}

fs.writeFileSync('cards.js', content, 'utf8');
