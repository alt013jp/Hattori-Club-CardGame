const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // どのURL（ローカルファイル含む）からの接続も許可
        methods: ["GET", "POST"]
    }
});
const path = require('path');

const PORT = 8080;

// 静的ファイルの配信 (ゲーム本体 HTML, CSS, JS, 画像など)
app.use(express.static(path.join(__dirname)));

// ルーム管理
// roomCode => { hostId: socketId, guestId: socketId | null, state: any }
const rooms = new Map();

io.on('connection', (socket) => {
    console.log(`[Connect] Socket ID: ${socket.id}`);

    // ===== ホスト: ルーム作成 =====
    socket.on('create_room', () => {
        // 4桁のランダムな数字をルームコードとして生成
        let code;
        do {
            code = Math.floor(1000 + Math.random() * 9000).toString();
        } while (rooms.has(code));

        rooms.set(code, { hostId: socket.id, guestId: null, state: null });
        socket.join(code);

        console.log(`[Room Created] Code: ${code} by Host: ${socket.id}`);
        socket.emit('room_created', { code });
    });

    // ===== ゲスト: ルーム参加 =====
    socket.on('join_room', ({ code }) => {
        const room = rooms.get(code);

        if (!room) {
            socket.emit('error_msg', { message: 'ルームが見つりません' });
            return;
        }
        if (room.guestId) {
            socket.emit('error_msg', { message: 'ルームは既に満員です' });
            return;
        }

        // ゲスト参加成功
        room.guestId = socket.id;
        socket.join(code);
        console.log(`[Room Joined] Code: ${code} by Guest: ${socket.id}`);

        socket.emit('room_joined', { code });
        io.to(room.hostId).emit('guest_joined'); // ホストに通知してゲーム開始
    });

    // ===== ゲーム状態同期 (ホスト -> ゲスト) =====
    socket.on('game_state', ({ state }) => {
        // 現在所属しているルームを特定
        const roomEntry = [...rooms.entries()].find(([_, r]) => r.hostId === socket.id);
        if (roomEntry) {
            const [code, room] = roomEntry;
            room.state = state; // 最新状態をサーバーでもキャッシュ
            io.to(code).emit('game_state_update', { state });
        }
    });

    // ===== アクション送信 (ゲスト -> ホスト) =====
    socket.on('action', ({ action }) => {
        const roomEntry = [...rooms.entries()].find(([_, r]) => r.guestId === socket.id);
        if (roomEntry) {
            const [code, room] = roomEntry;
            // ホストへアクションを転送
            io.to(room.hostId).emit('guest_action', { action });
        }
    });

    // ===== 切断処理 =====
    socket.on('disconnect', () => {
        console.log(`[Disconnect] Socket ID: ${socket.id}`);

        // ホストだった場合
        for (const [code, room] of rooms.entries()) {
            if (room.hostId === socket.id) {
                io.to(code).emit('opponent_disconnected');
                rooms.delete(code);
                console.log(`[Room Deleted] Code: ${code}`);
            } else if (room.guestId === socket.id) {
                // ゲストだった場合
                io.to(room.hostId).emit('opponent_disconnected');
                room.guestId = null; // 空席にするか、部屋を取り壊す（今回は部屋も消す）
                rooms.delete(code);
                console.log(`[Room Deleted by Guest Disconnect] Code: ${code}`);
            }
        }
    });
});

// サーバー起動
http.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================`);
    console.log(`🎮 HATTORI CLUB CARD GAME Server`);
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`=================================`);
});
