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

  setConfig(config: Config): void {
    this.config = config;
    const form = this.querySelector('form') as HTMLFormElement;
    (form.elements.namedItem('floorMidi') as HTMLSelectElement).value = String(config.floorMidi);
    (form.elements.namedItem('ceilingMidi') as HTMLSelectElement).value = String(config.ceilingMidi);
    (form.elements.namedItem('includeAccidentals') as HTMLInputElement).checked = config.includeAccidentals;
    (form.elements.namedItem('sessionMode') as HTMLSelectElement).value = config.sessionMode;
    (form.elements.namedItem('cardsPerSession') as HTMLInputElement).value = String(config.cardsPerSession);
    (form.elements.namedItem('sessionDurationMinutes') as HTMLSelectElement).value = String(config.sessionDurationMinutes);
    this.updateFieldVisibility();
  }

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
    };
  }
}

customElements.define('settings-panel', SettingsPanel);

export default SettingsPanel;
