/**
 * Voice In Engine - Web Speech Recognition, Visualizer & Push-to-Talk
 */
class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.continuousMode = false;
    this.lang = 'en-IN';
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.isSpacePressed = false;

    // Audio Visualizer Context
    this.audioCtx = null;
    this.analyser = null;
    this.mediaStream = null;
    this.visualizerCanvas = null;
    this.visualizerCtx = null;
    this.animationFrameId = null;

    // Callbacks
    this.onStateChange = null;
    this.onTranscriptUpdate = null;
    this.onFinalResult = null;
    this.onError = null;

    this.initRecognition();
    this.initKeyboardShortcuts();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStateChange) this.onStateChange('listening');
      if (window.soundEffects) window.soundEffects.playMicStart();
      this.startVisualizer();
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      this.interimTranscript = interim;

      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(this.finalTranscript, this.interimTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.stopVisualizer();
      if (window.soundEffects) window.soundEffects.playMicStop();

      const resultText = (this.finalTranscript || this.interimTranscript).trim();
      this.finalTranscript = '';
      this.interimTranscript = '';

      if (this.onStateChange) this.onStateChange('idle');

      if (resultText && this.onFinalResult) {
        this.onFinalResult(resultText);
      }
    };

    return true;
  }

  // Spacebar Push-to-Talk (Hold Spacebar to speak like a walkie-talkie!)
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && !this.isSpacePressed && !this.isListening) {
        e.preventDefault();
        this.isSpacePressed = true;
        this.startListening();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && this.isSpacePressed) {
        e.preventDefault();
        this.isSpacePressed = false;
        this.stopListening();
      }
    });
  }

  setLanguage(langCode) {
    this.lang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  startListening() {
    if (!this.recognition) {
      if (!this.initRecognition()) {
        alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Brave.');
        return;
      }
    }
    if (this.isListening) return;

    this.finalTranscript = '';
    this.interimTranscript = '';

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Live Canvas Waveform & Frequency Visualizer
  async startVisualizer() {
    try {
      this.visualizerCanvas = document.getElementById('waveCanvas');
      if (!this.visualizerCanvas) return;
      this.visualizerCtx = this.visualizerCanvas.getContext('2d');

      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!this.isListening) return;
        this.animationFrameId = requestAnimationFrame(draw);

        this.analyser.getByteFrequencyData(dataArray);

        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        this.visualizerCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.9;

          const gradient = this.visualizerCtx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(192, 132, 252, 1)');

          this.visualizerCtx.fillStyle = gradient;
          this.visualizerCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn('Microphone stream access not granted for visualizer:', err);
      this.drawIdleWaveform();
    }
  }

  stopVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.drawIdleWaveform();
  }

  drawIdleWaveform() {
    if (!this.visualizerCanvas) {
      this.visualizerCanvas = document.getElementById('waveCanvas');
    }
    if (!this.visualizerCanvas) return;
    this.visualizerCtx = this.visualizerCanvas.getContext('2d');
    const width = this.visualizerCanvas.width;
    const height = this.visualizerCanvas.height;
    this.visualizerCtx.clearRect(0, 0, width, height);

    this.visualizerCtx.beginPath();
    this.visualizerCtx.moveTo(0, height / 2);
    this.visualizerCtx.lineTo(width, height / 2);
    this.visualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.visualizerCtx.lineWidth = 1;
    this.visualizerCtx.stroke();
  }
}

window.voiceEngine = new VoiceEngine();
