'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(cords, distance, duration) {
    this.cords = cords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)}
    on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = `running`;
  constructor(cords, distance, duration, cadence) {
    super(cords, distance, duration);
    {
      this.cadence = cadence;
      this.calcPace();
      this._setDescription();
    }
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = `cycling`;
  constructor(cords, distance, duration, elevation) {
    super(cords, distance, duration);
    {
      this.elevationGain = elevation;
      this.calcSpeed();
      this._setDescription();
    }
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
///////////////////////////application architecture
class App {
  #map;
  #mapE;
  #workouts = [];
  constructor() {
    //local storage
    this._getLocalStorage();
    //getting position
    this._getPossition();
    //event listeners
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
    this.#workouts.forEach(work => this._renderWorkoutMarker(work));
  }

  _showForm(mapEvent) {
    this.#mapE = mapEvent;
    form.classList.remove(`hidden`);
    inputDistance.focus();
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ` `;

    form.style.display = `none`;
    form.classList.add(`hidden`);
    setTimeout(() => (form.style.display = `grid`), 1000);
  }

  _toggle() {
    inputElevation.closest(`.form__row `).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row `).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    let workout;
    e.preventDefault();
    const valid = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const positive = (...inputs) => inputs.every(inp => inp > 0);

    //get data from form
    const type = inputType.value;
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const { lat, lng } = this.#mapE.latlng;

    // check if it is running workout and create object
    if (type === `running`) {
      const cadence = inputCadence.value;
      //check if data is valid
      if (
        !valid(distance, duration, cadence) &&
        !positive(distance, duration, cadence)
      )
        return alert(`no`);
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //check if it is cycling workout and create object
    if (type === `cycling`) {
      const elevation = inputElevation.value;
      //check if data is valid
      if (
        !valid(distance, duration, elevation) &&
        !positive(distance, duration)
      )
        return alert(`no`);
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add new object to the workout array
    this.#workouts.push(workout);
    // render wrokout on map as marker
    this._renderWorkoutMarker(workout);
    // render workout on list
    this._renderWorkout(workout);
    //hide form
    this._hideForm();

    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.cords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === `running` ? `🏃‍♂️` : `🚴`} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    const html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === `running` ? `🏃‍♂️` : `🚴`
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type === `running`
                ? workout.pace.toFixed(1)
                : workout.speed.toFixed(1)
            }</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === `running` ? `🦶🏼` : `⛰`
            }</span>
            <span class="workout__value">${
              workout.type === `running`
                ? workout.cadence
                : workout.elevationGain
            }</span>
            <span class="workout__unit">${
              workout.type === `running` ? `spm` : `m`
            }</span>
          </div>
        </li>`;
    form.insertAdjacentHTML(`afterend`, html);
  }
  _setLocalStorage() {
    localStorage.setItem(`workouts`, JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem(`workouts`));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => this._renderWorkout(work));
  }
  reset() {
    localStorage.removeItem(`workouts`);
    location.reload();
  }
}

const app = new App();
