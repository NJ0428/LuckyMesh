<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let currentUser = null;
  let loading = false;
  let selectedPaymentMethod = 'card';
  let selectedAmount = 0;
  let customAmount = '';
  let paymentStep = 1; // 1: 금액선택, 2: 결제방법, 3: 결제처리

  // 사전 정의된 충전 금액
  const presetAmounts = [
    { value: 10000, label: '₩10,000' },
    { value: 30000, label: '₩30,000' },
    { value: 50000, label: '₩50,000' },
    { value: 100000, label: '₩100,000' },
    { value: 300000, label: '₩300,000' },
    { value: 500000, label: '₩500,000' }
  ];

  // 결제 방법 목록
  const paymentMethods = [
    {
      id: 'card',
      name: '신용/체크카드',
      icon: '💳',
      description: '비자, 마스터카드, JCB 지원',
      fee: '무료',
      processingTime: '즉시'
    },
    {
      id: 'bank',
      name: '계좌이체',
      icon: '🏦',
      description: '모든 은행 계좌이체',
      fee: '무료',
      processingTime: '1-3분'
    },
    {
      id: 'mobile',
      name: '모바일 결제',
      icon: '📱',
      description: '카카오페이, 삼성페이, 네이버페이',
      fee: '무료',
      processingTime: '즉시'
    },
    {
      id: 'crypto',
      name: '암호화폐',
      icon: '₿',
      description: 'BTC, ETH, USDT 지원',
      fee: '네트워크 수수료',
      processingTime: '10-30분'
    }
  ];

  // 카드 정보
  let cardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  // 계좌이체 정보
  let bankInfo = {
    bank: '',
    account: '',
    holder: ''
  };

  const unsubscribe = user.subscribe((u) => {
    currentUser = u;
  });

  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    return () => unsubscribe();
  });

  function selectAmount(amount) {
    selectedAmount = amount;
    customAmount = '';
  }

  function handleCustomAmount() {
    const amount = parseInt(customAmount);
    if (amount && amount >= 10000) {
      selectedAmount = amount;
    }
  }

  function nextStep() {
    if (paymentStep === 1 && selectedAmount >= 10000) {
      paymentStep = 2;
    } else if (paymentStep === 2 && selectedPaymentMethod) {
      paymentStep = 3;
    }
  }

  function prevStep() {
    if (paymentStep > 1) {
      paymentStep--;
    }
  }

  function resetPayment() {
    paymentStep = 1;
    selectedAmount = 0;
    customAmount = '';
    selectedPaymentMethod = 'card';
    cardInfo = { number: '', expiry: '', cvv: '', name: '' };
    bankInfo = { bank: '', account: '', holder: '' };
  }

  async function processPayment() {
    if (!selectedAmount || selectedAmount < 10000) {
      alert('최소 충전 금액은 10,000원입니다.');
      return;
    }

    loading = true;
    try {
      // 결제 방법별 검증
      if (selectedPaymentMethod === 'card') {
        if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
          alert('카드 정보를 모두 입력해주세요.');
          loading = false;
          return;
        }
      } else if (selectedPaymentMethod === 'bank') {
        if (!bankInfo.bank || !bankInfo.account || !bankInfo.holder) {
          alert('계좌 정보를 모두 입력해주세요.');
          loading = false;
          return;
        }
      }

      // 결제 처리 시뮬레이션 (실제로는 PG사 API 호출)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 성공 시 잔액 업데이트 (실제로는 서버에서 처리)
      if (currentUser) {
        currentUser.balance = (currentUser.balance || 0) + selectedAmount;

        // 사용자 스토어 업데이트
        user.update(u => ({
          ...u,
          balance: currentUser.balance
        }));
      }

      alert(`₩${selectedAmount.toLocaleString()} 충전이 완료되었습니다!`);
      resetPayment();

    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      loading = false;
    }
  }

  function formatCardNumber(value) {
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').match(/.{1,4}/g)?.join(' ') || '';
  }

  function formatExpiry(value) {
    return value.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').substr(0, 5);
  }

  function handleCardNumberInput(event) {
    cardInfo.number = formatCardNumber(event.target.value);
  }

  function handleExpiryInput(event) {
    cardInfo.expiry = formatExpiry(event.target.value);
  }
</script>

