// export const API_URL = "https://app.24loto.com/api";
// export const API_URL = "https://lotogame.onrender.com/api";
// export const API_URL = "https://loto-server-new.onrender.com/api";
import { API_URL_PART } from "./config.js";
export const API_URL = `http${API_URL_PART}/api`;

const $api = axios.create({
  withCredentials: false,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status == 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true;
    }
    throw error;
  }
);

export async function registration(registrationData) {
  try {
    let response = await $api.post("/registration", registrationData);
    if (response.status == 200 || response.statusText == "OK") {
      localStorage.setItem("token", response.data.accessToken);
    }
    return await response;
  } catch (error) {
    console.log(error.response?.data?.message);
    return await error.response;
  }
}

export async function login(loginData) {
  try {
    let response = await $api.post("/login", loginData);
    if (response.status == 200 || response.statusText == "OK") {
      localStorage.setItem("token", response.data.accessToken);
    }
    return await response;
  } catch (error) {
    console.log(error.response?.data?.message);
    return await error.response;
  }
}

export async function updateAuth() {
  try {
    const response = await axios.get(`${API_URL}/refresh`, {
      withCredentials: false,
    });

    localStorage.setItem("token", response.data.accessToken);
    return await response;
  } catch (error) {
    console.log(e.response?.data?.message);
    return await error.response;
  } finally {
  }
}

export async function checkAuth() {
  try {
    let response = await $api.get("/checkAuth");
    return await response;
  } catch (error) {
    return await error.response;
  }
}

export async function logout() {
  try {
    localStorage.removeItem("token");
    const response = await $api.post("/logout");
    return await response;
  } catch (error) {
    console.log(error.response?.data?.message);
    return error.response;
  }
}

export async function changePassword(data) {
  try {
    const response = await $api.put("/change-password", data);
    return await response;
  } catch (error) {
    console.log(error.response?.data?.message);
    return error.response;
  }
}

export async function getUser() {
  try {
    const response = await $api.get(`/get-user`);
    return await response;
  } catch (error) {
    console.log(error.response);
    return await error.response;
  }
}

export async function disconnectRoom(roomId) {
  try {
    const response = await $api.delete(`/game/disconnect-loto-room/${roomId}`);
    return await response;
  } catch (error) {
    console.log(e.response);
    return await error.response;
  }
}

export async function finishWaiting(roomId) {
  try {
    const response = await $api.put(`/game/finish-loto-waiting/${roomId}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function connectRoom(roomId) {
  try {
    const response = await $api.post(`/game/connect-loto-room/${roomId}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getTicket() {
  try {
    const response = await $api.post(`/game/create-card`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function deleteTicket(cardId) {
  try {
    const response = await $api.delete(`/game/delete-card/${cardId}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function deleteTickets(roomId) {
  try {
    const response = await $api.delete(`/game/delete-cards?roomId=${roomId}`);
    return await response;
  } catch (error) {
    console.log(e.response);
    return await error.response;
  }
}

export async function deleteTicketsReturnBalance(roomId, bet) {
  try {
    const response = await $api.delete(
      `/game/delete-cards-balance?roomId=${roomId}&bet=${bet}`
    );
    return await response;
  } catch (error) {
    console.log(e.response);
    return await error.response;
  }
}

export async function buyTickets(cards) {
  try {
    const response = await $api.post(`/game/create-card`, {
      cards,
    });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getTickets() {
  try {
    const response = await $api.get(`/game/get-card`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function isGameStarted(roomId) {
  try {
    const response = await $api.get(`/game/is-game-started/${roomId}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function isPlayerInRoom(roomId) {
  try {
    const response = await $api.get(`/game/is-user-in-game/${roomId}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function clearAllConnectons() {
  try {
    const response = await $api.delete(`/game/clear-all`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

//admin

export async function getLotoSettings() {
  try {
    const response = await $api.get(`/loto-settings`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getBotWins() {
  try {
    const response = await $api.get(`/bot-wins`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getUserGames() {
  try {
    const response = await $api.get(`/get-games`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function setLotoSettings(roomId, body) {
  try {
    const response = await $api.put(`/loto-settings/${roomId}`, body);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

// leaders page

export async function getGameLeaders(gameType) {
  try {
    const response = await $api.get(`/leaders/${gameType}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getBotStats(gameType) {
  try {
    const response = await $api.get(`/botsStat/${gameType}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getAllUsersAdminStats() {
  try {
    const response = await $api.get(`/allUsersStats`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getAdminBotWins() {
  // можна передавать игру чтоб получать игру для статистики
  try {
    const response = await $api.get(`/bot-wins`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function exchangeTokens(tokens) {
  try {
    const response = await $api.put(`/exchange-tokens`, { tokens });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getAllUsersStats() {
  try {
    const response = await $api.get(`/allUsersStats`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getUserStats() {
  try {
    const response = await $api.get(`/userStats`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getCurrencyRate() {
  try {
    const response = await $api.get(`/getCurrencyRate`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function deposit(sum) {
  try {
    const response = await $api.post(`/deposit`, { sum });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getPayouts() {
  try {
    const response = await $api.get(`/getPayouts`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function checkPayouts(ids) {
  try {
    const response = await $api.put(`/checkPayouts`, { ids });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function createPayout(
  withdrawAmount,
  cardNumber,
  cardHolder,
  validity
) {
  try {
    const response = await $api.post(`/createPayout`, {
      withdrawAmount,
      cardNumber,
      cardHolder,
      validity,
    });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function updateUserData(name, email) {
  try {
    const response = await $api.put(`/updateUserData`, {
      name,
      email,
    });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getPlayedGames() {
  try {
    const response = await $api.get(`/played-games`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getPlayedDominoGames() {
  try {
    const response = await $api.get(`/played-domino-games`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getDominoStatus() {
  try {
    const response = await $api.get("/game/domino-status");
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function isDominoStarted(roomId, tableId, playerMode, gameMode) {
  try {
    const response = await $api.post("/game/domino-isstarted", {
      roomId,
      tableId,
      playerMode,
      gameMode,
    });
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getIsPageAvailable(page) {
  try {
    const response = await $api.get(`/is-page-available/${page}`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function getRoomsControl() {
  try {
    const response = await $api.get(`/rooms-control`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function updateRoomsControl(roomsControl, mode) {
  try {
    const response = await $api.put(`/rooms-control/${mode}`, roomsControl);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function setUserAvatar(formData) {
  try {
    const response = await $api.postForm(`/uploadAvatar`, formData);

    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function removeUserAvatar() {
  try {
    const response = await $api.delete(`/uploadAvatar`);
    return await response;
  } catch (e) {
    console.log(e.response);
    return await e.response;
  }
}

export async function changeUserPasswordEmailRequest(email) {
  try {
    const response = await $api.post(`${API_URL}/drop-password-request`, {
      email,
    });
    return response;
  } catch (e) {
    console.log(e.response?.data?.message);
    return await e.response;
  }
}

export async function dropUserPassword(resetToken, password) {
  try {
    const response = await $api.post(`${API_URL}/drop-password`, {
      resetToken,
      password,
    });
    return response;
  } catch (e) {
    console.log(e.response?.data?.message);
    return await e.response;
  } finally {
  }
}
