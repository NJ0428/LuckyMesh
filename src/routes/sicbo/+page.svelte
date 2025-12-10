<script>
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import {
        ArrowLeft, Coins, BarChart3, BookOpen, History, XCircle, Dice6,
        ArrowRight, CheckCircle, AlertCircle
    } from 'lucide-svelte';

    // Game State
    let balance = 50000;
    let selectedChip = 5000;
    let bets = {};
    let gameHistory = [];
    let stats = {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        netProfit: 0
    };

    let totalBet = 0;
    let gameInProgress = false;
    let activeTab = 'stats';
    let result = {
        dice: [0, 0, 0],
        sum: 0,
        text: '',
        winnings: 0
    };
    let showResult = false;

    const diceRotations = [
        { x: 0, y: 0 }, // 1
        { x: -90, y: 0 }, // 2
        { x: 0, y: 90 }, // 3
        { x: 0, y: -90 }, // 4
        { x: 90, y: 0 }, // 5
        { x: 180, y: 0 } // 6
    ];

    let diceElements = [null, null, null];
    let diceValues = [1, 1, 1];
    let rolling = false;

    const chipValues = [1000, 5000, 10000, 50000];

    // Functions
    function selectChip(value) {
        selectedChip = value;
    }

    function placeBet(betType) {
        if (gameInProgress) return;
        if (!bets[betType]) {
            bets[betType] = 0;
        }
        bets[betType] += selectedChip;
        bets = bets; // Trigger reactivity
        updateTotalBet();
    }

    function updateTotalBet() {
        totalBet = Object.values(bets).reduce((sum, bet) => sum + bet, 0);
    }

    function clearBets() {
        bets = {};
        document.querySelectorAll('.bet-area').forEach(area => {
            area.classList.remove('active', 'win');
        });
        updateTotalBet();
        showResult = false;
    }

    async function rollDice() {
        if (totalBet === 0) {
            alert('베팅을 먼저 해주세요!');
            return;
        }
        if (totalBet > balance) {
            alert('잔액이 부족합니다!');
            return;
        }

        gameInProgress = true;
        balance -= totalBet;
        showResult = false;
        rolling = true;

        await new Promise(resolve => setTimeout(resolve, 200));

        const results = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];

        diceValues = results;

        setTimeout(() => {
            rolling = false;
            const sum = results.reduce((a, b) => a + b, 0);
            processResults(results, sum);
            gameInProgress = false;
        }, 2000);
    }

    function processResults(results, sum) {
        const winnings = calculateWinnings(results, sum);
        balance += winnings;

        stats.totalGames++;
        let profit = winnings - totalBet;

        if (winnings > totalBet) {
            stats.totalWins++;
            result.text = `승리! +₩${formatNumber(profit)}`;
        } else {
            stats.totalLosses++;
            result.text = `패배 -₩${formatNumber(totalBet)}`;
        }
        stats.netProfit += profit;

        result.dice = results;
        result.sum = sum;
        result.winnings = winnings;
        showResult = true;

        addToHistory(results, sum, winnings, totalBet);

        setTimeout(() => {
            clearBets();
        }, 3000);
    }


    function calculateWinnings(results, sum) {
        let totalWin = 0;
        const [d1, d2, d3] = results;
        const isTriple = d1 === d2 && d2 === d3;
        
        const counts = results.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        const isDouble = Object.values(counts).some(c => c === 2);

        Object.entries(bets).forEach(([betType, amount]) => {
            const area = document.querySelector(`[data-bet="${betType}"]`);
            const payout = parseInt(area.dataset.payout);
            let won = false;

            if (betType.startsWith('sum-')) {
                const betSum = parseInt(betType.split('-')[1]);
                if (sum === betSum && !isTriple) {
                    won = true;
                }
            } else if (betType === 'small') {
                if (sum >= 4 && sum <= 10 && !isTriple) {
                    won = true;
                }
            } else if (betType === 'big') {
                if (sum >= 11 && sum <= 17 && !isTriple) {
                    won = true;
                }
            } else if (betType.startsWith('single-')) {
                const num = parseInt(betType.split('-')[1]);
                const count = results.filter(r => r === num).length;
                if (count > 0) {
                    totalWin += amount * (count + 1); // Simplified payout for single numbers
                    area.classList.add('win');
                    return; // Continue to next bet
                }
            } else if (betType === 'double') {
                if (isDouble && !isTriple) won = true;
            } else if (betType.startsWith('specific-double-')) {
                const num = parseInt(betType.split('-')[2]);
                if (counts[num] === 2) won = true;
            } else if (betType === 'any-triple') {
                if (isTriple) won = true;
            } else if (betType.startsWith('specific-triple-')) {
                const num = parseInt(betType.split('-')[2]);
                if (isTriple && d1 === num) won = true;
            }

            if (won) {
                totalWin += amount * (payout + 1);
                area.classList.add('win');
            }
        });

        return totalWin;
    }


    function formatMoney(amount) {
        if (amount >= 1000) {
            return '₩' + (amount / 1000) + 'K';
        }
        return '₩' + amount;
    }

    function formatNumber(num) {
        return num.toLocaleString('ko-KR');
    }

    function addToHistory(results, sum, winnings, totalBet) {
        const historyItem = {
            results,
            sum,
            profit: winnings - totalBet,
            timestamp: new Date()
        };
        gameHistory = [historyItem, ...gameHistory.slice(0, 9)];
    }

    function getDiceEmoji(num) {
        const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return emojis[num - 1];
    }
