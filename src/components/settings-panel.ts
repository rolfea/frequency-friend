import type { Config } from '../domain/note.js';

const MIDI_NAMES: Record<number, string> = {};
for (let midi = 48; midi <= 84; midi++) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  MIDI_NAMES[midi] = `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

class SettingsPanel extends HTMLElement {
  private config: Config | null = null;
  private saveCallback: ((config: Config) => void) | null = null;

  connectedCallback(): void {
    this.innerHTML = `
      <form class="settings-panel__form">
        <label class="settings-panel__field">
          <span>Lowest note</span>
          <select name="floorMidi" class="settings-panel__select"></select>
        </label>
        <label class="settings-panel__field">
          <span>Highest note</span>
          <select name="ceilingMidi" class="settings-panel__select"></select>
        </label>
        <label class="settings-panel__field">
          <span>Include accidentals</span>
          <input name="includeAccidentals" type="checkbox" class="settings-panel__checkbox">
        </label>
        <label class="settings-panel__field">
          <span>Session mode</span>
          <select name="sessionMode" class="settings-panel__select">
            <option value="cards">Cards per session</option>
            <option value="minutes">Minutes per session</option>
          </select>
        </label>
        <label class="settings-panel__field settings-panel__field--cards">
          <span>Cards per session</span>
          <input name="cardsPerSession" type="number" min="1" max="50" class="settings-panel__number">
        </label>
        <label class="settings-panel__field settings-panel__field--minutes">
          <span>Minutes per session</span>
          <select name="sessionDurationMinutes" class="settings-panel__select">
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </label>
        <label class="settings-panel__field">
          <span>Practice mode</span>
          <select name="practiceMode" class="settings-panel__select">
            <option value="quiz">Quiz</option>
            <option value="long-tone">Long tone</option>
          </select>
        </label>
        <label class="settings-panel__field settings-panel__field--long-tone">
          <span>Count-in beats</span>
          <select name="longToneBeats" class="settings-panel__select">
            <option value="2">2</option>
            <option value="4">4</option>
          </select>
        </label>
        <label class="settings-panel__field settings-panel__field--long-tone">
          <span>Count-in tempo (BPM)</span>
          <input name="longToneTempo" type="number" min="40" max="208" class="settings-panel__number">
        </label>
        <label class="settings-panel__field settings-panel__field--long-tone">
          <span>Tolerance (cents)</span>
          <input name="longToneCentsTolerance" type="number" min="5" max="200" class="settings-panel__number">
        </label>
        <label class="settings-panel__field settings-panel__field--long-tone">
          <span>Min hold time (ms)</span>
          <input name="longToneMinDurationMs" type="number" min="100" class="settings-panel__number">
        </label>
        <label class="settings-panel__field">
          <span>Show trumpet fingerings</span>
          <input name="showFingerings" type="checkbox" class="settings-panel__checkbox">
        </label>
        <button type="submit" class="settings-panel__button">Save</button>
      </form>
    `;
    this.populateMidiSelects();
    const form = this.querySelector('form')!;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.saveCallback) {
        this.saveCallback(this.readConfig());
      }
    });
    const sessionMode = form.elements.namedItem('sessionMode') as HTMLSelectElement;
    sessionMode.addEventListener('change', () => this.updateFieldVisibility());
  }

  // fallow-ignore-next-line unused-class-member
  setConfig(config: Config): void {
    this.config = config;
    const form = this.querySelector('form') as HTMLFormElement;
    (form.elements.namedItem('floorMidi') as HTMLSelectElement).value = String(config.floorMidi);
    (form.elements.namedItem('ceilingMidi') as HTMLSelectElement).value = String(config.ceilingMidi);
    (form.elements.namedItem('includeAccidentals') as HTMLInputElement).checked = config.includeAccidentals;
    (form.elements.namedItem('sessionMode') as HTMLSelectElement).value = config.sessionMode;
    (form.elements.namedItem('cardsPerSession') as HTMLInputElement).value = String(config.cardsPerSession);
    (form.elements.namedItem('sessionDurationMinutes') as HTMLSelectElement).value = String(config.sessionDurationMinutes);
    (form.elements.namedItem('showFingerings') as HTMLInputElement).checked = config.showFingerings;
    (form.elements.namedItem('practiceMode') as HTMLSelectElement).value = config.practiceMode;
    (form.elements.namedItem('longToneBeats') as HTMLSelectElement).value = String(config.longToneBeats);
    (form.elements.namedItem('longToneTempo') as HTMLInputElement).value = String(config.longToneTempo);
    (form.elements.namedItem('longToneCentsTolerance') as HTMLInputElement).value = String(config.longToneCentsTolerance);
    (form.elements.namedItem('longToneMinDurationMs') as HTMLInputElement).value = String(config.longToneMinDurationMs);
    const practiceMode = form.elements.namedItem('practiceMode') as HTMLSelectElement;
    practiceMode.addEventListener('change', () => this.updateFieldVisibility());
    this.updateFieldVisibility();
  }

  // fallow-ignore-next-line unused-class-member
  onSave(callback: (config: Config) => void): void {
    this.saveCallback = callback;
  }

  private populateMidiSelects(): void {
    this.querySelectorAll('select[name$="Midi"]').forEach((select) => {
      for (let midi = 48; midi <= 84; midi++) {
        const option = document.createElement('option');
        option.value = String(midi);
        option.textContent = MIDI_NAMES[midi];
        select.appendChild(option);
      }
    });
  }

  private updateFieldVisibility(): void {
    const form = this.querySelector('form') as HTMLFormElement;
    const mode = (form.elements.namedItem('sessionMode') as HTMLSelectElement).value;
    const cardsField = this.querySelector('.settings-panel__field--cards') as HTMLElement;
    const minutesField = this.querySelector('.settings-panel__field--minutes') as HTMLElement;
    cardsField.style.display = mode === 'cards' ? '' : 'none';
    minutesField.style.display = mode === 'minutes' ? '' : 'none';

    const practiceMode = (form.elements.namedItem('practiceMode') as HTMLSelectElement).value;
    this.querySelectorAll('.settings-panel__field--long-tone').forEach((el) => {
      (el as HTMLElement).style.display = practiceMode === 'long-tone' ? '' : 'none';
    });
  }

  private readConfig(): Config {
    const form = this.querySelector('form') as HTMLFormElement;
    let floorMidi = Number((form.elements.namedItem('floorMidi') as HTMLSelectElement).value);
    let ceilingMidi = Number((form.elements.namedItem('ceilingMidi') as HTMLSelectElement).value);
    let cardsPerSession = Number((form.elements.namedItem('cardsPerSession') as HTMLInputElement).value);
    const sessionMode = (form.elements.namedItem('sessionMode') as HTMLSelectElement).value as 'cards' | 'minutes';
    let sessionDurationMinutes = Number((form.elements.namedItem('sessionDurationMinutes') as HTMLSelectElement).value);

    if (floorMidi > ceilingMidi) {
      [floorMidi, ceilingMidi] = [ceilingMidi, floorMidi];
    }
    cardsPerSession = Math.max(1, Number.isFinite(cardsPerSession) ? cardsPerSession : 1);
    sessionDurationMinutes = Math.max(1, Number.isFinite(sessionDurationMinutes) ? sessionDurationMinutes : 1);

    return {
      floorMidi,
      ceilingMidi,
      includeAccidentals: (form.elements.namedItem('includeAccidentals') as HTMLInputElement).checked,
      sessionMode,
      cardsPerSession,
      sessionDurationMinutes,
      showFingerings: (form.elements.namedItem('showFingerings') as HTMLInputElement).checked,
      practiceMode: (form.elements.namedItem('practiceMode') as HTMLSelectElement).value as 'quiz' | 'long-tone',
      longToneBeats: Number((form.elements.namedItem('longToneBeats') as HTMLSelectElement).value) as 2 | 4,
      longToneTempo: Math.max(40, Math.min(208, Number((form.elements.namedItem('longToneTempo') as HTMLInputElement).value))),
      longToneCentsTolerance: Math.max(5, Math.min(200, Number((form.elements.namedItem('longToneCentsTolerance') as HTMLInputElement).value))),
      longToneMinDurationMs: Math.max(100, Number((form.elements.namedItem('longToneMinDurationMs') as HTMLInputElement).value)),
    };
  }
}

customElements.define('settings-panel', SettingsPanel);

export default SettingsPanel;
