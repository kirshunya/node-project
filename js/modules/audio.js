let menuSoundsAllowed = localStorage.getItem(`sounds-menu`);
let gameSoundsAllowed = localStorage.getItem(`sounds-game`);

let language = localStorage.getItem(`language`) || `ru`;

const path = `./sounds`;

const loadCaskSounds = () => {
  casksSounds = [];
  for (let i = 1; i <= 90; i++) {
    if (language == `AZ` || language == `TR`) {
      language = `AZ-TR`;
    }

    // let audio = new Audio(
    //   `${path}/${language}/${i}${language.split(`-`)[0].toLowerCase()}.mp3`
    // );
    // casksSounds.push(audio);
  }
};

export const setLanguage = (lang) => {
  language = lang;
  loadCaskSounds();
};

let menuVolume = 0.5;
let gameVolume = 0.5;
if (menuSoundsAllowed == `false`) {
  menuVolume = 0;
}
if (gameSoundsAllowed == `false`) {
  gameVolume = 0;
}

export const setGameSoundsAllowed = (allowed) => {
  gameSoundsAllowed = `${allowed}`;
  gameVolume = allowed ? 0.5 : 0;
};

export const setMenuSoundsAllowed = (allowed) => {
  menuSoundsAllowed = `${allowed}`;
  menuVolume = allowed ? 0.5 : 0;
};

// casks
let casksSounds = [];

loadCaskSounds();

export const playNumber = (number) => {
  casksSounds[number - 1].volume = gameVolume;
  casksSounds[number - 1].play();
};

// general
const generalSounds = {};

const loading = new Audio(`${path}/loading.mp3`);
generalSounds.loading = loading;

export const playLoading = () => {
  generalSounds.loading.volume = menuVolume;
  generalSounds.loading.play();
};

export const playRefreshTicket = () => {
  const refresh = new Audio(`${path}/refresh-ticket.mp3`);
  refresh.volume = menuVolume;
  refresh.play();
};

export const playDeleteTicket = () => {
  const deleteTicket = new Audio(`${path}/delete-ticket.mp3`);
  deleteTicket.volume = menuVolume;
  deleteTicket.play();
};

export const playTicket = () => {
  // чтоб можно было нажимать на кнопку несколько раз
  const ticket = new Audio(`${path}/ticket.mp3`);
  ticket.volume = menuVolume;
  ticket.play();
};

export const playSuccess = () => {
  const success = new Audio(`${path}/success.mp3`);
  success.volume = menuVolume;
  success.play();
};

export const playBuyTicket = () => {
  const buyTicket = new Audio(`${path}/buy-ticket.mp3`);
  buyTicket.volume = menuVolume;
  buyTicket.play();
};

export const playProfileDeposit = () => {
  const profileDeposit = new Audio(`${path}/profile-deposit.mp3`);
  profileDeposit.volume = menuVolume;
  profileDeposit.play();
};

export const playGameClick = () => {
  const gameClick = new Audio(`${path}/game-click.mp3`);
  gameClick.volume = menuVolume;
  gameClick.play();
};

export const playRating = () => {
  const rating = new Audio(`${path}/rating.mp3`);
  rating.volume = menuVolume;
  rating.play();
};

export const playTelephonePoints = () => {
  const points = new Audio(`${path}/domino/points-telephone.mp3`);
  points.volume = gameVolume;
  points.play();
}

export const playGameStarted = () => {
  const gameStarted = new Audio(`${path}/domino/game-started.mp3`);
  gameStarted.volume = gameVolume;
  gameStarted.play();
}

export const playPlaceTile = () => {
  const placeTile = new Audio(`${path}/domino/place-tile.mp3`);
  placeTile.volume = gameVolume;
  placeTile.play();
}