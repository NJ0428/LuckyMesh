<script>
  import { soundSettings, soundActions } from '$lib/stores/soundSystem.js';
  import PastelButton from './PastelButton.svelte';
  import PastelCard from './PastelCard.svelte';

  export let show = false;

  let gameSettings = {
    gameSpeed: 'normal', // 'slow', 'normal', 'fast'
    autoBetting: false,
    autoBetAmount: 100,
    keyboardShortcuts: true,
    animations: true,
    cardCountingPractice: false,
    showBasicStrategy: false,
    showHints: true,
    autoPlay: false,
    autoPlayStrategy: 'basic' // 'basic', 'aggressive', 'conservative'
  };

  // 로컬 스토리지에서 설정 불러오기
  function loadGameSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('blackjack-game-settings');
        if (saved) {
          gameSettings = { ...gameSettings, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.warn('Failed to load game settings:', error);
      }
    }
  }

  // 로컬 스토리지에 설정 저장
  function saveGameSettings() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('blackjack-game-settings', JSON.stringify(gameSettings));
      } catch (error) {
        console.warn('Failed to save game settings:', error);
      }
    }
  }

  function updateSetting(key, value) {
    gameSettings[key] = value;
    saveGameSettings();
  }

  function resetSettings() {
    gameSettings = {
      gameSpeed: 'normal',
      autoBetting: false,
      autoBetAmount: 100,
      keyboardShortcuts: true,
      animations: true,
      cardCountingPractice: false,
      showBasicStrategy: false,
      showHints: true,
      autoPlay: false,
      autoPlayStrategy: 'basic'
    };
    saveGameSettings();
  }

  // 컴포넌트 마운트 시 설정 로드
  loadGameSettings();

  function closeSettings() {
    show = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeSettings();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeSettings}>
    <div class="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">⚙️ 게임 설정</h2>
        <button on:click={closeSettings} class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 사운드 설정 -->
        <PastelCard>
          <h3 class="text-xl font-bold mb-4 text-gray-800">🔊 사운드 설정</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">사운드 활성화</label>
              <input
                type="checkbox"
                bind:checked={$soundSettings.enabled}
                on:change={() => soundActions.toggleEnabled()}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div class="space-y-2">
              <label class="text-gray-700 font-medium">마스터 볼륨: {Math.round($soundSettings.masterVolume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                bind:value={$soundSettings.masterVolume}
                on:input={(e) => soundActions.setMasterVolume(e.target.value)}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-gray-700 font-medium">효과음 볼륨: {Math.round($soundSettings.effectsVolume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                bind:value={$soundSettings.effectsVolume}
                on:input={(e) => soundActions.setEffectsVolume(e.target.value)}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-gray-700 font-medium">배경음악 볼륨: {Math.round($soundSettings.musicVolume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                bind:value={$soundSettings.musicVolume}
                on:input={(e) => soundActions.setMusicVolume(e.target.value)}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center justify-between">
                <label class="text-gray-700">카드 사운드</label>
                <input
                  type="checkbox"
                  bind:checked={$soundSettings.cardSounds}
                  on:change={() => soundActions.updateSettings({ cardSounds: $soundSettings.cardSounds })}
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-gray-700">칩 사운드</label>
                <input
                  type="checkbox"
                  bind:checked={$soundSettings.chipSounds}
                  on:change={() => soundActions.updateSettings({ chipSounds: $soundSettings.chipSounds })}
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-gray-700">승리 사운드</label>
                <input
                  type="checkbox"
                  bind:checked={$soundSettings.winSounds}
                  on:change={() => soundActions.updateSettings({ winSounds: $soundSettings.winSounds })}
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-gray-700">배경음악</label>
                <input
                  type="checkbox"
                  bind:checked={$soundSettings.backgroundMusic}
                  on:change={() => soundActions.toggleBackgroundMusic()}
                  class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </PastelCard>

        <!-- 게임플레이 설정 -->
        <PastelCard>
          <h3 class="text-xl font-bold mb-4 text-gray-800">🎮 게임플레이</h3>

          <div class="space-y-4">
            <div>
              <label class="text-gray-700 font-medium block mb-2">게임 속도</label>
              <select
                bind:value={gameSettings.gameSpeed}
                on:change={() => updateSetting('gameSpeed', gameSettings.gameSpeed)}
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="slow">느림</option>
                <option value="normal">보통</option>
                <option value="fast">빠름</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">자동 베팅</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.autoBetting}
                on:change={() => updateSetting('autoBetting', gameSettings.autoBetting)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            {#if gameSettings.autoBetting}
              <div>
                <label class="text-gray-700 font-medium block mb-2">자동 베팅 금액: ${gameSettings.autoBetAmount}</label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  bind:value={gameSettings.autoBetAmount}
                  on:input={() => updateSetting('autoBetAmount', gameSettings.autoBetAmount)}
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            {/if}

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">키보드 단축키</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.keyboardShortcuts}
                on:change={() => updateSetting('keyboardShortcuts', gameSettings.keyboardShortcuts)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">애니메이션</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.animations}
                on:change={() => updateSetting('animations', gameSettings.animations)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </PastelCard>

        <!-- 전략 도우미 설정 -->
        <PastelCard>
          <h3 class="text-xl font-bold mb-4 text-gray-800">🧠 전략 도우미</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">기본 전략 표시</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.showBasicStrategy}
                on:change={() => updateSetting('showBasicStrategy', gameSettings.showBasicStrategy)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">힌트 표시</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.showHints}
                on:change={() => updateSetting('showHints', gameSettings.showHints)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">카드 카운팅 연습</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.cardCountingPractice}
                on:change={() => updateSetting('cardCountingPractice', gameSettings.cardCountingPractice)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <label class="text-gray-700 font-medium">자동 플레이</label>
              <input
                type="checkbox"
                bind:checked={gameSettings.autoPlay}
                on:change={() => updateSetting('autoPlay', gameSettings.autoPlay)}
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            {#if gameSettings.autoPlay}
              <div>
                <label class="text-gray-700 font-medium block mb-2">자동 플레이 전략</label>
                <select
                  bind:value={gameSettings.autoPlayStrategy}
                  on:change={() => updateSetting('autoPlayStrategy', gameSettings.autoPlayStrategy)}
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conservative">보수적</option>
                  <option value="basic">기본 전략</option>
                  <option value="aggressive">공격적</option>
                </select>
              </div>
            {/if}
          </div>
        </PastelCard>

        <!-- 키보드 단축키 정보 -->
        <PastelCard>
          <h3 class="text-xl font-bold mb-4 text-gray-800">⌨️ 키보드 단축키</h3>

          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span class="font-medium">H</span>
              <span>히트</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">S</span>
              <span>스탠드</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">D</span>
              <span>더블다운</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">P</span>
              <span>스플릿</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">R</span>
              <span>항복</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Space</span>
              <span>베팅/딜</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Enter</span>
              <span>새 게임</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">1-6</span>
              <span>베팅 금액 선택</span>
            </div>
          </div>
        </PastelCard>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <PastelButton variant="danger" on:click={resetSettings}>
          설정 초기화
        </PastelButton>

        <div class="flex gap-3">
          <PastelButton variant="secondary" on:click={closeSettings}>
            취소
          </PastelButton>
          <PastelButton variant="primary" on:click={closeSettings}>
            적용
          </PastelButton>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 커스텀 슬라이더 스타일 */
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* 체크박스 커스텀 스타일 */
  input[type="checkbox"]:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
</style>