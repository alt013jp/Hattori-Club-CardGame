const members = [
    {
        id: 'yanagi',
        name: '柳 克憲',
        image: 'images/members/yanagi.jpg',
        desc: 'ハットリ会一のゲイ力を誇る男。パチンコで22連敗のギネス記録を持っている。ハットリ会では主に尻を揉む担当をしている。ヴィジョンとゴキブリが相棒とされている。'
    },
    {
        id: 'michishita',
        name: '道下 政功',
        image: 'images/members/michishita.jpg',
        desc: 'いわずと知れたコメリの重鎮。ただし準社員である。趣味はおじさん漁りと半裸の写真をインスタグラムに投稿すること。また、ハットリ会一の薄い頭を持つ男でもある。'
    },
    {
        id: 'hashimoto',
        name: '橋本 泰成',
        image: 'images/members/hashimoto.jpg',
        desc: '画面の中から出てこない嫁を持っているハットリ会唯一の既婚者。チキンラーメンに釣られてウォーターサーバーを契約してしまったことがある。上出瑠星によくぶぶかに誘われているが、本人としてはあまり乗り気ではないため、無視を決め込んでいる。'
    },
    {
        id: 'kakuchi',
        name: '角地 駿汰',
        image: 'images/members/kakuchi.jpg',
        desc: 'ハットリ会一のパチンカス。休みの日にはよくパチンコをしているし、いつもパチンコ屋に住んでいる。最近はスロットにハマっており、その勢いはとどまることをしらない。なお、トータルの収支は言うまでもない。'
    },
    {
        id: 'horie',
        name: '堀江 俊郎',
        image: 'images/members/horie.jpg',
        desc: 'ハットリ会唯一の女性会員。趣味は女装。ハットリ会会員の上出瑠星と付き合っており、他の会員の目の届かない関東圏で、その愛を育んでいるとされている。ビールを飲みながらダイエットをしようとしたことがあり、世界的に批判を浴びている。'
    },
    {
        id: 'kamide',
        name: '上出 瑠星',
        image: 'images/members/kamide.jpg',
        desc: '架空のコンビニに勤めた実績を持つ。パチンコはあまりやらないが、その負け額を正確に覚えることができ、よく4パチの話に介入してくることがある。最近は堀江俊郎と橋本泰成をぶぶかに誘うことが多いが、返信はまだ来ていない。'
    },
    {
        id: 'takamori',
        name: '高森 政汰',
        image: 'images/members/takamori.jpg',
        desc: 'ハットリ会の頭脳担当であり、音楽 / 映像制作担当である。彼の製作する音楽は世界的に好評を得ており、熱狂的なファンも存在している。また、その美貌に憧れる者も多く、大統領選挙で二位を獲るなど、目覚ましい活躍をみせている。'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on index.html or member.html
    const path = window.location.pathname;
    
    // Simple detection based on filename usually works, but for local files:
    // We can check for existence of elements unique to pages.
    
    const memberListContainer = document.getElementById('member-list');
    const profileContainer = document.getElementById('profile-container');

    if (memberListContainer) {
        renderMemberList();
    }

    if (profileContainer) {
        renderProfile();
    }
});

function renderMemberList() {
    const container = document.getElementById('member-list');
    members.forEach(member => {
        const card = document.createElement('a');
        card.href = `member.html?id=${member.id}`; // Using query param
        card.className = 'member-card';
        
        // Handle query param issue on local file system if necessary
        // Ideally we use hash for safer local file navigation: separate tool might suggest checking query support
        // But let's stick to search param first, if it fails user can report. 
        // Actually, let's use search param. Modern browsers handle file://?id=x just fine usually.
        // Fallback: Using hash
        card.href = `member.html#${member.id}`;

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${member.image}" alt="${member.name}" loading="lazy">
                <div class="card-overlay">
                    <span class="view-profile">VIEW PROFILE</span>
                </div>
            </div>
            <h3 class="member-name">${member.name}</h3>
        `;
        container.appendChild(card);
    });
}

function renderProfile() {
    // Get ID from Hash (preferred for local files)
    const hash = window.location.hash.substring(1); // remove #
    
    // Or from query param
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');

    const memberId = hash || queryId;

    const member = members.find(m => m.id === memberId);

    if (!member) {
        document.getElementById('profile-container').innerHTML = '<p>Member not found.</p>';
        return;
    }

    document.getElementById('profile-image').src = member.image;
    document.getElementById('profile-name').textContent = member.name;
    document.getElementById('profile-desc').textContent = member.desc;
}
