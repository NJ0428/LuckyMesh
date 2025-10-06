import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 사운드 설정 초기값
const defaultSoundSettings = {
  enabled: true,
  masterVolume: 0.7,
  effectsVolume: 0.8,
  musicVolume: 0.5,
  cardSounds: true,
  chipSounds: true,
  winSounds: true,
  backgroundMusic: false
};

// 로컬 스토리지에서 설정 불러오기
function loadSoundSettings() {
  if (!browser) return defaultSoundSettings;

  try {
    const saved = localStorage.getItem('blackjack-sound-settings');
    if (saved) {
      return { ...defaultSoundSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load sound settings:', error);
  }

  return defaultSoundSettings;
}

// 로컬 스토리지에 설정 저장
function saveSoundSettings(settings) {
  if (!browser) return;

  try {
    localStorage.setItem('blackjack-sound-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save sound settings:', error);
  }
}

// 사운드 설정 스토어
export const soundSettings = writable(loadSoundSettings());

// Web Audio API를 사용한 사운드 생성
class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.effectsGain = null;
    this.musicGain = null;
    this.backgroundMusicBuffer = null;
    this.backgroundMusicSource = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (!browser || this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 마스터 게인 노드
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // 효과음 게인 노드
      this.effectsGain = this.audioContext.createGain();
      this.effectsGain.connect(this.masterGain);

      // 배경음악 게인 노드
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
      this.updateVolumes();
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  updateVolumes() {
    if (!this.isInitialized) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();

    this.masterGain.gain.value = settings.enabled ? settings.masterVolume : 0;
    this.effectsGain.gain.value = settings.effectsVolume;
    this.musicGain.gain.value = settings.musicVolume;
  }

  // 카드 딜링 사운드
  async playCardDeal() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.cardSounds) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // 카드 플립 사운드
  async playCardFlip() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.cardSounds) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // 칩 베팅 사운드
  async playChipBet() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.chipSounds) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // 승리 사운드
  async playWin() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.winSounds) return;

    // 멜로디 시퀀스
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    let time = this.audioContext.currentTime;

    melody.forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.effectsGain);

      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      oscillator.start(time);
      oscillator.stop(time + 0.3);

      time += 0.2;
    });
  }

  // 패배 사운드
  async playLose() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.winSounds) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // 블랙잭 사운드
  async playBlackjack() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.winSounds) return;

    // 더 화려한 승리 사운드
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    let time = this.audioContext.currentTime;

    melody.forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.effectsGain);

      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0.4, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      oscillator.start(time);
      oscillator.stop(time + 0.4);

      time += 0.15;
    });
  }

  // 버튼 클릭 사운드
  async playButtonClick() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 배경음악 생성 (간단한 루프)
  async generateBackgroundMusic() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    // 간단한 화음 진행으로 배경음악 생성
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 277.18, 329.63], // A minor
      [246.94, 311.13, 369.99], // F major
      [196.00, 246.94, 293.66]  // G major
    ];

    let chordIndex = 0;
    const playChord = () => {
      let settings;
      soundSettings.subscribe(s => settings = s)();
      if (!settings.enabled || !settings.backgroundMusic) return;

      const chord = chordProgression[chordIndex % chordProgression.length];

      chord.forEach(frequency => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
      });

      chordIndex++;
    };

    // 2초마다 코드 변경
    setInterval(playChord, 2000);
    playChord(); // 즉시 시작
  }

  // 셔플 사운드
  async playShuffle() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled || !settings.cardSounds) return;

    // 여러 개의 짧은 노이즈로 셔플 효과
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.effectsGain);

        oscillator.frequency.setValueAtTime(100 + Math.random() * 200, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
      }, i * 50);
    }
  }

  // 룰렛 스핀 사운드
  async playRouletteSpin() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled) return;

    // 회전 소리 (낮은 주파수 떨림)
    const duration = 3.5;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    lfo.frequency.setValueAtTime(10, this.audioContext.currentTime);
    lfo.frequency.exponentialRampToValueAtTime(2, this.audioContext.currentTime + duration);
    lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    lfo.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
    lfo.stop(this.audioContext.currentTime + duration);
  }

  // 룰렛 공 튕김 사운드
  async playRouletteBounce() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled) return;

    // 공 튕기는 소리 (여러 번의 짧은 클릭)
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.effectsGain);

        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime);
        oscillator.type = 'square';

        const volume = 0.15 * (1 - i / 10);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
      }, i * 150 + Math.random() * 50);
    }
  }

  // 룰렛 종료 사운드
  async playRouletteFinal() {
    if (!this.isInitialized) await this.initialize();
    if (!this.audioContext) return;

    let settings;
    soundSettings.subscribe(s => settings = s)();
    if (!settings.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

// 전역 사운드 생성기 인스턴스
export const soundGenerator = new SoundGenerator();

// 사운드 설정 액션들
export const soundActions = {
  updateSettings(newSettings) {
    soundSettings.update(settings => {
      const updated = { ...settings, ...newSettings };
      saveSoundSettings(updated);
      soundGenerator.updateVolumes();
      return updated;
    });
  },

  toggleEnabled() {
    soundSettings.update(settings => {
      const updated = { ...settings, enabled: !settings.enabled };
      saveSoundSettings(updated);
      soundGenerator.updateVolumes();
      return updated;
    });
  },

  setMasterVolume(volume) {
    this.updateSettings({ masterVolume: Math.max(0, Math.min(1, volume)) });
  },

  setEffectsVolume(volume) {
    this.updateSettings({ effectsVolume: Math.max(0, Math.min(1, volume)) });
  },

  setMusicVolume(volume) {
    this.updateSettings({ musicVolume: Math.max(0, Math.min(1, volume)) });
  },

  toggleBackgroundMusic() {
    soundSettings.update(settings => {
      const updated = { ...settings, backgroundMusic: !settings.backgroundMusic };
      saveSoundSettings(updated);

      if (updated.backgroundMusic) {
        soundGenerator.generateBackgroundMusic();
      }

      return updated;
    });
  },

  // 사운드 재생 메소드들
  playCardDeal: () => soundGenerator.playCardDeal(),
  playCardFlip: () => soundGenerator.playCardFlip(),
  playChipBet: () => soundGenerator.playChipBet(),
  playWin: () => soundGenerator.playWin(),
  playLose: () => soundGenerator.playLose(),
  playBlackjack: () => soundGenerator.playBlackjack(),
  playButtonClick: () => soundGenerator.playButtonClick(),
  playShuffle: () => soundGenerator.playShuffle(),
  playRouletteSpin: () => soundGenerator.playRouletteSpin(),
  playRouletteBounce: () => soundGenerator.playRouletteBounce(),
  playRouletteFinal: () => soundGenerator.playRouletteFinal()
};