import { Server } from 'socket.io';
import { validateSession } from '$lib/server/auth.js';

let io;

export async function handle({ event, resolve }) {
	return await resolve(event);
}

export function websocket(server) {
	io = new Server(server, {
		path: '/socket.io',
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
	});

	// 사용자 매핑 (socket.id -> user_id)
	const userMap = new Map();
	// 방별 사용자 관리
	const roomUsers = new Map();

	io.on('connection', (socket) => {
		console.log('Client connected:', socket.id);

		// 인증 처리
		socket.on('authenticate', async (sessionId) => {
			try {
				const result = validateSession(sessionId);
				if (result.success) {
					userMap.set(socket.id, result.user.id);
					socket.emit('authenticated', {
						success: true,
						user: result.user
					});
				} else {
					socket.emit('authenticated', {
						success: false,
						error: result.error
					});
				}
			} catch (error) {
				socket.emit('authenticated', {
					success: false,
					error: '인증 오류가 발생했습니다.'
				});
			}
		});

		// 채팅방 참여
		socket.on('join-room', (data) => {
			const { room } = data;
			socket.join(room);

			// 방 사용자 목록 업데이트
			if (!roomUsers.has(room)) {
				roomUsers.set(room, new Set());
			}
			roomUsers.get(room).add(socket.id);

			// 방별 온라인 사용자 수 전송
			io.to(room).emit('room-users', {
				count: roomUsers.get(room).size
			});

			console.log(`Socket ${socket.id} joined room: ${room}`);
		});

		// 채팅방 나가기
		socket.on('leave-room', (data) => {
			const { room } = data;
			socket.leave(room);

			if (roomUsers.has(room)) {
				roomUsers.get(room).delete(socket.id);
				io.to(room).emit('room-users', {
					count: roomUsers.get(room).size
				});
			}
		});

		// 메시지 전송
		socket.on('send-message', (data) => {
			const userId = userMap.get(socket.id);
			if (!userId) {
				socket.emit('error', { message: '인증이 필요합니다.' });
				return;
			}

			const { room, message, messageId, originalMessage, language } = data;

			// 방의 모든 사용자에게 메시지 브로드캐스트
			io.to(room).emit('new-message', {
				id: messageId,
				userId,
				username: data.username,
				avatar: data.avatar,
				message,
				originalMessage,
				language,
				timestamp: new Date().toISOString()
			});
		});

		// 이모지 반응
		socket.on('add-reaction', (data) => {
			const { room, messageId, emoji, userId } = data;
			io.to(room).emit('reaction-added', {
				messageId,
				emoji,
				userId,
				timestamp: new Date().toISOString()
			});
		});

		// 반응 제거
		socket.on('remove-reaction', (data) => {
			const { room, messageId, emoji, userId } = data;
			io.to(room).emit('reaction-removed', {
				messageId,
				emoji,
				userId
			});
		});

		// 사용자 입력 중 상태
		socket.on('typing-start', (data) => {
			const { room, username } = data;
			socket.to(room).emit('user-typing', {
				username,
				isTyping: true
			});
		});

		socket.on('typing-stop', (data) => {
			const { room, username } = data;
			socket.to(room).emit('user-typing', {
				username,
				isTyping: false
			});
		});

		// 연결 해제
		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id);
			userMap.delete(socket.id);

			// 모든 방에서 사용자 제거
			for (const [room, users] of roomUsers.entries()) {
				if (users.has(socket.id)) {
					users.delete(socket.id);
					io.to(room).emit('room-users', {
						count: users.size
					});
				}
			}
		});
	});

	console.log('Socket.IO server initialized');
}

export function getIO() {
	return io;
}
