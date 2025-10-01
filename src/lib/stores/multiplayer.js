import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 멀티플레이어 상태 초기값
const initialState = {
  isConnected: false,
  roomCode: null,
  playerId: null,
  playerName: 'Guest',
  isHost: false,
  players: [],
  gameState: 'lobby', // 'lobby', 'waiting', 'playing', 'finished'
  chat: [],
  maxPlayers: 6,
  currentTurn: 0,
  dealerHand: [],
  communityState: null
};

// 멀티플레이어 스토어
export const multiplayerStore = writable(initialState);

// 모의 서버 (실제 구현에서는 WebSocket 서버 사용)
class MockMultiplayerServer {
  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.messageHandlers = new Map();
  }

  // 방 생성
  createRoom(playerName) {
    const roomCode = this.generateRoomCode();
    const playerId = this.generatePlayerId();

    const room = {
      code: roomCode,
      host: playerId,
      players: [{
        id: playerId,
        name: playerName,
        hand: [],
        bet: 0,
        balance: 10000,
        isReady: false,
        lastAction: null,
        avatar: this.getRandomAvatar()
      }],
      gameState: 'lobby',
      dealerHand: [],
      deck: [],
      currentTurn: 0,
      chat: [],
      settings: {
        maxPlayers: 6,
        minBet: 10,
        maxBet: 1000
      }
    };

    this.rooms.set(roomCode, room);
    return { roomCode, playerId, room };
  }

  // 방 참가
  joinRoom(roomCode, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    if (room.players.length >= room.settings.maxPlayers) {
      throw new Error('방이 가득 찼습니다.');
    }

    const playerId = this.generatePlayerId();
    const player = {
      id: playerId,
      name: playerName,
      hand: [],
      bet: 0,
      balance: 10000,
      isReady: false,
      lastAction: null,
      avatar: this.getRandomAvatar()
    };

    room.players.push(player);
    this.broadcastToRoom(roomCode, 'playerJoined', { player });

    return { playerId, room };
  }

  // 방 떠나기
  leaveRoom(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
    } else if (room.host === playerId) {
      // 호스트가 떠나면 다음 플레이어가 호스트가 됨
      room.host = room.players[0].id;
      this.broadcastToRoom(roomCode, 'hostChanged', { newHost: room.host });
    }

    this.broadcastToRoom(roomCode, 'playerLeft', { playerId });
  }

  // 플레이어 준비 상태 변경
  setPlayerReady(roomCode, playerId, isReady) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
      this.broadcastToRoom(roomCode, 'playerReadyChanged', { playerId, isReady });

      // 모든 플레이어가 준비되면 게임 시작
      if (room.players.length >= 2 && room.players.every(p => p.isReady)) {
        this.startGame(roomCode);
      }
    }
  }

  // 게임 시작
  startGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.gameState = 'playing';
    room.deck = this.createDeck();
    room.dealerHand = [];
    room.currentTurn = 0;

    // 각 플레이어에게 카드 2장씩 딜링
    room.players.forEach(player => {
      player.hand = [room.deck.pop(), room.deck.pop()];
    });

    // 딜러 카드 2장
    room.dealerHand = [room.deck.pop(), room.deck.pop()];

    this.broadcastToRoom(roomCode, 'gameStarted', { room });
  }

  // 채팅 메시지 전송
  sendChatMessage(roomCode, playerId, message) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    const chatMessage = {
      id: Date.now(),
      playerId,
      playerName: player.name,
      message,
      timestamp: new Date().toISOString()
    };

    room.chat.push(chatMessage);
    this.broadcastToRoom(roomCode, 'chatMessage', chatMessage);
  }

  // 방에 있는 모든 플레이어에게 메시지 브로드캐스트
  broadcastToRoom(roomCode, type, data) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players.forEach(player => {
      this.sendToPlayer(player.id, type, data);
    });
  }

  // 특정 플레이어에게 메시지 전송
  sendToPlayer(playerId, type, data) {
    const handler = this.messageHandlers.get(playerId);
    if (handler) {
      handler(type, data);
    }
  }

  // 메시지 핸들러 등록
  registerPlayer(playerId, handler) {
    this.messageHandlers.set(playerId, handler);
  }

  // 유틸리티 함수들
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  generatePlayerId() {
    return Math.random().toString(36).substring(2, 15);
  }

  getRandomAvatar() {
    const avatars = ['🤵', '👩‍💼', '🧔', '👩', '👨', '👱‍♀️', '👱‍♂️', '👩‍🦰', '👨‍🦰', '👴', '👵'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];

    // 6덱 블랙잭
    for (let deckNum = 0; deckNum < 6; deckNum++) {
      for (let suit of suits) {
        for (let value of values) {
          deck.push({ suit, value, id: `${suit}${value}-${deckNum}` });
        }
      }
    }

    return this.shuffleDeck(deck);
  }

  shuffleDeck(deck) {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }
}

