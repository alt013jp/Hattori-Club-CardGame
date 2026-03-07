// ===========================
// cards.js - カードデータ定義
// ===========================

// カードタイプ定数
const CARD_TYPE = {
  MONSTER: 'monster',
  MAGIC: 'magic'
};

// カードID定数
const CARD_ID = {
  // 基本モンスター
  YANAGI: 'yanagi',
  KAKUCHI: 'kakuchi',
  HORIE: 'horie',
  KAMIDE: 'kamide',
  MICHISHITA: 'michishita',
  HASHIMOTO: 'hashimoto',
  TAKAOKA: 'takaoka',
  YELLOW_G: 'yellow_g',
  // 新規モンスター
  CURTAIN: 'curtain',
  TAKAMORI_SEITA: 'takamori_seita',
  ROBOT: 'robot',
  HATTORI_HQ: 'hattori_hq',
  TWIN_DRAGON: 'twin_dragon',
  ULTRAMAN: 'ultraman',
  DARK_HASHIMOTO: 'dark_hashimoto',
  ULTIMATE_PACHINKO: 'ultimate_pachinko',
  POOH: 'pooh', // 新規
  RESEARCHER: 'researcher', // 新規
  // 進化モンスター
  VISION_YANAGI: 'vision_yanagi',
  PACHINKO_KAKUCHI: 'pachinko_kakuchi',
  CURTAIN_HASHIMOTO: 'curtain_hashimoto',
  KINEN_MICHISHITA: 'kinen_michishita',
  AI_KAMIDE: 'ai_kamide',
  JOSOU_HORIE: 'josou_horie',
  // 魔法（既存）
  YANI_JACKET: 'yani_jacket',
  YANI_BREAK: 'yani_break',
  YELLOW_PARK: 'yellow_park',
  HOMERUN: 'homerun',
  TAIYO_NEO: 'taiyo_neo',
  HIMI_HIGH: 'himi_high',
  HATTORI_CLUB: 'hattori_club',
  KIMOKUSA: 'kimokusa',
  TEQUILA: 'tequila',
  CHIKU: 'chiku',
  // 魔法（新規）
  JOSOU_GEAR: 'josou_gear',
  STARBUCKS: 'starbucks',
  WELCOME_GERO: 'welcome_gero',
  POKAPON: 'pokapon',
  TIKTOKER_KAMIDE: 'tiktoker_kamide',
  NIWARIBIKI: 'niwaribiki', // 新規
  BATCHIIKE: 'batchiike', // 新規
  YANAGI_HAND: 'yanagi_hand', // 新規
  DEBUG_DRAW: 'debug_draw', // デバッグ用
  // 追加リクエスト分 (Phase 36)
  TAKAMORI_TERRY: 'takamori_terry',
  YANAGI_INCINEROAR: 'yanagi_incineroar',
  KAKUCHI_BANJO: 'kakuchi_banjo',
  HORIE_SHOCHU: 'horie_shochu',
  RECEDING_HAIRLINE: 'receding_hairline',
  ZOMBIE_KATSUNORI: 'zombie_katsunori',
  TAKAOKA_KAERE: 'takaoka_kaere',
  GEKIBUTORI: 'gekibutori',
  // 追加リクエスト分
  TAKAMORI_MEDIA: 'takamori_media',
  ROBOT_ARMSPIN: 'robot_armspin',
  ROBOT_ROBOLASER: 'robot_robolaser',
  T_SHIRT_MICHISHITA: 't_shirt_michishita',
  T_SHIRT_HORIE: 't_shirt_horie',
  RO_KUN: 'ro_kun',
  // 追加リクエスト分 (Phase 30)
  ZOO_KATSUNORI: 'zoo_katsunori',
  SHINKANSEN: 'shinkansen',
  HOLY_NIGHT_CLERK: 'holy_night_clerk',
  HUSTLER: 'hustler',
  VISION_THIEF: 'vision_thief',
  FIREWORKS: 'fireworks',
  CORTILE: 'cortile',
  // 追加リクエスト分 (Phase 6)
  NINPU: 'ninpu',
  KAIJUU: 'kaijuu',
  ITCHATTERU: 'itchatteru',
  TACHISHON: 'tachishon',
  GAY: 'gay'
};

