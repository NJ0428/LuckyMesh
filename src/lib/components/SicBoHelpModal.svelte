<script>
  import { createEventDispatcher } from 'svelte';

  export let showModal = false;

  const dispatch = createEventDispatcher();

  function closeModal() {
    showModal = false;
    dispatch('close');
  }
</script>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="modal-close-button" on:click={closeModal}>&times;</button>
      <h2 class="text-2xl font-bold mb-4">Sic Bo Game Help</h2>
      <p class="mb-2">Sic Bo is an ancient Chinese dice game, played with three dice.</p>
      <p class="mb-2">The goal is to predict the outcome of the three dice rolled by the dealer.</p>
      <h3 class="text-xl font-semibold mt-4 mb-2">Bet Types:</h3>
      <ul class="list-disc list-inside mb-4">
        <li><strong>Big/Small:</strong> Bet on the total being between 11-17 (Big) or 4-10 (Small). Excludes triples.</li>
        <li><strong>Specific Triples:</strong> Bet on a specific triple (e.g., three 1s, three 2s, etc.).</li>
        <li><strong>Any Triple:</strong> Bet on any triple appearing.</li>
        <li><strong>Specific Doubles:</strong> Bet on a specific double appearing (e.g., two 1s, two 2s, etc.).</li>
        <li><strong>Three Dice Total:</strong> Bet on the exact total of the three dice (4 to 17).</li>
        <li><strong>Dice Combination:</strong> Bet on two specific dice showing a combination (e.g., 1 and 2).</li>
        <li><strong>Single Die Bet:</strong> Bet on a specific number appearing on one, two, or all three dice.</li>
      </ul>
      <p>Odds vary depending on the bet type and are displayed on the betting table.</p>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #333; /* Darker background for contrast */
    color: #eee; /* Light text color */
    padding: 2.5rem; /* Increased padding */
    border-radius: 12px; /* More rounded corners */
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); /* More prominent shadow */
    border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
    animation: fadeIn 0.3s ease-out; /* Add fade-in animation */
  }

  .modal-close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #fff;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }

  .modal-close-button:hover {
    color: #ff4500; /* Orange-red on hover */
  }

  h2 {
    color: #4CAF50; /* Green highlight for titles */
    border-bottom: 2px solid rgba(76, 175, 80, 0.5); /* Underline effect */
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }

  h3 {
    color: #FFA726; /* Orange highlight for subtitles */
  }

  strong {
    color: #81C784; /* Lighter green for strong text */
  }

  ul {
    margin-left: 1.5rem;
  }

  /* Keyframe animation for modal */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
