/**
 * Voice Out Engine - Speech Synthesis Controller
 * Speaks responses back cleanly using the Web Speech Synthesis API
 */
class SpeechSynthesizer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.enabled = true;
    this.isSpeaking = false;
    this.onStartCallback = null;
    this.onEndCallback = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getBestVoice(lang = 'en-IN') {
    this.loadVoices();
    if (!this.voices || this.voices.length === 0) return null;

    // Check user custom selection first
    if (this.selectedVoice) return this.selectedVoice;

    // Find language matches
    const langPrefix = lang.split('-')[0].toLowerCase();

    // 1. Exact match e.g. en-IN or hi-IN
    let match = this.voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
    if (match) return match;

    // 2. Google / Natural / Neural voices
    match = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Natural')));
    if (match) return match;

    // 3. Any voice matching the language prefix
    match = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (match) return match;

    // Fallback to default
    return this.voices.find(v => v.default) || this.voices[0];
  }

  speak(text, lang = 'en-IN') {
    if (!this.enabled || !text || !this.synth) return;

    // Stop any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang;
    }

    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStartCallback) this.onStartCallback(text);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      if (this.onEndCallback) this.onEndCallback();
    };

    // Small delay to ensure previous speech cancelled
    setTimeout(() => {
      this.synth.speak(utterance);
    }, 50);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onEndCallback) this.onEndCallback();
    }
  }
}

window.speechSynthesizer = new SpeechSynthesizer();