// ===============================
// モンスターカード定義
// ===============================
const MONSTER_CARDS = [
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
      gs.log(`【${owner.name}】ゾンビ・カツノリを召喚！(ATK:1500)`);
    },
    onDiscard: (gs, owner) => {
      gs.drawCard(owner);
      gs.log(`【${owner.name}】ゾンビ・カツノリが捨てられ、1枚ドローした！`);
    }
  },
  // ===== 基本モンスター =====
  {
    id: CARD_ID.YANAGI,
    name: '柳 克憲',
    type: CARD_TYPE.MONSTER,
    atk: 1500,
    effect: '装備「VISION ヤニくさいジャケット」で次戦闘+300',
    color: '#8B4513',
    emoji: '??',
    imageFile: 'yanagi.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】柳 克憲を召喚！(ATK:1500)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.KAKUCHI,
    name: '角地 駿汰',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: '攻撃時にダイスを振り5~6でその戦闘に必ず勝利する。',
    color: '#4B0082',
    emoji: '??',
    imageFile: 'kakuchi.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】角地 駿汰を召喚！(ATK:1200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.HORIE,
    name: '堀江 俊郎',
    type: CARD_TYPE.MONSTER,
    atk: 1300,
    effect: '墓地に上出 瑠星がいれば+500',
    color: '#2F4F4F',
    emoji: '??',
    imageFile: 'horie.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const hasKamide = owner.graveyard.some(c => c.id === CARD_ID.KAMIDE || c.id === CARD_ID.AI_KAMIDE);
      if (hasKamide) {
        owner.fieldMonster[0].tempAtkBonus = (owner.fieldMonster[0].tempAtkBonus || 0) + 500;
        gs.log(`【${owner.name}】墓地に上出 瑠星がいるため堀江 俊郎のATK+500！`);
      }
      gs.log(`【${owner.name}】堀江 俊郎を召喚！(ATK:${1300 + (owner.fieldMonster[0]?.tempAtkBonus || 0)})`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.KAMIDE,
    name: '上出 瑠星',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: '相手が堀江 俊郎使用時1ドロー',
    color: '#006400',
    emoji: '??',
    imageFile: 'kamide.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】上出 瑠星を召喚！(ATK:1000)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.MICHISHITA,
    name: '道下 政功',
    type: CARD_TYPE.MONSTER,
    atk: 800,
    effect: '破壊成功時ATK+600（永続・スタック可）/ 戦闘では破壊されない',
    color: '#8B0000',
    emoji: '???',
    imageFile: 'michishita.jpg',
    indestructible: true,
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】道下 政功を召喚！(ATK:${800 + (owner.fieldMonster?.permanentAtkBonus || 0)})`);
      gs.log(`  ※ 戦闘では破壊されない。破壊成功時ATK+600（永続スタック）`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.HASHIMOTO,
    name: '橋本 泰成',
    type: CARD_TYPE.MONSTER,
    atk: 2000,
    effect: 'このカードは戦闘を一度終えると勝敗に関わらず墓地に送られる',
    color: '#4682B4',
    emoji: '??',
    imageFile: 'hashimoto.jpg',
    oneTimeAttacker: true, // 戦闘後自壊フラグ
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】橋本 泰成を召喚！(ATK:2000)`);
      gs.log(`  ※ 戦闘終了後に墓地へ送られます`);
    },
    onDestroy: null // 戦闘後の処理は game.js で行う
  },
  {
    id: CARD_ID.TAKAOKA,
    name: '高岡 信二',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'なし',
    color: '#556B2F',
    emoji: '??',
    imageFile: 'S__53739759.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】高岡 信二を召喚！(ATK:1200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.YELLOW_G,
    name: 'イエローパークのG',
    type: CARD_TYPE.MONSTER,
    atk: 400,
    effect: '柳 克憲に必勝（柳 克憲との戦闘は必ず勝利）',
    color: '#DAA520',
    emoji: '??',
    imageFile: 'goki.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】イエローパークのGを召喚！(ATK:400)`);
    },
    onDestroy: null
  },

  // ===== 新規モンスター =====
  {
    id: CARD_ID.CURTAIN,
    name: '破壊されたカーテン',
    type: CARD_TYPE.MONSTER,
    atk: 800,
    effect: '召喚時：柳 克憲を1枚手札に加える',
    color: '#3d2200',
    emoji: '??',
    imageFile: 'curtain.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const yanagi = Object.assign({}, MONSTER_CARDS.find(c => c.id === CARD_ID.YANAGI));
      owner.hand.push(yanagi);
      gs.log(`【${owner.name}】破壊されたカーテン召喚！柳 克憲を手札に加えた！`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.TAKAMORI_SEITA,
    name: '高森 政汰',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: "召喚時：1st Single 'HATTORI CLUB'を1枚手札に加える",
    color: '#1a3300',
    emoji: '??',
    imageFile: 'takamori.jpg', // 既存画像
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const hc = Object.assign({}, MAGIC_CARDS.find(c => c.id === CARD_ID.HATTORI_CLUB));
      if (hc) { owner.hand.push(hc); gs.log(`【${owner.name}】高森 政汰召喚！HATTORI CLUBを手札に加えた！`); }
      else gs.log(`【${owner.name}】高森 政汰召喚！(ATK:1000)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.ROBOT,
    name: 'ハシモトのロボット',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'なし',
    color: '#334455',
    emoji: '??',
    imageFile: 'robot.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ロボットを召喚！(ATK:1200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.ZOO_KATSUNORI,
    name: '動物園展示物 カツノリくん',
    type: CARD_TYPE.MONSTER,
    atk: 1900,
    effect: 'このカードは戦闘を一度終えると自動的に破壊される。',
    color: '#a0522d',
    emoji: '🐰',
    imageFile: 'katsunorikun.jpg',
    oneTimeAttacker: true,
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】動物園展示物 カツノリくんを召喚！(ATK:1900)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.SHINKANSEN,
    name: '新幹線',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'このカードは相手モンスターとの戦闘では2回まで破壊されない。（魔法カードでは破壊される）',
    color: '#ffffff',
    emoji: '🚄',
    imageFile: 'sinkansen.jpg',
    battleResist: 2, // 戦闘破壊耐性カウンタ（game.jsで処理）
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】新幹線を召喚！(ATK:1200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.HOLY_NIGHT_CLERK,
    name: '聖夜のコンビニ店員',
    type: CARD_TYPE.MONSTER,
    atk: 1400,
    effect: 'なし',
    color: '#00ced1',
    emoji: '🏪',
    imageFile: 'christmas.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】聖夜のコンビニ店員を召喚！(ATK:1400)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.HUSTLER,
    name: 'ハットリ会の足 ハスラー',
    type: CARD_TYPE.MONSTER,
    atk: 800,
    effect: 'このカードが召喚された場合、ランダムに2枚カードを手札に加える。',
    color: '#dc143c',
    emoji: '🚗',
    imageFile: 'husler.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ハットリ会の足 ハスラーを召喚！効果でデッキから2枚ドロー！`);
      gs.drawCard(owner);
      gs.drawCard(owner);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.VISION_THIEF,
    name: 'ヴィジョンを盗みし者',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: 'このカードがモンスターカードゾーンに出ているときに、自分のターンに1回のみ発動可能、相手の手札を１枚ランダムに選び、それを自分の手札に加える。',
    color: '#8a2be2',
    emoji: '👁️',
    imageFile: 'vision_stealer.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ヴィジョンを盗みし者を召喚！(ATK:1000)`);
      // 起動効果なので、カードの横にボタンを置くか、毎ターン自動処理（onTurnStart等が必要）。
      // 簡単のため、今回は実装計画通り game.js の「カード詳細ダイアログ」からの起動などに組み込むためフラグを持たせる。
      if (owner.fieldMonster) {
        owner.fieldMonster.canStealHand = true;
        owner.fieldMonster.hasStolenThisTurn = false;
      }
    },
    onDestroy: null
  },
  {
    id: CARD_ID.HATTORI_HQ,
    name: 'ハットリ会本部',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: '墓地に送られた時：HATTORIと名のつくカードを1枚ランダムで手札に加える',
    color: '#2a0033',
    emoji: '???',
    imageFile: 'honbu.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ハットリ会本部を召喚！(ATK:1200)`);
    },
    onDestroy: (gs, owner) => {
      const hattoriCards = ALL_CARDS.filter(c =>
        c.name.includes('HATTORI') || c.name.includes('ハットリ')
      );
      if (hattoriCards.length > 0) {
        const pick = Object.assign({}, hattoriCards[Math.floor(Math.random() * hattoriCards.length)]);
        owner.hand.push(pick);
        gs.log(`【${owner.name}】ハットリ会本部の効果！${pick.name}を手札に加えた！`);
      }
    }
  },
  {
    id: CARD_ID.TWIN_DRAGON,
    name: 'ツインドラゴン',
    type: CARD_TYPE.MONSTER,
    atk: 1400,
    effect: '上出 瑠星との対戦では必ず勝利する',
    color: '#003366',
    emoji: '??',
    imageFile: 'twin-dragon.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ツインドラゴンを召喚！(ATK:1400)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.ULTRAMAN,
    name: 'ULTRAMAN IN KANAZAWA',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: '通常モンスター(ATK:1000)として使用可 / または手札から捨てて：柳 克憲を1枚手札に加える',
    color: '#003399',
    emoji: '??',
    imageFile: 'ULTRAMAN IN KANAZAWA.png',
    canUse: (gs, player) => true,
    quickEffect: true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ULTRAMAN IN KANAZAWAを召喚！(ATK:1000)`);
    },
    onDiscard: (gs, owner) => {
      const yanagi = Object.assign({}, MONSTER_CARDS.find(c => c.id === CARD_ID.YANAGI));
      owner.hand.push(yanagi);
      gs.log(`【${owner.name}】ULTRAMAN IN KANAZAWAを捨てて発動！柳 克憲を手札に加えた！`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.DARK_HASHIMOTO,
    name: '闇に潜む者 ハシモト',
    type: CARD_TYPE.MONSTER,
    atk: 1400,
    effect: 'このカードが破壊された時：橋本 泰成を手札に1枚加える',
    color: '#1a0033',
    emoji: '??',
    imageFile: 'yami.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】闇に潜む者 ハシモトを召喚！(ATK:1400)`);
    },
    onDestroy: (gs, owner) => {
      const hashi = Object.assign({}, MONSTER_CARDS.find(c => c.id === CARD_ID.HASHIMOTO));
      if (hashi) {
        owner.hand.push(hashi);
        gs.log(`【${owner.name}】闇に潜む者 ハシモトの効果！橋本 泰成を手札に加えた！`);
      }
    }
  },
  {
    id: CARD_ID.ULTIMATE_PACHINKO,
    name: '究極のパチンカス',
    type: CARD_TYPE.MONSTER,
    atk: 3500,
    effect: '手札の柳克憲・角地駿汰・橋本泰成をそれぞれ1枚捨てて召喚',
    color: '#330055',
    emoji: '??',
    imageFile: 'kyuukyoku.jpg',
    canUse: (gs, player) => {
      const h = player.hand;
      return h.some(c => c.id === CARD_ID.YANAGI)
        && h.some(c => c.id === CARD_ID.KAKUCHI)
        && h.some(c => c.id === CARD_ID.HASHIMOTO);
    },
    onPlay: (gs, owner) => {
      [CARD_ID.YANAGI, CARD_ID.KAKUCHI, CARD_ID.HASHIMOTO].forEach(id => {
        const idx = owner.hand.findIndex(c => c.id === id);
        if (idx !== -1) {
          const cost = owner.hand.splice(idx, 1)[0];
          owner.graveyard.push(cost);
        }
      });
      gs.log(`【${owner.name}】柳克憲・角地駿汰・橋本泰成を捨てて → 究極のパチンカス降臨！(ATK:3500)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.POOH,
    name: '一戦必勝 プーさん',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'なし',
    color: '#FFD700',
    emoji: '??',
    imageFile: 'issen.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】一戦必勝 プーさんを召喚！(ATK:1200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.RESEARCHER,
    name: '謎の研究者',
    type: CARD_TYPE.MONSTER,
    atk: 600,
    effect: '召喚時：攻撃力2000以上のカードをランダムに手札に加える',
    color: '#008B8B',
    emoji: '?????',
    imageFile: 'nazo.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const targets = ALL_CARDS.filter(c => c.atk >= 2000); // 魔法カードはatk undefinedでfalse
      if (targets.length > 0) {
        const pick = Object.assign({}, targets[Math.floor(Math.random() * targets.length)]);
        owner.hand.push(pick);
        gs.log(`【${owner.name}】謎の研究者！${pick.name}を手札に加えた！`);
      } else {
        gs.log(`【${owner.name}】謎の研究者（対象なし）`);
      }
    },
    onDestroy: null
  },

  // ===== 上位進化モンスター =====
  // canUse条件緩和：手札に持っている OR 場にいる
  {
    id: CARD_ID.VISION_YANAGI,
    name: 'ヤニ臭さを極めし者 柳 克憲',
    type: CARD_TYPE.MONSTER,
    atk: 2200,
    effect: '柳 克憲を手札から捨てる、または場の柳 克憲を墓地に送って使用',
    color: '#1a0033',
    emoji: '???',
    imageFile: 'vision of the end.png',
    evolved: true,
    costCardId: CARD_ID.YANAGI,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.YANAGI) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.YANAGI),
    onPlay: (gs, owner) => {
      // コスト処理は useMonsterCard で一括で行う（進化ロジック変更）
      gs.log(`【${owner.name}】VISION OF THE END 柳 克憲召喚！(ATK:2200)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.PACHINKO_KAKUCHI,
    name: 'PACHINKO MASTER 角地 駿汰',
    type: CARD_TYPE.MONSTER,
    atk: 1800,
    effect: '角地 駿汰を手札から捨てる、または場の角地 駿汰を墓地に送って使用。ダイス全て6',
    color: '#8B008B',
    emoji: '??',
    imageFile: 'PACHINKO MASTER.jpg',
    evolved: true,
    costCardId: CARD_ID.KAKUCHI,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.KAKUCHI) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.KAKUCHI),
    onPlay: (gs, owner) => {
      gs.diceForceMaxOwner = owner; // 自分が振る時のみ6になる
      gs.log(`【${owner.name}】PACHINKO MASTER 角地 駿汰！ダイス全て6！(ATK:1800)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.CURTAIN_HASHIMOTO,
    name: 'カーテンの破壊者 橋本 泰成',
    type: CARD_TYPE.MONSTER,
    atk: 3000,
    effect: '橋本 泰成を手札から捨てる、または場の橋本 泰成を墓地に送って使用。勝利時追加1000ダメージ',
    color: '#002244',
    emoji: '?',
    imageFile: 'breaker.jpg',
    evolved: true,
    costCardId: CARD_ID.HASHIMOTO,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.HASHIMOTO) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.HASHIMOTO),
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】カーテンの破壊者 橋本 泰成召喚！勝利時+1000ダメージ！(ATK:3000)`);
    },
    onBattleWin: (gs, owner, opponent) => {
      opponent.lp -= 1000;
      if (opponent.lp < 0) opponent.lp = 0;
      gs.log(`【${owner.name}】カーテンの破壊者 追加1000ダメージ！(相手LP:${opponent.lp})`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.KINEN_MICHISHITA,
    name: '禁煙に失敗せし者 道下 政功',
    type: CARD_TYPE.MONSTER,
    atk: 2000,
    effect: '道下 政功を手札から捨てる、または場の道下 政功を墓地に送って使用。ヤニ休憩回復量+1000',
    color: '#5c0000',
    emoji: '??',
    imageFile: 'kinnenn.png',
    evolved: true,
    costCardId: CARD_ID.MICHISHITA,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.MICHISHITA) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.MICHISHITA),
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】禁煙に失敗せし者 道下 政功召喚！(ATK:2000)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.AI_KAMIDE,
    name: '愛を知る男 上出 瑠星',
    type: CARD_TYPE.MONSTER,
    atk: 1900,
    effect: '上出 瑠星を手札から捨てる、または場の上出 瑠星を墓地に送って使用。墓地に堀江がいれば+1000',
    color: '#003322',
    emoji: '🧔',
    imageFile: 'ai.png',
    evolved: true,
    costCardId: CARD_ID.KAMIDE,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.KAMIDE) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.KAMIDE),
    onPlay: (gs, owner) => {
      const hasHorie = owner.graveyard.some(c => c.id === CARD_ID.HORIE || c.id === CARD_ID.JOSOU_HORIE);
      if (hasHorie) {
        owner.fieldMonster[0].tempAtkBonus = (owner.fieldMonster[0].tempAtkBonus || 0) + 1000;
        gs.log(`【${owner.name}】墓地に堀江 俊郎がいるため愛を知る男のATK+1000！`);
      }
      gs.log(`【${owner.name}】愛を知る男 上出 瑠星召喚！(ATK:${1900 + (owner.fieldMonster[0]?.tempAtkBonus || 0)})`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.JOSOU_HORIE,
    name: '女装を極めし者 堀江 俊郎',
    type: CARD_TYPE.MONSTER,
    atk: 1500,
    effect: '堀江 俊郎を手札から捨てる、または場の堀江 俊郎を墓地に送って使用。使用時2ドロー',
    color: '#4a0055',
    emoji: '🦸‍♂️',
    imageFile: 'josou.png',
    evolved: true,
    costCardId: CARD_ID.HORIE,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.HORIE) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.HORIE),
    onPlay: (gs, owner) => {
      for (let i = 0; i < 2; i++) {
        const drawn = gs.drawCard(owner);
        if (drawn) gs.log(`【${owner.name}】女装を極めし者の効果でドロー：${drawn.name}`);
      }
      gs.log(`【${owner.name}】女装を極めし者 堀江 俊郎召喚！(ATK:1500)`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.TAKAMORI_MEDIA,
    name: 'ハットリ会メディア部 高森 政汰',
    type: CARD_TYPE.MONSTER,
    atk: 1500,
    effect: '手札/場の高森政汰をコストに召喚。完全耐性(3ターン後に自壊)',
    color: '#800080', // 紫
    emoji: '??',
    imageFile: 'shota.jpg',
    evolved: true,
    costCardId: CARD_ID.TAKAOKA,
    lifespan: 3, // game.jsで処理
    indestructible: true,
    canUse: (gs, player) => player.hand.some(c => c.id === CARD_ID.TAKAOKA) || (player.fieldMonster && player.fieldMonster.id === CARD_ID.TAKAOKA),
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ハットリ会メディア部 高森 政汰召喚！完全耐性＆3ターン後に自壊`);
    },
    onDestroy: null
  },
  {
    id: CARD_ID.T_SHIRT_MICHISHITA,
    name: 'ハットリ会公式Tシャツ 道下 政功',
    type: CARD_TYPE.MONSTER,
    atk: 400,
    effect: '召喚時：道下 政功を手札に加える',
    color: '#4682B4', // 青
    emoji: '??',
    imageFile: 'official_michishita.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const target = ALL_CARDS.find(c => c.id === CARD_ID.MICHISHITA);
      if (target) {
        owner.hand.push(Object.assign({}, target));
        gs.log(`【${owner.name}】Tシャツ効果！道下 政功を手札に加えた`);
      }
    },
    onDestroy: null
  },
  {
    id: CARD_ID.T_SHIRT_HORIE,
    name: 'ハットリ会公式Tシャツ 堀江 俊郎',
    type: CARD_TYPE.MONSTER,
    atk: 600,
    effect: '召喚時：堀江 俊郎を手札に加える',
    color: '#4682B4', // 青
    emoji: '??',
    imageFile: 'official_horie.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const target = ALL_CARDS.find(c => c.id === CARD_ID.HORIE);
      if (target) {
        owner.hand.push(Object.assign({}, target));
        gs.log(`【${owner.name}】Tシャツ効果！堀江 俊郎を手札に加えた`);
      }
    },
    onDestroy: null
  },
  {
    id: CARD_ID.RO_KUN,
    name: 'マッチングアプリ ろーくん',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: '被戦闘破壊時：相手の手札をランダムに2枚墓地へ送る',
    color: '#4682B4', // 青
    emoji: '??',
    imageFile: 'MATCHING APP.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】マッチングアプリ ろーくん召喚！(ATK:1000)`);
    },
    onDestroy: (gs, owner, isDirect) => {
      const opponent = gs.getOpponent(owner);
      if (opponent.hand.length > 0) {
        gs.log(`【${owner.name}】ろーくんの呪い！相手の手札を破壊！`);
        for (let i = 0; i < 2; i++) {
          if (opponent.hand.length === 0) break;
          const idx = Math.floor(Math.random() * opponent.hand.length);
          const discarded = opponent.hand.splice(idx, 1)[0];
          opponent.graveyard.push(discarded);
          gs.log(`→ 捨てさせた：${discarded.name}`);
        }
      }
    }
  },
  {
    id: CARD_ID.NINPU,
    name: '妊婦の怪物',
    type: CARD_TYPE.MONSTER,
    atk: 1500,
    effect: 'このカードは手札からカードを1枚ランダムに捨てないと召喚できない',
    color: '#800000',
    emoji: '??',
    imageFile: 'ninpu.JPG',
    // 自身以外に手札が1枚以上必要
    canUse: (gs, player) => player.hand.some(c => c.id !== CARD_ID.NINPU),
    onPlay: (gs, owner) => {
      if (owner.hand.length > 0) {
        const idx = Math.floor(Math.random() * owner.hand.length);
        const discarded = owner.hand.splice(idx, 1)[0];
        owner.graveyard.push(discarded);
        gs.log(`【${owner.name}】コストとして「${discarded.name}」を捨てて妊婦の怪物を召喚！(ATK:1500)`);
      } else {
        gs.log(`【${owner.name}】妊婦の怪物を召喚！(ATK:1500)`);
      }
    },
    onDestroy: null
  },
  // ===== 新規カード (Phase 34) =====
  {
    id: CARD_ID.FUSHIKI_YAKUZA,
    name: '伏木のヤクザ',
    type: CARD_TYPE.MONSTER,
    atk: 1000,
    effect: '起動効果(ゲーム中1回): 相手フィールド上のモンスター1体を破壊する',
    color: '#4B0000',
    emoji: '🕴️',
    imageFile: 'hushiki.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】伏木のヤクザを召喚！(ATK:1000)`);
    },
    onActivate: (gs, owner, slotIndex) => {
      if (owner.hasUsedFushikiYakuza) {
        gs.log(`【${owner.name}】伏木のヤクザの効果はゲーム中に1回しか使えません`);
        return;
      }
      const opp = gs.getOpponent(owner);
      const oppMonsters = opp.fieldMonster.map((m, idx) => m ? { m, idx } : null).filter(Boolean);
      if (oppMonsters.length === 0) {
        gs.log(`破壊できる相手モンスターがいません`);
        return;
      }
      // 最初の相手モンスターを破壊する（もし複数いればUI選択が必要だが、現在はランダムか先頭）
      const target = oppMonsters[0];
      // destroyMonster は game.js のグローバル関数だが cards.jsからは叩けないので gs を通すか
      // 相手の墓地送り処理で代替
      opp.graveyard.push(target.m);
      opp.fieldMonster[target.idx] = null;

      owner.hasUsedFushikiYakuza = true;
      gs.log(`【効果発動】伏木のヤクザ！相手の「${target.m.name}」を破壊した！`);
    }
  },
  {
    id: CARD_ID.ONSEN_TAMAGO_SOFT,
    name: '温泉卵ソフト',
    type: CARD_TYPE.MONSTER,
    atk: 100,
    effect: '起動効果(ターンに1回): 攻撃力+1800',
    color: '#FFE4B5',
    emoji: '🍦',
    imageFile: 'onsen.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】温泉卵ソフトを召喚！(ATK:100)`);
    },
    onActivate: (gs, owner, slotIndex) => {
      const self = owner.fieldMonster[slotIndex];
      if (self) {
        self.tempAtkBonus = (self.tempAtkBonus || 0) + 1800;
        gs.log(`【効果発動】温泉卵ソフト！攻撃力が1800アップ！（現在:${self.atk + self.tempAtkBonus}）`);
      }
    }
  },
  {
    id: CARD_ID.TAKAMORI_TERRY,
    name: 'タカモリのテリー',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'なし',
    color: '#8f4f2e',
    emoji: '🧢',
    imageFile: 'terry.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】タカモリのテリーを召喚！(ATK:1200)`);
    }
  },
  {
    id: CARD_ID.YANAGI_INCINEROAR,
    name: 'ヤナギのガオガエン',
    type: CARD_TYPE.MONSTER,
    atk: 1300,
    effect: 'なし',
    color: '#d44e33',
    emoji: '🔥',
    imageFile: 'gaogaen.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】ヤナギのガオガエンを召喚！(ATK:1300)`);
    }
  },
  {
    id: CARD_ID.KAKUCHI_BANJO,
    name: 'カクチのバンジョー＆カズーイ',
    type: CARD_TYPE.MONSTER,
    atk: 1200,
    effect: 'なし',
    color: '#e4b64b',
    emoji: '🐻',
    imageFile: 'banjo.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】カクチのバンジョー＆カズーイを召喚！(ATK:1200)`);
    }
  },
  {
    id: CARD_ID.HORIE_SHOCHU,
    name: '堀江家の焼酎',
    type: CARD_TYPE.MONSTER,
    atk: 0,
    effect: 'このカードの攻撃力は墓地の枚数x100アップする。',
    color: '#ffffff',
    emoji: '🍶',
    imageFile: 'shoutyuu.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const bonus = owner.graveyard.length * 100;
      gs.log(`【${owner.name}】堀江家の焼酎を召喚！墓地の枚数は${owner.graveyard.length}枚、攻撃力が${bonus}にアップ！`);
    },
    getEffectiveAtk: (originalAtk, gs, owner) => {
      return originalAtk + (owner.graveyard.length * 100);
    }
  },
  {
    id: CARD_ID.SAIKYOU_NO_FUTARI,
    name: '最強のふたり',
    type: CARD_TYPE.MONSTER,
    atk: 2500,
    effect: '手札か場の柳克憲と橋本泰成を墓地に送って特殊召喚',
    color: '#FFD700',
    emoji: '👥',
    imageFile: 'double.png',
    evolved: true, // 究極のパチンカスと同じレアデザインに
    canUse: (gs, player) => {
      // 柳と橋本が手札か場に揃っているか判定
      const hasYanagi = [...player.hand, ...player.fieldMonster.filter(Boolean)].some(c => c.id === CARD_ID.YANAGI);
      const hasHashimoto = [...player.hand, ...player.fieldMonster.filter(Boolean)].some(c => c.id === CARD_ID.HASHIMOTO);
      return hasYanagi && hasHashimoto;
    },
    onPlay: (gs, owner) => {
      // コストとして柳と橋本を墓地へ送る
      const removeCost = (id) => {
        const hIdx = owner.hand.findIndex(c => c.id === id);
        if (hIdx !== -1) {
          owner.graveyard.push(owner.hand.splice(hIdx, 1)[0]);
          return;
        }
        const fIdx = owner.fieldMonster.findIndex(c => c && c.id === id);
        if (fIdx !== -1) {
          owner.graveyard.push(owner.fieldMonster[fIdx]);
          owner.fieldMonster[fIdx] = null;
        }
      };
      removeCost(CARD_ID.YANAGI);
      removeCost(CARD_ID.HASHIMOTO);
      gs.log(`【${owner.name}】柳 克憲と橋本 泰成を素材にして最強のふたりを特殊召喚！！(ATK:2500)`);
    }
  }
];

