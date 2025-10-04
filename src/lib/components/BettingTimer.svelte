<script>
  import { onMount, onDestroy } from 'svelte';

  export let duration = 30; // seconds
  export let active = false;
  export let onTimeUp = () => {};

  let timeLeft = duration;
  let interval;

  $: if (active) {
    startTimer();
  } else {
    stopTimer();
    timeLeft = duration;
  }

  function startTimer() {
    stopTimer();
    timeLeft = duration;

    interval = setInterval(() => {
      timeLeft--;

      if (timeLeft <= 0) {
        stopTimer();
        onTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  onDestroy(() => {
    stopTimer();
  });

  $: percentage = ((timeLeft / duration) * 100);
  $: urgentMode = timeLeft <= 5;
</script>

{#if active}
  <div class="bg-white rounded-lg p-3 shadow-lg border-2 {urgentMode ? 'border-red-500 animate-pulse' : 'border-gray-300'}">
    <div class="flex items-center justify-between mb-2">
      <span class="font-bold text-sm {urgentMode ? 'text-red-600' : 'text-gray-700'}">
        {urgentMode ? '⏰ 시간 촉박!' : '⏱️ 베팅 시간'}
      </span>
      <span class="text-2xl font-bold {urgentMode ? 'text-red-600' : 'text-blue-600'}">
        {timeLeft}s
      </span>
    </div>

    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        class="h-3 rounded-full transition-all duration-1000 {
          urgentMode ? 'bg-red-500' :
          timeLeft <= 10 ? 'bg-yellow-500' :
          'bg-blue-500'
        }"
        style="width: {percentage}%"
      ></div>
    </div>
  </div>
{/if}