// 전역 서버 인스턴스
const mockServer = new MockMultiplayerServer();

// 멀티플레이어 액션들
export const multiplayerActions = {
  // 방 생성
  async createRoom(playerName) {
    try {
      const { roomCode, playerId, room } = mockServer.createRoom(playerName);

      // 메시지 핸들러 등록
      mockServer.registerPlayer(playerId, (type, data) => {
        this.handleServerMessage(type, data);
      });

      multiplayerStore.update(state => ({
        ...state,
        isConnected: true,
        roomCode,
        playerId,
        playerName,
        isHost: true,
        players: room.players,
        gameState: room.gameState,
        chat: room.chat
      }));

      return { success: true, roomCode };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 방 참가
  async joinRoom(roomCode, playerName) {
    try {
      const { playerId, room } = mockServer.joinRoom(roomCode, playerName);

      // 메시지 핸들러 등록
      mockServer.registerPlayer(playerId, (type, data) => {
        this.handleServerMessage(type, data);
      });

      multiplayerStore.update(state => ({
        ...state,
        isConnected: true,
        roomCode,
        playerId,
        playerName,
        isHost: false,
        players: room.players,
        gameState: room.gameState,
        chat: room.chat
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 방 떠나기
  leaveRoom() {
    multiplayerStore.update(state => {
      if (state.roomCode && state.playerId) {
        mockServer.leaveRoom(state.roomCode, state.playerId);
      }

      return {
        ...initialState
      };
    });
  },

  // 준비 상태 변경
  setReady(isReady) {
    multiplayerStore.update(state => {
      if (state.roomCode && state.playerId) {
        mockServer.setPlayerReady(state.roomCode, state.playerId, isReady);
      }
      return state;
    });
  },

  // 채팅 메시지 전송
  sendChatMessage(message) {
    multiplayerStore.update(state => {
      if (state.roomCode && state.playerId && message.trim()) {
        mockServer.sendChatMessage(state.roomCode, state.playerId, message.trim());
      }
      return state;
    });
  },

  // 서버 메시지 처리
  handleServerMessage(type, data) {
    switch (type) {
      case 'playerJoined':
        multiplayerStore.update(state => ({
          ...state,
          players: [...state.players, data.player]
        }));
        break;

      case 'playerLeft':
        multiplayerStore.update(state => ({
          ...state,
          players: state.players.filter(p => p.id !== data.playerId)
        }));
        break;

      case 'playerReadyChanged':
        multiplayerStore.update(state => ({
          ...state,
          players: state.players.map(p =>
            p.id === data.playerId ? { ...p, isReady: data.isReady } : p
          )
        }));
        break;

      case 'hostChanged':
        multiplayerStore.update(state => ({
          ...state,
          isHost: state.playerId === data.newHost
        }));
        break;

      case 'gameStarted':
        multiplayerStore.update(state => ({
          ...state,
          gameState: 'playing',
          players: data.room.players,
          dealerHand: data.room.dealerHand,
          currentTurn: data.room.currentTurn
        }));
        break;

      case 'chatMessage':
        multiplayerStore.update(state => ({
          ...state,
          chat: [...state.chat, data]
        }));
        break;

      default:
        console.log('Unknown message type:', type, data);
    }
  }
};