<section class="max-w-4xl mx-auto p-6">
  {#if $isAuthenticated && currentUser}
    <div class="space-y-6">
      <!-- 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold pastel-gradient-text font-playfair mb-2">결제</h1>
        <p class="text-gray-400 font-poppins">안전하고 빠른 충전 서비스</p>
      </div>

      <!-- 현재 잔액 표시 -->
      <PastelCard>
        <div class="p-6 text-center">
          <div class="text-sm text-gray-400 mb-2">현재 잔액</div>
          <div class="text-4xl font-bold pastel-gradient-text">
            ₩{(currentUser.balance || 0).toLocaleString()}
          </div>
        </div>
      </PastelCard>

      <!-- 진행 단계 표시 -->
      <div class="flex justify-center space-x-8 mb-8">
        {#each ['금액 선택', '결제 방법', '결제 처리'] as step, index}
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        {paymentStep > index + 1 ? 'bg-green-500 text-white' :
                         paymentStep === index + 1 ? 'bg-primary-soft-pink text-white' :
                         'bg-gray-600 text-gray-300'}">
              {paymentStep > index + 1 ? '✓' : index + 1}
            </div>
            <span class="text-sm font-poppins {paymentStep === index + 1 ? 'text-primary-soft-pink font-semibold' : 'text-gray-400'}">
              {step}
            </span>
          </div>
        {/each}
      </div>

      <!-- 단계별 컨텐츠 -->
      {#if paymentStep === 1}
        <!-- 1단계: 금액 선택 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-6 text-primary-soft-purple">💰 충전 금액 선택</h2>

            <!-- 사전 정의된 금액 -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {#each presetAmounts as amount}
                <button
                  on:click={() => selectAmount(amount.value)}
                  class="p-4 rounded-lg border-2 transition-all font-poppins font-semibold
                         {selectedAmount === amount.value ?
                           'border-primary-soft-pink bg-primary-soft-pink/20 text-primary-soft-pink' :
                           'border-white/20 hover:border-primary-soft-pink/50 text-gray-300 hover:text-primary-soft-pink'}"
                >
                  {amount.label}
                </button>
              {/each}
            </div>

            <!-- 직접 입력 -->
            <div class="space-y-4">
              <label class="block text-gray-300 font-poppins">직접 입력 (최소 ₩10,000)</label>
              <div class="flex space-x-4">
                <input
                  type="number"
                  bind:value={customAmount}
                  on:input={handleCustomAmount}
                  placeholder="직접 입력"
                  min="10000"
                  class="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                />
                <PastelButton variant="secondary" on:click={handleCustomAmount}>
                  적용
                </PastelButton>
              </div>
            </div>

            {#if selectedAmount > 0}
              <div class="mt-6 p-4 bg-primary-soft-pink/10 rounded-lg border border-primary-soft-pink/30">
                <div class="text-center">
                  <div class="text-sm text-gray-400">선택된 충전 금액</div>
                  <div class="text-2xl font-bold text-primary-soft-pink">₩{selectedAmount.toLocaleString()}</div>
                </div>
              </div>
            {/if}

            <div class="flex justify-end mt-6">
              <PastelButton
                variant="primary"
                disabled={selectedAmount < 10000}
                on:click={nextStep}
              >
                다음 단계
              </PastelButton>
            </div>
          </div>
        </PastelCard>

      {:else if paymentStep === 2}
        <!-- 2단계: 결제 방법 선택 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-6 text-primary-soft-purple">💳 결제 방법 선택</h2>

            <div class="grid gap-4 mb-6">
              {#each paymentMethods as method}
                <button
                  on:click={() => selectedPaymentMethod = method.id}
                  class="p-4 rounded-lg border-2 text-left transition-all
                         {selectedPaymentMethod === method.id ?
                           'border-primary-soft-pink bg-primary-soft-pink/20' :
                           'border-white/20 hover:border-primary-soft-pink/50'}"
                >
                  <div class="flex items-center space-x-4">
                    <span class="text-2xl">{method.icon}</span>
                    <div class="flex-1">
                      <div class="font-semibold text-white font-poppins">{method.name}</div>
                      <div class="text-sm text-gray-400">{method.description}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        수수료: {method.fee} | 처리시간: {method.processingTime}
                      </div>
                    </div>
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center
                               {selectedPaymentMethod === method.id ? 'border-primary-soft-pink bg-primary-soft-pink' : 'border-gray-400'}">
                      {#if selectedPaymentMethod === method.id}
                        <div class="w-3 h-3 rounded-full bg-white"></div>
                      {/if}
                    </div>
                  </div>
                </button>
              {/each}
            </div>

            <div class="flex justify-between">
              <PastelButton variant="secondary" on:click={prevStep}>
                이전 단계
              </PastelButton>
              <PastelButton variant="primary" on:click={nextStep}>
                결제 정보 입력
              </PastelButton>
            </div>
          </div>
        </PastelCard>

      {:else if paymentStep === 3}
        <!-- 3단계: 결제 정보 입력 및 처리 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-6 text-primary-soft-purple">🔒 결제 정보 입력</h2>

            <!-- 결제 요약 -->
            <div class="mb-6 p-4 bg-black/30 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">충전 금액:</span>
                <span class="text-xl font-bold text-primary-soft-pink">₩{selectedAmount.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-gray-300">결제 방법:</span>
                <span class="text-white">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</span>
              </div>
            </div>

            <!-- 결제 방법별 입력 폼 -->
            {#if selectedPaymentMethod === 'card'}
              <div class="space-y-4 mb-6">
                <div>
                  <label class="block text-gray-300 mb-2 font-poppins">카드 번호</label>
                  <input
                    type="text"
                    bind:value={cardInfo.number}
                    on:input={handleCardNumberInput}
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-gray-300 mb-2 font-poppins">유효기간</label>
                    <input
                      type="text"
                      bind:value={cardInfo.expiry}
                      on:input={handleExpiryInput}
                      placeholder="MM/YY"
                      maxlength="5"
                      class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-gray-300 mb-2 font-poppins">CVV</label>
                    <input
                      type="text"
                      bind:value={cardInfo.cvv}
                      placeholder="123"
                      maxlength="4"
                      class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-gray-300 mb-2 font-poppins">카드 소유자명</label>
                  <input
                    type="text"
                    bind:value={cardInfo.name}
                    placeholder="홍길동"
                    class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                  />
                </div>
              </div>

            {:else if selectedPaymentMethod === 'bank'}
              <div class="space-y-4 mb-6">
                <div>
                  <label class="block text-gray-300 mb-2 font-poppins">은행 선택</label>
                  <select
                    bind:value={bankInfo.bank}
                    class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-primary-soft-pink focus:outline-none"
                  >
                    <option value="">은행을 선택하세요</option>
                    <option value="kb">KB국민은행</option>
                    <option value="shinhan">신한은행</option>
                    <option value="woori">우리은행</option>
                    <option value="hana">하나은행</option>
                    <option value="nh">NH농협은행</option>
                    <option value="ibk">IBK기업은행</option>
                  </select>
                </div>
                <div>
                  <label class="block text-gray-300 mb-2 font-poppins">계좌번호</label>
                  <input
                    type="text"
                    bind:value={bankInfo.account}
                    placeholder="123-456-789012"
                    class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-gray-300 mb-2 font-poppins">예금주명</label>
                  <input
                    type="text"
                    bind:value={bankInfo.holder}
                    placeholder="홍길동"
                    class="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-primary-soft-pink focus:outline-none"
                  />
                </div>
              </div>

            {:else if selectedPaymentMethod === 'mobile'}
              <div class="text-center py-8">
                <div class="text-6xl mb-4">📱</div>
                <p class="text-gray-300 mb-4">모바일 결제는 다음 단계에서 앱으로 연결됩니다.</p>
                <p class="text-sm text-gray-500">카카오페이, 삼성페이, 네이버페이 중 선택하여 결제하세요.</p>
              </div>

            {:else if selectedPaymentMethod === 'crypto'}
              <div class="text-center py-8">
                <div class="text-6xl mb-4">₿</div>
                <p class="text-gray-300 mb-4">암호화폐 결제는 별도 지갑 주소로 전송됩니다.</p>
                <p class="text-sm text-gray-500">비트코인, 이더리움, USDT 지원</p>
              </div>
            {/if}

            <!-- 보안 안내 -->
            <div class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div class="flex items-center space-x-2 text-green-400">
                <span>🔒</span>
                <span class="font-poppins font-semibold">보안 결제</span>
              </div>
              <p class="text-sm text-gray-300 mt-2">
                모든 결제 정보는 SSL 암호화로 보호되며, PCI DSS 인증을 받은 안전한 결제 시스템을 사용합니다.
              </p>
            </div>

            <div class="flex justify-between">
              <PastelButton variant="secondary" on:click={prevStep}>
                이전 단계
              </PastelButton>
              <PastelButton
                variant="primary"
                disabled={loading}
                on:click={processPayment}
              >
                {loading ? '결제 처리 중...' : `₩${selectedAmount.toLocaleString()} 결제하기`}
              </PastelButton>
            </div>
          </div>
        </PastelCard>
      {/if}

      <!-- 취소 버튼 -->
      <div class="text-center">
        <PastelButton variant="danger" on:click={resetPayment}>
          결제 취소
        </PastelButton>
      </div>
    </div>

  {:else}
    <PastelCard>
      <div class="p-8 text-center">
        <h3 class="text-2xl font-semibold pastel-gradient-text mb-4">로그인이 필요합니다</h3>
        <p class="text-gray-400 mb-6 font-poppins">결제를 진행하려면 먼저 로그인하세요.</p>
        <div class="space-x-4">
          <PastelButton variant="primary" on:click={() => goto('/login')}>
            로그인
          </PastelButton>
          <PastelButton variant="secondary" on:click={() => goto('/signup')}>
            회원가입
          </PastelButton>
        </div>
      </div>
    </PastelCard>
  {/if}
</section>

<style>
  input:focus, select:focus {
    box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.3);
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>