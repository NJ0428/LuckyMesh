<script>
  export let roadmaps = {
    beadRoad: [],
    bigRoad: [],
    bigEyeRoad: [],
    smallRoad: [],
    cockroachRoad: []
  };
</script>

<div class="bg-white rounded-lg p-4 text-black">
  <h3 class="font-bold text-lg mb-4 text-center">로드맵</h3>

  <div class="space-y-4">
    <!-- Bead Road (주사위 길) -->
    <div>
      <h4 class="text-sm font-bold mb-2">Bead Road (주사위 길)</h4>
      <div class="grid grid-cols-12 gap-1 bg-gray-100 p-2 rounded min-h-[80px]">
        {#each roadmaps.beadRoad.slice(0, 60) as result, index}
          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs {
            result.winner === 'player' ? 'border-blue-500 bg-blue-100' :
            result.winner === 'banker' ? 'border-red-500 bg-red-100' :
            'border-green-500 bg-green-100'
          }">
            {#if result.playerPair}<span class="text-blue-600">P</span>{/if}
            {#if result.bankerPair}<span class="text-red-600">B</span>{/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Big Road (대로) -->
    <div>
      <h4 class="text-sm font-bold mb-2">Big Road (대로)</h4>
      <div class="bg-gray-100 p-2 rounded min-h-[100px] overflow-x-auto">
        <div class="flex gap-1">
          {#each roadmaps.bigRoad as column}
            <div class="flex flex-col gap-1">
              {#each column as result}
                <div class="w-6 h-6 rounded-full border-2 {
                  result.winner === 'player' ? 'border-blue-500 bg-blue-50' :
                  'border-red-500 bg-red-50'
                } {result.tie ? 'ring-2 ring-green-500' : ''}">
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Derived Roads -->
    <div class="grid grid-cols-3 gap-2">
      <!-- Big Eye Road -->
      <div>
        <h4 class="text-xs font-bold mb-1">Big Eye</h4>
        <div class="bg-gray-100 p-1 rounded min-h-[60px] flex flex-wrap gap-0.5">
          {#each roadmaps.bigEyeRoad.slice(0, 30) as color}
            <div class="w-3 h-3 rounded-full {
              color === 'red' ? 'bg-red-500' : 'bg-blue-500'
            }"></div>
          {/each}
        </div>
      </div>

      <!-- Small Road -->
      <div>
        <h4 class="text-xs font-bold mb-1">Small Road</h4>
        <div class="bg-gray-100 p-1 rounded min-h-[60px] flex flex-wrap gap-0.5">
          {#each roadmaps.smallRoad.slice(0, 30) as color}
            <div class="w-3 h-3 rounded-full {
              color === 'red' ? 'bg-red-500' : 'bg-blue-500'
            }"></div>
          {/each}
        </div>
      </div>

      <!-- Cockroach Road -->
      <div>
        <h4 class="text-xs font-bold mb-1">Cockroach</h4>
        <div class="bg-gray-100 p-1 rounded min-h-[60px] flex flex-wrap gap-0.5">
          {#each roadmaps.cockroachRoad.slice(0, 30) as color}
            <div class="w-3 h-3 rounded-full {
              color === 'red' ? 'bg-red-500' : 'bg-blue-500'
            }"></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