</script>

<svelte:head>
    <title>다이사이 (Sic Bo) - LuckyMesh Casino</title>
</svelte:head>

<main class="container mx-auto px-4 py-8">
    <!-- Dice Display Area -->
    <div class="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-2xl p-8 mb-8">
        <div class="flex flex-col items-center justify-center min-h-[300px]">
            <h2 class="text-white text-xl font-bold mb-6">주사위</h2>
            <div class="dice-container flex gap-6 mb-6">
                {#each diceValues as value, i}
                    <div class="dice" class:rolling
                        style="--final-x: {diceRotations[value - 1].x}deg; --final-y: {diceRotations[value - 1].y}deg;">
                        <div class="dice-face">
                            <span class="text-5xl">{getDiceEmoji(value)}</span>
                        </div>
                    </div>
                {/each}
            </div>
            {#if showResult}
                <div class="result-display text-white text-center">
                    <p class="text-3xl font-bold mb-2">합계: {result.sum}</p>
                    <p class="text-xl {result.winnings > totalBet ? 'text-green-300' : 'text-red-300'}">
                        {result.text}
                    </p>
                </div>
            {/if}
        </div>
    </div>

    <!-- Betting Table -->
    <div class="bg-white rounded-2xl shadow-2xl p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">베팅 테이블</h2>

        <!-- Sum Bets (4-17) -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">합계 베팅</h3>
            <div class="grid grid-cols-7 gap-2 mb-2">
                <div class="bet-area bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-4')} data-bet="sum-4" data-payout="60">
                    <div class="text-2xl font-bold">4</div><div class="text-sm">1:60</div><div class="chip-stack-container">{#if bets['sum-4']}{formatMoney(bets['sum-4'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-5')} data-bet="sum-5" data-payout="30">
                    <div class="text-2xl font-bold">5</div><div class="text-sm">1:30</div><div class="chip-stack-container">{#if bets['sum-5']}{formatMoney(bets['sum-5'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-6')} data-bet="sum-6" data-payout="17">
                    <div class="text-2xl font-bold">6</div><div class="text-sm">1:17</div><div class="chip-stack-container">{#if bets['sum-6']}{formatMoney(bets['sum-6'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-7')} data-bet="sum-7" data-payout="12">
                    <div class="text-2xl font-bold">7</div><div class="text-sm">1:12</div><div class="chip-stack-container">{#if bets['sum-7']}{formatMoney(bets['sum-7'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-8')} data-bet="sum-8" data-payout="8">
                    <div class="text-2xl font-bold">8</div><div class="text-sm">1:8</div><div class="chip-stack-container">{#if bets['sum-8']}{formatMoney(bets['sum-8'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-9')} data-bet="sum-9" data-payout="6">
                    <div class="text-2xl font-bold">9</div><div class="text-sm">1:6</div><div class="chip-stack-container">{#if bets['sum-9']}{formatMoney(bets['sum-9'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-10')} data-bet="sum-10" data-payout="6">
                    <div class="text-2xl font-bold">10</div><div class="text-sm">1:6</div><div class="chip-stack-container">{#if bets['sum-10']}{formatMoney(bets['sum-10'])}{/if}</div>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-2">
                 <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-11')} data-bet="sum-11" data-payout="6">
                    <div class="text-2xl font-bold">11</div><div class="text-sm">1:6</div><div class="chip-stack-container">{#if bets['sum-11']}{formatMoney(bets['sum-11'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-12')} data-bet="sum-12" data-payout="6">
                    <div class="text-2xl font-bold">12</div><div class="text-sm">1:6</div><div class="chip-stack-container">{#if bets['sum-12']}{formatMoney(bets['sum-12'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-13')} data-bet="sum-13" data-payout="8">
                    <div class="text-2xl font-bold">13</div><div class="text-sm">1:8</div><div class="chip-stack-container">{#if bets['sum-13']}{formatMoney(bets['sum-13'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-14')} data-bet="sum-14" data-payout="12">
                    <div class="text-2xl font-bold">14</div><div class="text-sm">1:12</div><div class="chip-stack-container">{#if bets['sum-14']}{formatMoney(bets['sum-14'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-15')} data-bet="sum-15" data-payout="17">
                    <div class="text-2xl font-bold">15</div><div class="text-sm">1:17</div><div class="chip-stack-container">{#if bets['sum-15']}{formatMoney(bets['sum-15'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-16')} data-bet="sum-16" data-payout="30">
                    <div class="text-2xl font-bold">16</div><div class="text-sm">1:30</div><div class="chip-stack-container">{#if bets['sum-16']}{formatMoney(bets['sum-16'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-lg text-center" on:click={() => placeBet('sum-17')} data-bet="sum-17" data-payout="60">
                    <div class="text-2xl font-bold">17</div><div class="text-sm">1:60</div><div class="chip-stack-container">{#if bets['sum-17']}{formatMoney(bets['sum-17'])}{/if}</div>
                </div>
            </div>
        </div>

        <!-- Small/Big Bets -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">소/대 베팅</h3>
            <div class="grid grid-cols-2 gap-4">
                <div class="bet-area bg-gradient-to-br from-red-400 to-red-600 text-white p-8 rounded-lg text-center" on:click={() => placeBet('small')} data-bet="small" data-payout="1">
                    <div class="text-3xl font-bold mb-2">소 (小)</div>
                    <div class="text-lg mb-1">4-10</div>
                    <div class="text-sm">1:1</div>
                    <div class="chip-stack-container">{#if bets['small']}{formatMoney(bets['small'])}{/if}</div>
                </div>
                <div class="bet-area bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-8 rounded-lg text-center" on:click={() => placeBet('big')} data-bet="big" data-payout="1">
                    <div class="text-3xl font-bold mb-2">대 (大)</div>
                    <div class="text-lg mb-1">11-17</div>
                    <div class="text-sm">1:1</div>
                    <div class="chip-stack-container">{#if bets['big']}{formatMoney(bets['big'])}{/if}</div>
                </div>
            </div>
        </div>
        
        <!-- Other bet types omitted for brevity, following the same pattern -->

    </div>

    <!-- Betting Controls -->
    <div class="bg-white rounded-2xl shadow-2xl p-6 mb-8 sticky bottom-4">
        <h3 class="text-xl font-bold text-gray-900 mb-4">베팅 컨트롤</h3>
        <div class="mb-6">
            <p class="text-sm text-gray-600 mb-3">칩 선택:</p>
            <div class="flex gap-4 justify-center flex-wrap">
                {#each chipValues as value}
                    <div class="chip bg-gradient-to-br text-white"
                        class:from-gray-400={value===1000} class:to-gray-600={value===1000}
                        class:from-blue-400={value===5000} class:to-blue-600={value===5000}
                        class:from-red-400={value===10000} class:to-red-600={value===10000}
                        class:from-yellow-400={value===50000} class:to-yellow-600={value===50000}
                        class:selected={selectedChip === value}
                        on:click={() => selectChip(value)}>
                        <span class="text-sm">{formatMoney(value)}</span>
                    </div>
                {/each}
            </div>
        </div>
        <div class="bg-gray-100 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center">
                <span class="text-gray-700 font-medium">현재 베팅:</span>
                <span class="text-2xl font-bold text-gray-900">{formatMoney(totalBet)}</span>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <button on:click={clearBets} class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg">
                <XCircle class="w-5 h-5 inline mr-2" />
                베팅 취소
            </button>
            <button on:click={rollDice} disabled={gameInProgress || totalBet === 0} class="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <Dice6 class="w-5 h-5 inline mr-2" />
                주사위 굴리기
            </button>
        </div>
    </div>

    <!-- Game Info Tabs -->
     <div class="bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex gap-4 mb-6 border-b">
                <button
                    class="tab-btn px-4 py-2 font-semibold transition"
                    class:active={activeTab === 'stats'}
                    on:click={() => activeTab = 'stats'}>
                    <BarChart3 class="w-4 h-4 inline mr-1" />
                    게임 통계
                </button>
                <button
                    class="tab-btn px-4 py-2 font-semibold transition"
                    class:active={activeTab === 'rules'}
                    on:click={() => activeTab = 'rules'}>
                    <BookOpen class="w-4 h-4 inline mr-1" />
                    게임 규칙
                </button>
                <button
                    class="tab-btn px-4 py-2 font-semibold transition"
                    class:active={activeTab === 'history'}
                    on:click={() => activeTab = 'history'}>
                    <History class="w-4 h-4 inline mr-1" />
                    최근 결과
                </button>
            </div>

            {#if activeTab === 'stats'}
            <div id="stats-tab" class="tab-content">
                <h3 class="text-lg font-bold text-gray-900 mb-4">게임 통계</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">총 게임</p>
                        <p class="text-2xl font-bold text-blue-600">{stats.totalGames}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">승리</p>
                        <p class="text-2xl font-bold text-green-600">{stats.totalWins}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">패배</p>
                        <p class="text-2xl font-bold text-red-600">{stats.totalLosses}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">순이익</p>
                        <p class="text-2xl font-bold text-yellow-600">{formatMoney(stats.netProfit)}</p>
                    </div>
                </div>
            </div>
            {:else if activeTab === 'rules'}
            <div id="rules-tab" class="tab-content">
                 <h3 class="text-lg font-bold text-gray-900 mb-4">다이사이 게임 규칙</h3>
                 <div class="space-y-4 text-gray-700">
                     <div>
                         <h4 class="font-semibold mb-2">🎲 게임 방법</h4>
                         <p class="text-sm">다이사이는 3개의 주사위를 사용하는 전통적인 아시아 카지노 게임입니다. 플레이어는 딜러가 굴리는 세 개의 주사위의 결과를 예측하여 베팅합니다. 다양한 베팅 옵션이 있으며, 각 베팅은 주사위의 합계, 특정 숫자 또는 특정 조합에 따라 승패가 결정됩니다. 게임의 목표는 주사위 결과가 자신의 베팅과 일치하도록 맞추는 것입니다.</p>
                     </div>
                     <div>
                         <h4 class="font-semibold mb-2">💰 베팅 종류 및 배당률</h4>
                         <ul class="text-sm space-y-1 list-disc list-inside">
                             <li><strong>소/대 (Small/Big):</strong>
                                 <p class="ml-4">주사위 세 개의 합계가 4에서 10 사이이면 '소'(Small)에 베팅한 사람이 승리합니다. 11에서 17 사이이면 '대'(Big)에 베팅한 사람이 승리합니다. 트리플(세 개의 주사위가 모두 같은 숫자)이 나오면 '소' 또는 '대' 베팅은 모두 패배합니다. 배당률: 1:1</p>
                             </li>
                             <li><strong>합계 (Total Sum):</strong>
                                 <p class="ml-4">주사위 세 개의 정확한 합계를 예측하여 베팅합니다. 합계 4 또는 17은 1:60, 5 또는 16은 1:30, 6 또는 15는 1:17, 7 또는 14는 1:12, 8 또는 13은 1:8, 9, 10, 11, 12는 1:6 등 다양한 배당률을 가집니다. (트리플 제외)</p>
                             </li>
                             <li><strong>단일 숫자 (Single Number):</strong>
                                 <p class="ml-4">특정 숫자가 나올 것을 예측하여 베팅합니다. 선택한 숫자가 주사위 중 하나에 나오면 1:1, 두 개에 나오면 1:2, 세 개에 나오면 1:3의 배당을 받습니다.</p>
                             </li>
                             <li><strong>더블 (Double):</strong>
                                 <p class="ml-4">두 개의 주사위가 같은 숫자가 나올 것을 예측하여 베팅합니다. (예: 두 개의 주사위가 1이 나올 경우). 예측한 더블이 나오면 배당률은 1:10입니다. 트리플이 나올 경우 더블 베팅은 패배합니다.</p>
                             </li>
                             <li><strong>트리플 (Triple / Specific Triple):</strong>
                                 <p class="ml-4">세 개의 주사위가 모두 같은 숫자가 나올 것을 예측하여 베팅합니다. 특정 숫자의 트리플(예: 세 개의 주사위가 모두 1이 나올 경우)에 베팅하면 배당률은 1:180으로 매우 높습니다.</p>
                             </li>
                             <li><strong>ANY 트리플 (Any Triple):</strong>
                                 <p class="ml-4">어떤 숫자든 상관없이 세 개의 주사위가 모두 같은 숫자가 나올 것을 예측하여 베팅합니다. 배당률은 1:30입니다.</p>
                             </li>
                         </ul>
                     </div>
                     <div>
                         <h4 class="font-semibold mb-2">📊 RTP (환수율)</h4>
                         <p class="text-sm">평균 RTP(Return To Player): 97.22% (베팅 종류에 따라 다름). 이는 장기적으로 플레이어가 베팅한 금액 중 평균적으로 돌려받을 수 있는 비율을 의미합니다.</p>
                     </div>
                     <div>
                         <h4 class="font-semibold mb-2">💵 베팅 범위</h4>
                         <p class="text-sm">최소: ₩1,000 ~ 최대: ₩500,000. 각 테이블마다 설정된 최소/최대 베팅 금액이 다를 수 있습니다.</p>
                     </div>
                 </div>
            </div>
            {:else if activeTab === 'history'}
            <div id="history-tab" class="tab-content">
                <h3 class="text-lg font-bold text-gray-900 mb-4">최근 결과</h3>
                <div class="space-y-2">
                    {#if gameHistory.length === 0}
                        <p class="text-gray-500 text-center py-8">아직 게임 기록이 없습니다.</p>
                    {:else}
                        {#each gameHistory as item}
                            <div class="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <div class="font-mono text-2xl mb-1">
                                        {item.results.map(r => getDiceEmoji(r)).join(' ')}
                                    </div>
                                    <div class="text-sm text-gray-600">합계: {item.sum}</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold {item.profit > 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.profit > 0 ? '+' : ''}{formatMoney(item.profit)}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {item.timestamp.toLocaleTimeString('ko-KR')}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            {/if}
        </div>
</main>

<style>
    .dice-container {
        perspective: 1000px;
    }

    .dice {
        width: 80px;
        height: 80px;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dice.rolling {
        animation: diceRoll 2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes diceRoll {
        0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(0.8);
        }

        50% {
            transform: rotateX(720deg) rotateY(540deg) rotateZ(360deg) scale(1.2);
        }

        100% {
            transform: rotateX(var(--final-x, 0deg)) rotateY(var(--final-y, 0deg)) rotateZ(0deg) scale(1);
        }
    }

    .dice-face {
        position: absolute;
        width: 80px;
        height: 80px;
        background: #020202ff; /* Light yellow */
        border: 2px solid #333;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .bet-area {
        transition: all 0.2s ease-out;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .bet-area:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .bet-area.active {
        animation: betActive 0.4s ease-out;
        border: 3px solid var(--casino-gold, #FFD700);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .bet-area.win {
        animation: betWin 0.8s ease-out 3;
    }

    @keyframes betActive {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes betWin {
        0%, 100% { background-color: inherit; transform: scale(1); }
        50% { background-color: var(--casino-gold, #FFD700); transform: scale(1.15); }
    }

    .chip {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.15s;
        border: 3px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .chip:hover {
        transform: translateY(-5px) scale(1.1);
    }

    .chip.selected {
        animation: chipSelect 0.15s;
        border-color: white;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.5);
    }
    
    @keyframes chipSelect {
        0%, 100% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.1) translateY(-5px); }
    }

    .chip-stack-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0,0,0,0.5);
        color: white;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 12px;
    }

    .result-display {
        animation: resultShow 0.5s ease-out;
    }

    @keyframes resultShow {
        from { transform: scale(0); opacity: 0; filter: blur(10px); }
        50% { transform: scale(1.2); }
        to { transform: scale(1); opacity: 1; filter: blur(0); }
    }
    
    .tab-btn.active {
        --tw-border-opacity: 1;
        border-color: rgb(59 130 246 / var(--tw-border-opacity));
        --tw-text-opacity: 1;
        color: rgb(37 99 235 / var(--tw-text-opacity));
        border-bottom-width: 2px;
   }
</style>