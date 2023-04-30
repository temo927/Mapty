'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapE;
  constructor() {
    this._getPossition();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggle);
  }

  _getPossition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
      alert(`Could not get yours position`)
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));
  }

  _showForm(mapEvent) {
    this.#mapE = mapEvent;
    form.classList.remove(`hidden`);
    inputDistance.focus();
  }

  _toggle() {
    inputElevation.closest(`.form__row `).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row `).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapE.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
          content: `Workout`,
        })
      )
      .openPopup();
    // .setPopupContent(`workout`);
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ` `;
  }
}

const app = new App();
