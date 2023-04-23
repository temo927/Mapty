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
let map, mapE;
navigator.geolocation.getCurrentPosition(
  position => {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on(`click`, function (mapEvent) {
      mapE = mapEvent;
      form.classList.remove(`hidden`);
      inputDistance.focus();
    });
  },
  () => alert(`Could not get yours position`)
);
form.addEventListener(`submit`, function (e) {
  e.preventDefault();
  const { lat, lng } = mapE.latlng;
  L.marker([lat, lng])
    .addTo(map)
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
});
inputType.addEventListener(`change`, function (e) {
  inputElevation.closest(`.form__row `).classList.toggle(`form__row--hidden`);
  inputCadence.closest(`.form__row `).classList.toggle(`form__row--hidden`);
});
