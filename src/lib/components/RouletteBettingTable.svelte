<script>
  import { rouletteActions } from '$lib/stores/roulette.js';
  import { numberColors } from '$lib/stores/roulette.js';

  export let gameState;
  export let bets;
  export let selectedBetAmount;

  console.log('RouletteBettingTable props:', { gameState, bets, selectedBetAmount });

  function placeBet(betType, betValue = null) {
    console.log('placeBet 호출됨:', { betType, betValue, gameState, selectedBetAmount });
    if (gameState !== 'betting') {
      console.log('게임 상태가 betting이 아님:', gameState);
      return;
    }
    rouletteActions.placeBet(betType, betValue, selectedBetAmount);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function getBetAmount(betType, betValue = null) {
    const betKey = betValue ? `${betType}-${betValue}` : betType;
    return bets[betKey]?.amount || 0;
  }

  // 번호 그리드 생성 (3x12)
  const numberGrid = [];
  for (let row = 0; row < 3; row++) {
    const rowNumbers = [];
    for (let col = 1; col <= 12; col++) {
      const number = (row + 1) + (col - 1) * 3;
      rowNumbers.push(number);
    }
    numberGrid.push(rowNumbers);
  }

  // 인사이드 베팅 조합 생성
  function getSplitBets(number) {
    const splits = [];
    // 가로 스플릿
    if (number % 3 !== 0 && number <= 33) {
      splits.push([number, number + 3].sort((a, b) => a - b).join(','));
    }
    // 세로 스플릿
    if ((number - 1) % 3 !== 2 && number <= 34) {
      splits.push([number, number + 1].sort((a, b) => a - b).join(','));
    }
    return splits;
  }

  function getStreetBets(row) {
    const streets = [];
    for (let col = 0; col < 12; col++) {
      const start = row + col * 3 + 1;
      streets.push([start, start + 1, start + 2].join(','));
    }
    return streets;
  }

  function getCornerBets(number) {
    const corners = [];
    if ((number - 1) % 3 !== 2 && number % 3 !== 0 && number <= 32) {
      corners.push([number, number + 1, number + 3, number + 4].sort((a, b) => a - b).join(','));
    }
    return corners;
  }
</script>

<div class="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 border-4 border-yellow-400 shadow-2xl">
  <!-- 디버깅용 테스트 버튼 -->
  <div class="mb-4 p-2 bg-red-500 text-white text-center">
    <button
      on:click={() => console.log('테스트 버튼 작동함!')}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      테스트 버튼 (클릭 확인용)
    </button>
    <p class="mt-2 text-sm">게임상태: {gameState} | 베팅금액: {selectedBetAmount}</p>
  </div>
  <!-- 0 베팅 영역 -->
  <div class="mb-4">
    <button
      on:click={() => placeBet('straight', '0')}
      disabled={gameState !== 'betting'}
      class="w-full h-16 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-lg border-2 border-yellow-300 transition-all relative cursor-pointer"
    >
      0
      {#if getBetAmount('straight', '0') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 text-xs flex items-center justify-center font-bold">
          {getBetAmount('straight', '0')}
        </div>
      {/if}
    </button>
  </div>

  <!-- 번호 그리드 -->
  <div class="grid grid-cols-12 gap-1 mb-4">
    {#each numberGrid as row, rowIndex}
      {#each row as number}
        {@const color = numberColors[number]}
        <button
          on:click={() => {
            console.log('번호 버튼 클릭됨:', number);
            placeBet('straight', number.toString());
          }}
          disabled={gameState !== 'betting'}
          class="h-12 text-white font-bold text-sm border border-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative cursor-pointer
            {color === 'red' ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 hover:bg-gray-700'}"
        >
          {number}
          {#if getBetAmount('straight', number.toString()) > 0}
            <div class="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
              {getBetAmount('straight', number.toString())}
            </div>
          {/if}
        </button>
      {/each}
    {/each}
  </div>

  <!-- 컬럼 베팅 (2:1) -->
  <div class="grid grid-cols-3 gap-2 mb-4">
    {#each ['column1', 'column2', 'column3'] as column, index}
      <button
        on:click={() => placeBet(column)}
        disabled={gameState !== 'betting'}
        class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded border-2 border-yellow-300 transition-all relative"
      >
        2:1
        {#if getBetAmount(column) > 0}
          <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
            {getBetAmount(column)}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- 아웃사이드 베팅 영역 -->
  <div class="grid grid-cols-3 gap-2 mb-4">
    <!-- 첫 번째 줄: 1-18, Even, Red -->
    <button
      on:click={() => placeBet('low')}
      disabled={gameState !== 'betting'}
      class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      1-18
      {#if getBetAmount('low') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('low')}
        </div>
      {/if}
    </button>

    <button
      on:click={() => placeBet('even')}
      disabled={gameState !== 'betting'}
      class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      EVEN
      {#if getBetAmount('even') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('even')}
        </div>
      {/if}
    </button>

    <button
      on:click={() => {
        console.log('RED 버튼 클릭됨');
        placeBet('red');
      }}
      disabled={gameState !== 'betting'}
      class="h-12 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      RED
      {#if getBetAmount('red') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('red')}
        </div>
      {/if}
    </button>
  </div>

  <!-- 더즌 베팅 (2:1) -->
  <div class="grid grid-cols-3 gap-2 mb-4">
    {#each [
      { key: 'dozen1', label: '1st 12' },
      { key: 'dozen2', label: '2nd 12' },
      { key: 'dozen3', label: '3rd 12' }
    ] as dozen}
      <button
        on:click={() => placeBet(dozen.key)}
        disabled={gameState !== 'betting'}
        class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
      >
        {dozen.label}
        {#if getBetAmount(dozen.key) > 0}
          <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
            {getBetAmount(dozen.key)}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- 두 번째 줄: Black, Odd, 19-36 -->
  <div class="grid grid-cols-3 gap-2">
    <button
      on:click={() => placeBet('black')}
      disabled={gameState !== 'betting'}
      class="h-12 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      BLACK
      {#if getBetAmount('black') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('black')}
        </div>
      {/if}
    </button>

    <button
      on:click={() => placeBet('odd')}
      disabled={gameState !== 'betting'}
      class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      ODD
      {#if getBetAmount('odd') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('odd')}
        </div>
      {/if}
    </button>

    <button
      on:click={() => placeBet('high')}
      disabled={gameState !== 'betting'}
      class="h-12 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded border-2 border-yellow-300 transition-all relative"
    >
      19-36
      {#if getBetAmount('high') > 0}
        <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
          {getBetAmount('high')}
        </div>
      {/if}
    </button>
  </div>
</div>