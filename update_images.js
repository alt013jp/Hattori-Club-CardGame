const fs = require('fs');
let content = fs.readFileSync('cards.js', 'utf8');

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
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(name:\\s*'${escapedName}',[\\s\\S]*?imageFile:\\s*)'[^']*'`);
    content = content.replace(regex, `$1'${img}'`);
}

fs.writeFileSync('cards.js', content, 'utf8');
console.log('Images mapped successfully.');
