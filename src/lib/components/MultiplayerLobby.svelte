<script>
  import { multiplayerStore, multiplayerActions } from '$lib/stores/multiplayer.js';
  import { soundActions } from '$lib/stores/soundSystem.js';
  import PastelButton from './PastelButton.svelte';
  import PastelCard from './PastelCard.svelte';

  export let show = false;

  let roomCodeInput = '';
  let playerNameInput = 'Guest';
  let chatMessage = '';
  let chatContainer;
  let showCreateRoom = false;
  let showJoinRoom = false;

  $: currentPlayer = $multiplayerStore.players.find(p => p.id === $multiplayerStore.playerId);
  $: allPlayersReady = $multiplayerStore.players.length >= 2 &&
                      $multiplayerStore.players.every(p => p.isReady);

  function createRoom() {
    if (!playerNameInput.trim()) {
      alert('플레이어 이름을 입력해주세요.');
      return;
    }

    multiplayerActions.createRoom(playerNameInput.trim()).then(result => {
      if (result.success) {
        soundActions.playButtonClick();
        showCreateRoom = false;
      } else {
        alert(result.error);
      }
    });
  }

  function joinRoom() {
    if (!playerNameInput.trim()) {
      alert('플레이어 이름을 입력해주세요.');
      return;
    }

    if (!roomCodeInput.trim()) {
      alert('방 코드를 입력해주세요.');
      return;
    }

    multiplayerActions.joinRoom(roomCodeInput.trim().toUpperCase(), playerNameInput.trim()).then(result => {
      if (result.success) {
        soundActions.playButtonClick();
        showJoinRoom = false;
      } else {
        alert(result.error);
      }
    });
  }

  function leaveRoom() {
    multiplayerActions.leaveRoom();
    show = false;
  }

  function toggleReady() {
    const newReadyState = !currentPlayer?.isReady;
    multiplayerActions.setReady(newReadyState);
    soundActions.playButtonClick();
  }

  function sendChat() {
    if (chatMessage.trim()) {
      multiplayerActions.sendChatMessage(chatMessage);
      chatMessage = '';
    }
  }

  function copyRoomCode() {
    if ($multiplayerStore.roomCode) {
      navigator.clipboard.writeText($multiplayerStore.roomCode).then(() => {
        alert('방 코드가 클립보드에 복사되었습니다!');
      });
    }
  }

  // 채팅 스크롤 자동 이동
  $: if (chatContainer && $multiplayerStore.chat.length > 0) {
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      if ($multiplayerStore.isConnected) {
        leaveRoom();
      } else {
        show = false;
      }
    }
  }

  function handleChatKeydown(event) {
    if (event.key === 'Enter') {
      sendChat();
    }
  }

  function getPlayerStatusIcon(player) {
    if (player.isReady) return '✅';
    return '⏳';
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

      {#if !$multiplayerStore.isConnected}
        <!-- 로비 메인 화면 -->
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">🎮 멀티플레이어 로비</h2>
          <p class="text-gray-600">친구들과 함께 블랙잭을 플레이하세요!</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          <!-- 방 만들기 -->
          <PastelCard>
            <div class="text-center">
              <div class="text-6xl mb-4">🏠</div>
              <h3 class="text-xl font-bold mb-4">방 만들기</h3>
              <p class="text-gray-600 mb-6">새로운 게임방을 만들어 친구들을 초대하세요.</p>

              {#if !showCreateRoom}
                <PastelButton variant="primary" on:click={() => showCreateRoom = true}>
                  방 만들기
                </PastelButton>
              {:else}
                <div class="space-y-4">
                  <input
                    type="text"
                    bind:value={playerNameInput}
                    placeholder="플레이어 이름"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxlength="20"
                  />
                  <div class="flex gap-2">
                    <PastelButton variant="primary" on:click={createRoom} class="flex-1">
                      생성
                    </PastelButton>
                    <PastelButton variant="secondary" on:click={() => showCreateRoom = false} class="flex-1">
                      취소
                    </PastelButton>
                  </div>
                </div>
              {/if}
            </div>
          </PastelCard>

          <!-- 방 참가 -->
          <PastelCard>
            <div class="text-center">
              <div class="text-6xl mb-4">🚪</div>
              <h3 class="text-xl font-bold mb-4">방 참가</h3>
              <p class="text-gray-600 mb-6">방 코드를 입력하여 기존 게임에 참가하세요.</p>

              {#if !showJoinRoom}
                <PastelButton variant="secondary" on:click={() => showJoinRoom = true}>
                  방 참가
                </PastelButton>
              {:else}
                <div class="space-y-4">
                  <input
                    type="text"
                    bind:value={playerNameInput}
                    placeholder="플레이어 이름"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxlength="20"
                  />
                  <input
                    type="text"
                    bind:value={roomCodeInput}
                    placeholder="방 코드 (예: ABC123)"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    maxlength="6"
                  />
                  <div class="flex gap-2">
                    <PastelButton variant="primary" on:click={joinRoom} class="flex-1">
                      참가
                    </PastelButton>
                    <PastelButton variant="secondary" on:click={() => showJoinRoom = false} class="flex-1">
                      취소
                    </PastelButton>
                  </div>
                </div>
              {/if}
            </div>
          </PastelCard>
        </div>

        <div class="text-center mt-6">
          <PastelButton variant="danger" on:click={() => show = false}>
            닫기
          </PastelButton>
        </div>

      {:else}
        <!-- 게임방 화면 -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">방 코드: {$multiplayerStore.roomCode}</h2>
            <p class="text-gray-600">
              {#if $multiplayerStore.isHost}호스트{:else}참가자{/if} •
              {$multiplayerStore.players.length}명 참가중
            </p>
          </div>
          <div class="flex gap-2">
            <PastelButton variant="secondary" on:click={copyRoomCode}>
              📋 코드 복사
            </PastelButton>
            <PastelButton variant="danger" on:click={leaveRoom}>
              방 나가기
            </PastelButton>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <!-- 플레이어 목록 -->
          <div class="lg:col-span-2">
            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">🎭 플레이어 목록</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each $multiplayerStore.players as player}
                  <div class="bg-gray-50 rounded-lg p-4 {player.id === $multiplayerStore.playerId ? 'ring-2 ring-blue-500' : ''}">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="text-2xl">{player.avatar}</div>
                        <div>
                          <div class="font-bold text-gray-800">
                            {player.name}
                            {#if player.id === $multiplayerStore.playerId}
                              <span class="text-blue-600">(나)</span>
                            {/if}
                            {#if $multiplayerStore.isHost && player.id === $multiplayerStore.playerId}
                              <span class="text-orange-600">👑</span>
                            {/if}
                          </div>
                          <div class="text-sm text-gray-600">${player.balance.toLocaleString()}</div>
                        </div>
                      </div>
                      <div class="text-2xl">
                        {getPlayerStatusIcon(player)}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>

              {#if $multiplayerStore.gameState === 'lobby'}
                <div class="mt-6 text-center">
                  <PastelButton
                    variant={currentPlayer?.isReady ? 'secondary' : 'primary'}
                    on:click={toggleReady}
                  >
                    {currentPlayer?.isReady ? '준비 취소' : '준비 완료'}
                  </PastelButton>

                  {#if allPlayersReady}
                    <p class="text-green-600 font-bold mt-2">모든 플레이어가 준비되었습니다! 게임이 곧 시작됩니다...</p>
                  {:else}
                    <p class="text-gray-600 mt-2">
                      모든 플레이어가 준비될 때까지 기다려주세요. (최소 2명 필요)
                    </p>
                  {/if}
                </div>
              {/if}
            </PastelCard>
          </div>

          <!-- 채팅 -->
          <div>
            <PastelCard class="h-full flex flex-col">
              <h3 class="text-xl font-bold mb-4 text-gray-800">💬 채팅</h3>

              <div
                bind:this={chatContainer}
                class="flex-1 bg-gray-50 rounded-lg p-3 overflow-y-auto max-h-80 min-h-60"
              >
                {#if $multiplayerStore.chat.length === 0}
                  <p class="text-gray-500 text-center">채팅이 비어있습니다.</p>
                {:else}
                  {#each $multiplayerStore.chat as message}
                    <div class="mb-3">
                      <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span class="font-medium">{message.playerName}</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                      <div class="bg-white rounded-lg p-2 text-sm text-gray-800">
                        {message.message}
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>

              <div class="mt-4">
                <div class="flex gap-2">
                  <input
                    type="text"
                    bind:value={chatMessage}
                    on:keydown={handleChatKeydown}
                    placeholder="메시지를 입력하세요..."
                    class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    maxlength="200"
                  />
                  <PastelButton variant="primary" on:click={sendChat} disabled={!chatMessage.trim()}>
                    전송
                  </PastelButton>
                </div>
              </div>
            </PastelCard>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* 채팅 스크롤바 스타일 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
</style>