// ===============================
// 魔法カード定義
// ===============================
const MAGIC_CARDS = [
  {
    id: CARD_ID.TAKAOKA_KAERE,
    name: '高岡信二「お前もう帰れ」',
    type: CARD_TYPE.MAGIC,
    effect: '相手フィールドのモンスター1体を選び、持ち主の手札に戻す。',
    color: '#333333',
    emoji: '🚪',
    imageFile: 'shinji.png',
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
        gs.log(`【${owner.name}】高岡信二「お前もう帰れ」！相手の「${target.name}」を手札に戻した！`);
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
    imageFile: 'geki.jpg',
    canUse: (gs, player) => player.fieldMonster[0] !== null,
    onPlay: (gs, owner) => {
      const target = owner.fieldMonster[0];
      if (target) {
        const bonus = target.atk; // 2倍にするため、ベースATK分を一時ボーナスとして付与
        target.tempAtkBonus = (target.tempAtkBonus || 0) + bonus;
        gs.log(`【${owner.name}】激太り！「${target.name}」の攻撃力が一時的に2倍になった！`);

        // 1ターン後に半分にする遅延効果
        owner.delayedEffects.push({
          type: 'gekibutori_debuff',
          targetPlayer: owner,
          targetCardId: target.id,
          countdown: 2, // 相手ターン、自分ターンと跨ぐため2を設定すると次の自分のターンに発動
          execute: (gsInstance) => {
            const currentMonster = owner.fieldMonster[0];
            if (currentMonster && currentMonster.id === target.id) {
              currentMonster.permanentAtkPenalty = (currentMonster.permanentAtkPenalty || 0) + Math.floor(currentMonster.atk / 2);
              gsInstance.log(`激太りの副作用！「${currentMonster.name}」の攻撃力が半分になった！`);
            }
          }
        });
      }
    }
  },
  {
    id: CARD_ID.YANI_JACKET,
    name: 'VISION ヤニくさいジャケット',
    type: CARD_TYPE.MAGIC,
    effect: 'モンスターに装備。次戦闘+300',
    color: '#3d1c00',
    emoji: '??',
    imageFile: 'vision.png',
    canUse: (gs, player) => !!player.fieldMonster,
    onPlay: (gs, owner) => {
      if (owner.fieldMonster) {
        owner.fieldMonster.equipped = CARD_ID.YANI_JACKET;
        // The equipment state is temporary just for ATK effect, immediately destroyed
        if (owner.fieldMonster[0]) {
          owner.fieldMonster[0].tempAtkBonus = (owner.fieldMonster[0].tempAtkBonus || 0) + 300;
        }
        gs.log(`【${owner.name}】VISIONヤニくさいジャケットを装備！ ${owner.fieldMonster[0]?.name || ''}のATK+300`);
      }
    }
  },
  {
    id: CARD_ID.YANI_BREAK,
    name: 'ヤニ休憩',
    type: CARD_TYPE.MAGIC,
    effect: '500回復',
    color: '#2d3a00',
    emoji: '??',
    imageFile: 'YANI KYUUKEI.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      let heal = 500;
      if (owner.fieldMonster && owner.fieldMonster.id === CARD_ID.KINEN_MICHISHITA) {
        heal += 1000;
        gs.log(`【${owner.name}】禁煙に失敗せし者の効果！ヤニ休憩の回復量+1000！`);
      }
      owner.lp += heal;
      gs.log(`【${owner.name}】ヤニ休憩！${heal}回復 (LP:${owner.lp})`);
    }
  },
  {
    id: CARD_ID.YELLOW_PARK,
    name: '黄ばんだ公園 ~イエローパーク~',
    type: CARD_TYPE.MAGIC,
    effect: 'このターン相手モンスター攻撃力~300',
    color: '#4a4100',
    emoji: '???',
    imageFile: 'YELLOW PARK.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      if (opponent.fieldMonster) {
        opponent.fieldMonster[0].tempAtkPenalty = (opponent.fieldMonster[0].tempAtkPenalty || 0) + 300;
        gs.log(`【${owner.name}】黄ばんだ公園！相手モンスターのATK-300（このターン）`);
      } else {
        gs.log(`【${owner.name}】黄ばんだ公園を発動！（相手フィールドにモンスターなし）`);
      }
    }
  },
  {
    id: CARD_ID.HOMERUN,
    name: '遊技場 ホームラン',
    type: CARD_TYPE.MAGIC,
    effect: 'ダイス5~6：2ドロー / 1~4：ランダム2枚捨てる',
    color: '#003344',
    emoji: '?',
    imageFile: 'HOMERUN.jpg',
    canUse: (gs, player) => true,
    onPlay: async (gs, owner) => {
      const roll = await gs.rollDice();
      gs.log(`【${owner.name}】遊技場 ホームラン！ダイス：${roll}`);
      if (roll >= 5) {
        for (let i = 0; i < 2; i++) {
          const drawn = gs.drawCard(owner);
          if (drawn) gs.log(`→ ドロー：${drawn.name}`);
        }
      } else {
        for (let i = 0; i < 2; i++) {
          if (owner.hand.length > 0) {
            const discardIdx = Math.floor(Math.random() * owner.hand.length);
            const discarded = owner.hand.splice(discardIdx, 1)[0];
            owner.graveyard.push(discarded);
            gs.log(`→ 捨てる：${discarded.name}`);
          }
        }
      }
    }
  },
  {
    id: CARD_ID.TAIYO_NEO,
    name: '遊技場 タイヨーネオ',
    type: CARD_TYPE.MAGIC,
    effect: '5~6：1000回復 / 1~4：1000ダメージ',
    color: '#002233',
    emoji: '??',
    imageFile: 'TAIYO NEO.png',
    canUse: (gs, player) => true,
    onPlay: async (gs, owner) => {
      const roll = await gs.rollDice();
      gs.log(`【${owner.name}】遊技場 タイヨーネオ！ダイス：${roll}`);
      if (roll >= 5) {
        owner.lp += 1000;
        gs.log(`→ 1000回復！(LP:${owner.lp})`);
      } else {
        owner.lp -= 1000;
        if (owner.lp < 0) owner.lp = 0;
        gs.log(`→ 1000ダメージ！(LP:${owner.lp})`);
      }
    }
  },
  {
    id: CARD_ID.HIMI_HIGH,
    name: '富山県立氷見高等学校',
    type: CARD_TYPE.MAGIC,
    effect: 'ハットリ会に所属しているモンスターカードを１枚手札に加える。',
    color: '#001133',
    emoji: '??',
    imageFile: 'himi.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      // サーチのみ
      const targets = ALL_CARDS.filter(c =>
        [CARD_ID.TAKAOKA, CARD_ID.YANAGI, CARD_ID.KAKUCHI, CARD_ID.HASHIMOTO, CARD_ID.KAMIDE, CARD_ID.MICHISHITA, CARD_ID.HORIE]
          .includes(c.id) && !c.evolved // 進化前のみ
      );

      const uniqueTargets = [];
      const seen = new Set();
      targets.forEach(c => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          uniqueTargets.push(c);
        }
      });

      if (!owner.isHuman && uniqueTargets.length > 0) {
        // CPUは自動で先頭の候補を取得
        const selectedItem = uniqueTargets[0];
        owner.hand.push(Object.assign({}, selectedItem));
        gs.log(`🤖 CPU Action: 氷見高校の効果で ${selectedItem.name} を手札に加えました`);
        renderAll();
      } else {
        showCardSelectUI(uniqueTargets, (selectedItem) => {
          owner.hand.push(Object.assign({}, selectedItem));
          gs.log(`【${owner.name}】氷見高校：${selectedItem.name}を手札に加えた`);
          renderAll();
        }, "手札に加えるカードを選択");
      }
    }
  },
  {
    id: CARD_ID.HATTORI_CLUB,
    name: "1st single 'HATTORI CLUB'",
    type: CARD_TYPE.MAGIC,
    effect: 'このターン自分モンスター+500',
    color: '#220033',
    emoji: '??',
    imageFile: '1st.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      if (owner.fieldMonster) {
        owner.fieldMonster[0].tempAtkBonus = (owner.fieldMonster[0].tempAtkBonus || 0) + 500;
        gs.log(`【${owner.name}】HATTORI CLUB！自分モンスターATK+500（このターン）`);
      } else {
        gs.log(`【${owner.name}】HATTORI CLUB発動！（フィールドにモンスターなし）`);
      }
    }
  },
  {
    id: CARD_ID.KIMOKUSA,
    name: 'キモ草大ハットリ会卍',
    type: CARD_TYPE.MAGIC,
    effect: '自分フィールド・手札から「高森, 橋本, 道下, 柳, 堀江, 上出, 角地」を1枚ずつ捨てて発動。勝利する。',
    color: '#003300',
    emoji: '??',
    imageFile: 'kimokusa.png',
    canUse: (gs, player) => {
      // 特定の7人を手札/フィールドから集められるか判定
      const requiredIds = [
        CARD_ID.TAKAMORI_SEITA,
        CARD_ID.HASHIMOTO,
        CARD_ID.MICHISHITA,
        CARD_ID.YANAGI,
        CARD_ID.HORIE,
        CARD_ID.KAMIDE,
        CARD_ID.KAKUCHI
      ];
      // 手札 + フィールドのカードIDリスト
      let available = player.hand.map(c => c.id);
      if (player.fieldMonster) available.push(player.fieldMonster.id);
      // 進化形もOKとするか？ -> 要望通りの名前なら基本形のみとするが、普通は進化でもOKにしたい。今回はID一致で実装。
      return requiredIds.every(reqId => available.includes(reqId));
    },
    onPlay: (gs, owner) => {
      const requiredIds = [
        CARD_ID.TAKAMORI_SEITA, CARD_ID.HASHIMOTO, CARD_ID.MICHISHITA,
        CARD_ID.YANAGI, CARD_ID.HORIE, CARD_ID.KAMIDE, CARD_ID.KAKUCHI
      ];
      // 捨てる処理（フィールド優先、次に手札）
      requiredIds.forEach(reqId => {
        if (owner.fieldMonster && owner.fieldMonster.id === reqId) {
          owner.graveyard.push(owner.fieldMonster);
          owner.fieldMonster = null;
        } else {
          const idx = owner.hand.findIndex(c => c.id === reqId);
          if (idx !== -1) owner.graveyard.push(owner.hand.splice(idx, 1)[0]);
        }
      });
      gs.log(`【${owner.name}】キモ草大ハットリ会卍！全てのメンバーが集結した…！`);
      gs.log(`?? 特殊勝利！ ??`);
      // 特殊勝利処理（game.jsのtriggerWinEffectでエフェクト呼び出し、勝敗決定）
      return { win: true, type: 'kimokusa' };
    }
  },
  {
    id: CARD_ID.FIREWORKS,
    name: '川北の花火に',
    type: CARD_TYPE.MAGIC,
    effect: '自分フィールドのモンスターカードの攻撃力を500アップさせる。ただし、この効果を受けたモンスターは１度戦闘を行うと自動的に破壊される。(相手に攻撃され、破壊されなかった場合でも自動的に破壊。）',
    color: '#ff4500',
    emoji: '🎆',
    imageFile: 'kawakita.PNG',
    canUse: (gs, player) => !!player.fieldMonster[0], // モンスターがいなければ使用不可
    onPlay: (gs, owner) => {
      if (owner.fieldMonster[0]) {
        owner.fieldMonster[0].permanentAtkBonus = (owner.fieldMonster[0].permanentAtkBonus || 0) + 500;
        owner.fieldMonster[0].oneTimeAttacker = true; // 戦闘後自壊フラグを付与
        gs.log(`【${owner.name}】川北の花火に！自モンスターのATKを500アップさせ、戦闘後自壊デメリットを付与しました。`);
      }
    }
  },
  {
    id: CARD_ID.CORTILE,
    name: '着払いの名所 コルティレ',
    type: CARD_TYPE.MAGIC,
    effect: 'このカードを発動したターンのみ、自分自身が受けるダメージは相手プレイヤーが代わりに受ける。（相手のエンドフェイズまで効果が持続。相手フィールドにモンスターカードが存在していても、それを無視してプレイヤーに直接ダメージを与える処理。）',
    color: '#8b4513',
    emoji: '📦',
    imageFile: 'koru.jpeg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      owner.cortileActive = true;
      gs.log(`【${owner.name}】着払いの名所 コルティレ発動！本ターン中の全ダメージを相手が肩代わりします！`);
    }
  },
  {
    id: CARD_ID.TEQUILA,
    name: 'テキーラリボルバーショット',
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
      gs.log(`【${owner.name}】テキーラリボルバーショット！500ダメージ！(LP:${opponent.lp})`);
    }
  },
  {
    id: CARD_ID.CHIKU,
    name: '知育菓子',
    type: CARD_TYPE.MAGIC,
    effect: '300回復',
    color: '#1a2200',
    emoji: '??',
    imageFile: 'chiikugashi-manabi.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      owner.lp += 300;
      gs.log(`【${owner.name}】知育菓子！300回復 (LP:${owner.lp})`);
    }
  },

  // ===== 新規魔法カード =====
  {
    id: CARD_ID.JOSOU_GEAR,
    name: '女装道具',
    type: CARD_TYPE.MAGIC,
    effect: '堀江 俊郎のATK+300, その他のカードのATK-300',
    color: '#550033',
    emoji: '??',
    imageFile: 'josoudougu.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const p1 = gs.player1, p2 = gs.player2;
      const targetIds = [CARD_ID.HORIE, CARD_ID.RESEARCHER, CARD_ID.JOSOU_HORIE, CARD_ID.RO_KUN, CARD_ID.T_SHIRT_HORIE];
      [p1, p2].forEach(p => {
        const m = p.fieldMonster && p.fieldMonster[0];
        if (m) {
          if (targetIds.includes(m.id)) {
            m.tempAtkBonus = (m.tempAtkBonus || 0) + 300;
            gs.log(`→ ${m.name}のATK+300！`);
          } else {
            m.tempAtkPenalty = (m.tempAtkPenalty || 0) + 300;
            gs.log(`→ ${m.name}のATK-300！`);
          }
        }
      });
      gs.log(`【${owner.name}】女装道具を発動！`);
    }
  },
  {
    id: CARD_ID.STARBUCKS,
    name: '上出 瑠星の復活 ～STAR BUCKS～',
    type: CARD_TYPE.MAGIC,
    effect: '墓地から好きなカードを1枚手札に加える',
    color: '#005533',
    emoji: '?',
    imageFile: 'hukkatu.jpg',
    canUse: (gs, player) => player.graveyard.length > 0,
    onPlay: (gs, owner) => {
      // UIを通じて選択させる（game.jsのshowGraveyardSelectで処理）
      gs.log(`【${owner.name}】上出 瑠星の復活 ～STAR BUCKS～発動！墓地からカードを選択してください`);
      return { needsGraveyardSelect: true, player: owner };
    }
  },
  {
    id: CARD_ID.WELCOME_GERO,
    name: 'Welcome to Gero!',
    type: CARD_TYPE.MAGIC,
    effect: '上出 瑠星が場にいる場合：相手は次のターンドロー不可',
    color: '#003311',
    emoji: '??',
    imageFile: 'welcome to gero.jpg',
    canUse: (gs, player) => player.fieldMonster &&
      (player.fieldMonster.id === CARD_ID.KAMIDE || player.fieldMonster.id === CARD_ID.AI_KAMIDE),
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      opponent.skipNextDraw = true;
      gs.log(`【${owner.name}】Welcome to Gero!発動！${opponent.name}は次のターンドロー不可！`);
    }
  },
  {
    id: CARD_ID.POKAPON,
    name: 'ポカポンゲーム',
    type: CARD_TYPE.MAGIC,
    effect: 'お互いダイスを振り、出目が小さいプレイヤーに500ダメージ',
    color: '#331100',
    emoji: '??',
    imageFile: 'game.png',
    canUse: (gs, player) => true,
    onPlay: async (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      const r1 = await gs.rollDice();
      const r2 = await gs.rollDice();
      gs.log(`【${owner.name}】ポカポンゲーム！${owner.name}:${r1} vs ${opponent.name}:${r2}`);
      if (r1 < r2) {
        owner.lp -= 500;
        if (owner.lp < 0) owner.lp = 0;
        gs.log(`→ ${owner.name}が500ダメージ！(LP:${owner.lp})`);
      } else if (r2 < r1) {
        opponent.lp -= 500;
        if (opponent.lp < 0) opponent.lp = 0;
        gs.log(`→ ${opponent.name}が500ダメージ！(LP:${opponent.lp})`);
      } else {
        gs.log(`→ 引き分け！ダメージなし`);
      }
    }
  },
  {
    id: CARD_ID.TIKTOKER_KAMIDE,
    name: 'TikToker KAMIDE',
    type: CARD_TYPE.MAGIC,
    effect: '上出 瑠星の上位進化カード（愛を知る男）を手札に加える',
    color: '#110033',
    emoji: '??',
    imageFile: 'tiktok.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const aiKamide = Object.assign({}, MONSTER_CARDS.find(c => c.id === CARD_ID.AI_KAMIDE));
      if (aiKamide) {
        owner.hand.push(aiKamide);
        gs.log(`【${owner.name}】TikToker KAMIDE発動！愛を知る男 上出 瑠星を手札に加えた！`);
      }
    }
  },
  {
    id: CARD_ID.NIWARIBIKI,
    name: '二割引の生麺',
    type: CARD_TYPE.MAGIC,
    effect: '次に受けるダメージを二割カット（永続効果・1回のみ）',
    color: '#a0a000',
    emoji: '??',
    imageFile: 'niwaribiki.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      if (!gs.permanentEffects) gs.permanentEffects = [];
      gs.permanentEffects.push({ id: CARD_ID.NIWARIBIKI, owner: owner.name });
      gs.log(`【${owner.name}】二割引の生麺！次に受けるダメージが軽減されます`);
    }
  },
  {
    id: CARD_ID.BATCHIIKE,
    name: 'バチイケになった俺',
    type: CARD_TYPE.MAGIC,
    effect: '上出 瑠星のATK+1000。次ターン開始時ATK-1000',
    color: '#ff00ff',
    emoji: '?',
    imageFile: 'batiike.png',
    canUse: (gs, player) => player.fieldMonster &&
      (player.fieldMonster.id === CARD_ID.KAMIDE || player.fieldMonster.id === CARD_ID.AI_KAMIDE),
    onPlay: (gs, owner) => {
      owner.fieldMonster[0].tempAtkBonus = (owner.fieldMonster[0].tempAtkBonus || 0) + 1000;
      // 次のターンに-1000する予約フラグを持たせる（game.jsで処理）
      owner.fieldMonster.nextTurnAtkDown = (owner.fieldMonster.nextTurnAtkDown || 0) + 1000;
      gs.log(`【${owner.name}】バチイケになった俺！上出 瑠星ATK+1000！(次ターン反動あり)`);
    }
  },
  {
    id: CARD_ID.YANAGI_HAND,
    name: '柳の手汗',
    type: CARD_TYPE.MAGIC,
    effect: '相手フィールドの全カード効果をターン終了時まで無効化',
    color: '#00aaaa',
    emoji: '??',
    imageFile: 'tease.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      if (opponent.fieldMonster) opponent.fieldMonster.effectNegated = true;
      gs.log(`【${owner.name}】柳の手汗！相手フィールドの効果を無効化した！`);
    }
  },
  {
    id: CARD_ID.ROBOT_ARMSPIN,
    name: 'YOKO B ROBOT ARMSPIN',
    type: CARD_TYPE.MAGIC,
    effect: 'ロボットがいる時のみ：相手カードを破壊',
    color: '#006400', // 緑
    emoji: '??',
    imageFile: 'YOKOB.jpg',
    canUse: (gs, player) => player.fieldMonster && player.fieldMonster.id === CARD_ID.ROBOT,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      if (opponent.fieldMonster) {
        destroyMonster(opponent);
        gs.log(`【${owner.name}】アームスピン！相手モンスターを破壊！`);
      } else {
        gs.log(`【${owner.name}】アームスピン！しかし相手モンスターがいなかった`);
      }
    }
  },
  {
    id: CARD_ID.ROBOT_ROBOLASER,
    name: 'YOKO B ROBOT ROBOLASER',
    type: CARD_TYPE.MAGIC,
    effect: 'ロボットがいる時のみ：相手の手札を1枚ランダムに捨てる',
    color: '#006400', // 緑
    emoji: '??',
    imageFile: 'laser.png',
    canUse: (gs, player) => player.fieldMonster && player.fieldMonster.id === CARD_ID.ROBOT,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      if (opponent.hand.length > 0) {
        const idx = Math.floor(Math.random() * opponent.hand.length);
        const discarded = opponent.hand.splice(idx, 1)[0];
        opponent.graveyard.push(discarded);
        gs.log(`【${owner.name}】ロボレーザー！ハンデス：${discarded.name}`);
      } else {
        gs.log(`【${owner.name}】ロボレーザー！しかし相手の手札がなかった`);
      }
    }
  },
  {
    id: CARD_ID.KAIJUU,
    name: '大怪獣決戦',
    type: CARD_TYPE.MAGIC,
    effect: 'お互いのプレイヤーは手札を2枚にしなければならない。（3枚以上持っていたらランダムに捨て、2枚未満の場合は2枚になるようドローする。）',
    color: '#aa0000',
    emoji: '??',
    imageFile: 'monster.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      [owner, opponent].forEach(p => {
        while (p.hand.length > 2) {
          const idx = Math.floor(Math.random() * p.hand.length);
          p.graveyard.push(p.hand.splice(idx, 1)[0]);
        }
        while (p.hand.length < 2) {
          gs.drawCard(p);
        }
      });
      gs.log(`【${owner.name}】大怪獣決戦 発動！お互いの手札が2枚になった！`);
    }
  },
  {
    id: CARD_ID.ITCHATTERU,
    name: 'イッちゃってる！？',
    type: CARD_TYPE.MAGIC,
    effect: 'お互いの手札を全て墓地に送り、お互いに5枚を手札に加える。',
    color: '#ff8c00',
    emoji: '??',
    imageFile: 'iki.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      [owner, opponent].forEach(p => {
        while (p.hand.length > 0) {
          p.graveyard.push(p.hand.pop());
        }
        for (let i = 0; i < 5; i++) {
          gs.drawCard(p);
        }
      });
      gs.log(`【${owner.name}】イッちゃってる！？発動！お互いの手札を全捨て＆5枚ドロー！`);
    }
  },
  {
    id: CARD_ID.TACHISHON,
    name: '盗撮された立ちション',
    type: CARD_TYPE.MAGIC,
    effect: '相手のLPに1000ダメージ。2ターン後に自分は2000ダメージを受ける。',
    color: '#333333',
    emoji: '??',
    imageFile: 'IMG_3383.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      const opponent = gs.getOpponent(owner);
      opponent.lp -= 1000;
      if (opponent.lp < 0) opponent.lp = 0;
      gs.log(`【${owner.name}】盗撮された立ちション！相手に1000ダメージ！`);

      if (!owner.delayedEffects) owner.delayedEffects = [];
      // 2ターン後 = 現在が自分のターンのメインフェイズ。
      // 次にターンが回ってきた時が「1ターン後」、その次が「2ターン後」。
      // なので count = 2 に設定。
      owner.delayedEffects.push({
        type: 'damage',
        amount: 2000,
        countdown: 2,
        message: '盗撮された立ちションの反動'
      });
      gs.log(`→代償として2ターン後に2000ダメージを受けます...`);
    }
  },
  {
    id: CARD_ID.GAY,
    name: 'ゲイへの誘い',
    type: CARD_TYPE.MAGIC,
    effect: '2枚ドローして、ドローしたカードにモンスターが含まれていれば自分は手札から3枚ランダムに捨てる。',
    color: '#ff69b4',
    emoji: '??',
    imageFile: 'gay.jpg',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      let hasMonster = false;
      let drawnNames = [];
      for (let i = 0; i < 2; i++) {
        const drawn = gs.drawCard(owner);
        if (drawn) {
          drawnNames.push(drawn.name);
          if (drawn.type === CARD_TYPE.MONSTER) hasMonster = true;
        }
      }
      gs.log(`【${owner.name}】ゲイへの誘い発動！ドロー：${drawnNames.join(', ')}`);

      if (hasMonster) {
        gs.log(`→モンスターが含まれていたため、手札から3枚を捨てる！`);
        for (let i = 0; i < 3; i++) {
          if (owner.hand.length === 0) break;
          const idx = Math.floor(Math.random() * owner.hand.length);
          const discarded = owner.hand.splice(idx, 1)[0];
          owner.graveyard.push(discarded);
          gs.log(`→ 捨てた：${discarded.name}`);
        }
      } else {
        gs.log(`→モンスターは含まれていなかったため、追加の代償はなし`);
      }
    }
  },
  // ===== 新規魔法 (Phase 34) =====
  {
    id: CARD_ID.RESURRECTION,
    name: '復活演出',
    type: CARD_TYPE.MAGIC,
    effect: '自分か相手の墓地からモンスター1体を特殊召喚',
    color: '#3d94ff',
    emoji: '🌀',
    imageFile: 'enshutu.jpg',
    canUse: (gs, player) => {
      const opp = gs.getOpponent(player);
      const hasMonsters = [...player.graveyard, ...opp.graveyard].some(c => c.type === CARD_TYPE.MONSTER);
      // Wait, fieldMonster uses array of 5 slots. If there is a null slot, we have space.
      const hasSpace = Array.isArray(player.fieldMonster) ? player.fieldMonster.includes(null) : !player.fieldMonster;
      return hasMonsters && hasSpace;
    },
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】復活演出を発動！墓地のモンスターを選択してください`);
      // Since `needsGraveyardSelect` exists, we can use it, but game.js only shows our own graveyard usually.
      // Assuming `bothGraveyards: true` isn't fully implemented in game.js yet, but we will return it.
      return { needsGraveyardSelect: true, bothGraveyards: true, selectType: CARD_TYPE.MONSTER, player: owner };
    }
  },
  {
    id: CARD_ID.BROKEN_CUP_NOODLE,
    name: '破壊されたカップ麺',
    type: CARD_TYPE.MAGIC,
    effect: '手札からカードを1枚選んで捨てる',
    color: '#8B0000',
    emoji: '🍜',
    imageFile: 'cup.png',
    canUse: (gs, player) => player.hand.length > 0,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】破壊されたカップ麺！手札から捨てるカードを選んでください`);
      return { needsHandSelect: true, player: owner, discardCount: 1 };
    }
  },
  {
    id: CARD_ID.RECEDING_HAIRLINE,
    name: '後退した前髪',
    type: CARD_TYPE.MAGIC,
    effect: 'ランダムに５枚をドローして、引いたカードをすぐに墓地に送る。',
    color: '#555555',
    emoji: '👴',
    imageFile: 'koutai.png',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      let drawnNames = [];
      for (let i = 0; i < 5; i++) {
        const drawn = gs.drawCard(owner);
        if (drawn) {
          drawnNames.push(drawn.name);
          owner.hand.pop(); // remove from hand
          owner.graveyard.push(drawn); // add to graveyard
        }
      }
      gs.log(`【${owner.name}】後退した前髪を発動！5枚ドローして墓地へ送った！：${drawnNames.join(', ')}`);
    }
  },
  // ===== デバッグ用 =====
  {
    id: CARD_ID.DEBUG_DRAW,
    name: 'デバッグドロー',
    type: CARD_TYPE.MAGIC,
    effect: '任意のカードを1枚デッキから手札に加える（カード検証モード専用）',
    color: '#000000',
    emoji: '⚙️',
    imageFile: '',
    canUse: (gs, player) => true,
    onPlay: (gs, owner) => {
      gs.log(`【${owner.name}】デバッグドローを発動！好きなカードを手札に加えます`);
      return { needsDebugSelect: true, player: owner };
    }
  }
];

const ALL_CARDS = [...MONSTER_CARDS, ...MAGIC_CARDS];

// 重み付き抽選（進化カードは約10ドローに1枚　weight=0.1）
// 新規カードが増えたので調整不要。
function getRandomCard() {
  if (typeof gs !== 'undefined' && gs && gs.mode === 'test') { // gs.mode === MODE.TEST
    const debugCard = ALL_CARDS.find(c => c.id === CARD_ID.DEBUG_DRAW);
    if (debugCard) return Object.assign({}, debugCard);
  }

  const validCards = ALL_CARDS.filter(c => c.id !== CARD_ID.DEBUG_DRAW);
  const weights = validCards.map(c => c.evolved ? 0.1 : 1.0);
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < validCards.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return Object.assign({}, validCards[i]);
  }
  return Object.assign({}, validCards[validCards.length - 1]);
}

function getRandomCards(n) {
  const cards = [];
  for (let i = 0; i < n; i++) cards.push(getRandomCard());
  return cards;
}


