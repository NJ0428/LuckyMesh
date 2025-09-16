<script>
  import { onMount } from 'svelte';
  
  export let count = 6;
  export let colors = [
    'from-pastel-pink to-pastel-peach',
    'from-pastel-mint to-pastel-cream',
    'from-pastel-peach to-pastel-sky'
  ];
  
  let elements = [];
  
  onMount(() => {
    // 랜덤한 위치와 크기의 떠다니는 요소들 생성
    elements = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 40, // 40-100px
      left: Math.random() * 90 + 5, // 5-95%
      top: Math.random() * 80 + 10, // 10-90%
      delay: Math.random() * 3, // 0-3s delay
      duration: Math.random() * 2 + 3, // 3-5s duration
      gradient: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.2 // 0.2-0.6
    }));
  });
</script>

<div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
  {#each elements as element (element.id)}
    <div 
      class="absolute rounded-full bg-gradient-to-br {element.gradient} floating-element"
      style="
        width: {element.size}px;
        height: {element.size}px;
        left: {element.left}%;
        top: {element.top}%;
        opacity: {element.opacity};
        animation-delay: {element.delay}s;
        animation-duration: {element.duration}s;
      "
    ></div>
  {/each}
</div>

<style>
  .floating-element {
    animation: float ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg); 
    }
    33% { 
      transform: translateY(-20px) rotate(120deg); 
    }
    66% { 
      transform: translateY(10px) rotate(240deg); 
    }
  }
</style>