import * as lotoNav from "../loto/loto-navigation.js";
import * as impPopup from "../pages/popup.js";
import * as impAudio from "../audio.js";
import * as time from "../time.js";
// import * as time from "../time.js";
import { API_URL_PART, IS_HOSTED_STATIC } from "../config.js";
let activeTurnTimers = [];

let scaleTimeout = [];

function generateNewQueue(turnQueue, userId) {
  const userIndex = turnQueue.indexOf(userId);
  const afterUserId = turnQueue.slice(userIndex + 1);
  const beforeUserId = turnQueue.slice(0, userIndex);
  const result = afterUserId.concat(beforeUserId);

  return result;
}

function sortByTurnQueue(players, turnQueue) {
  const sortedPlayers = [...players];

  const compareByUserId = (a, b) => {
    const userIdA = a.userId;
    const userIdB = b.userId;

    const indexA = turnQueue.indexOf(userIdA);
    const indexB = turnQueue.indexOf(userIdB);

    return indexA - indexB;
  };

  sortedPlayers.sort(compareByUserId);

  return sortedPlayers;
}

export const setDominoTableInfo = (msg) => {
  const playersArr = msg.players;
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = +user.userId;

  const playerData = playersArr.find((player) => player.userId == userId);
  const playerTilesArr = playerData.tiles;

  const tableBlock = document.querySelector(".domino-game-page-table-block");
  const marketBlock = document.querySelector(".domino-table-store__score");
  marketBlock.innerHTML = msg.market.length;
  let emenyPlayerNum = 1;

  const existingEnemyPlayers = tableBlock.querySelectorAll(
    ".domino-game-table__enemy-player"
  );

  if (existingEnemyPlayers) {
    existingEnemyPlayers.forEach((enemy) => {
      enemy.remove();
    });
  }

  const turnQueue = msg.turnQueue;

  const resultQueue = generateNewQueue(turnQueue, userId);
  // // console.log("resultQueue:", resultQueue); // [1, 4, 5]

  const enemyPlayers = msg.players.filter((player) => player.userId != userId);

  const sortedPlayers = sortByTurnQueue(enemyPlayers, resultQueue);

  // swap first 2 elements in sortedPlayers
  if (sortedPlayers.length > 1) {
    const temp = sortedPlayers[0];
    sortedPlayers[0] = sortedPlayers[1];
    sortedPlayers[1] = temp;
  }

  sortedPlayers.forEach((player, i) => {
    if (!(player.userId == userId)) {
      tableBlock.innerHTML += `
      <div
        class="domino-game-table__enemy-player domino-enemy-player domino-enemy-player-${emenyPlayerNum}"
        userId="${+player.userId}"
        username="${player.username}"
      >
        <div class="domino-enemy-player__img">
          <img src="${
            player.avatar
              ? `http${API_URL_PART}${
                  IS_HOSTED_STATIC ? "/static/avatars/" : "/"
                }${player.avatar}`
              : "img/profile.png"
          }" alt="" /><span>${player.tiles.length}</span>
        </div>
        <div class="domino-enemy-player__info">
          <h2 class="domino-enemy-player__name">${player.username}</h2>
          <span class="domino-enemy-player__score" style="font-weight: 500; font-size: 20px;">${
            player.score
          }</span><span class="domino-enemy-player__score" style="font-weight: 300; font-size: 15px; color: white;">/165</span>
        </div>
      </div>
      `;

      emenyPlayerNum++;
    }
  });

  const gameMode =
    location.hash.split("/")[location.hash.split("/").length - 1];

  let seeTiles = false;
  if (
    (user.seeDominoClassic == true && gameMode == "CLASSIC") ||
    (user.seeDominoTelephone == true && gameMode == "TELEPHONE")
  ) {
    seeTiles = true;
  }

  if (seeTiles) {
    const enemyPlayers = tableBlock.querySelectorAll(".domino-enemy-player");

    enemyPlayers.forEach((enemy) => {
      enemy.addEventListener("click", (e) => {
        const enemyPlayer = e.currentTarget;
        const enemyPlayerId = +enemyPlayer.getAttribute("userId");
        const enemyPlayerName = enemyPlayer.getAttribute("username");
        const playersTiles = JSON.parse(window.playersTiles);
        // const playersTiles = JSON.parse(localStorage.getItem("playersTiles"));
        const enemyPlayerTiles = playersTiles.find(
          (player) => player.userId == enemyPlayerId
        ).tiles;
        const enemyPlayerTilesArr = enemyPlayerTiles.map((tile) => {
          return { left: tile.left, right: tile.right };
        });

        impPopup.showEnemyTiles(
          enemyPlayerName,
          enemyPlayerTilesArr,
          enemyPlayerId
        );
      });
    });
  }

  const enemyScores = tableBlock.querySelectorAll(
    ".domino-enemy-player__score"
  );

  const userScore = document.querySelector(".domino-game-user__score");

  if (gameMode == "CLASSIC") {
    enemyScores.forEach((enemyScore) => {
      enemyScore.remove();
    });
    if (userScore) {
      userScore.remove();
    }
  }

  drawUserInfo(playerData, user);
  drawPlayerTiles(playerTilesArr);
};

export const updateGameScene = (scene, player) => {
  impAudio.playPlaceTile();
  localStorage.setItem("dominoGameScene", JSON.stringify(scene));

  let gameMode = location.hash.split("/")[location.hash.split("/").length - 1];
  if (gameMode.toUpperCase() == "CLASSIC") {
    let newScene = scene[Math.floor(scene.length / 2)];
    drawClassicGameScene(scene, newScene);
  } else {
    // drawGameScene(scene, scene);
    drawTelephoneGameScene(scene);
  }
  edgeControl();
};

function getVertical(scene) {
  let verticalCoord = null;
  scene.forEach((row, i) => {
    row.forEach((tile, j) => {
      if (
        tile?.id >= 0 &&
        !verticalCoord &&
        i != Math.floor(scene.length / 2)
      ) {
        verticalCoord = j;
        return;
      }
    });
  });
  let vertical = [];
  if (verticalCoord) {
    scene.forEach((row) => {
      let tile = row[verticalCoord];
      vertical.push(tile);
    });
  }

  // split vertical to top and bottom

  let verticalTop = vertical.splice(0, Math.floor(scene.length / 2));
  let verticalBottom = vertical.splice(1);

  return { verticalTop, verticalBottom, verticalCoord };
}

const drawTelephoneGameScene = (scene, player = null) => {
  let middleRow = scene[Math.floor(scene.length / 2)];

  let { verticalTop, verticalBottom, verticalCoord } = getVertical(scene);

  if (
    middleRow[Math.floor(middleRow.length / 2) + 4].left ==
    middleRow[Math.floor(middleRow.length / 2) + 4].right
  ) {
    // move each element to the left in array
    // middleRow.unshift(null);
    // middleRow.pop();
    // move each element to the right in array
    // scene.forEach((row) => {
    //   row.push(null);
    //   row.shift();
    // });
  }

  const tilesAmount = countTiles(scene);

  let blockTiles = [];
  // средний ряд главный
  const block3tiles = middleRow.slice(
    Math.floor(middleRow.length / 2) - 4,
    Math.floor(middleRow.length / 2) + 4
  );

  // правая колонка вверх
  const block4tiles = middleRow.slice(
    Math.floor(middleRow.length / 2) + 4,
    Math.floor(middleRow.length / 2) + 8
  );

  // верхний ряд
  const block5tiles = middleRow.slice(Math.floor(middleRow.length / 2) + 8);

  // левая колонка вниз
  const block2tiles = middleRow.slice(
    Math.floor(middleRow.length / 2) - 8,
    Math.floor(middleRow.length / 2) - 4
  );

  // нижний ряд
  const block1tiles = middleRow.slice(0, Math.floor(middleRow.length / 2) - 8);

  let expand = null;

  // если в 3 блоке последний тайл двойной, перекинуть 1 из 4 блока
  if (
    block3tiles[block3tiles.length - 1].left ==
      block3tiles[block3tiles.length - 1].right &&
    block3tiles[block3tiles.length - 1].id >= 0
  ) {
    if (block3tiles[block3tiles.length - 1].central == true) {
      expand = { fromBlock: 4, toBlock: 3, left: false, right: false };
    }

    block3tiles.push(block4tiles[0]);
    block4tiles.shift();

    block4tiles.push(block5tiles[0]);
    block5tiles.shift();
  }

  // если в 3 блоке перв тайл двойной, перекинуть тайл из 2 блока и из 1 блока в 2
  if (block3tiles[0].left == block3tiles[0].right && block3tiles[0].id >= 0) {
    if (block3tiles[0].central == true) {
      expand = { fromBlock: 2, toBlock: 3, left: false, right: false };
    }

    block3tiles.unshift(block2tiles[block2tiles.length - 1]);
    block2tiles.pop();
    block2tiles.unshift(block1tiles[block1tiles.length - 1]);
    block1tiles.pop();
  }

  let isBlock3Vertical = false;
  // check if there is a vertical that is made from block 3
  // take 1 row before middle in the scene and one after and if there is a tile and it is in range of middleTile - 4 to middleTile + 4, then vertical is made from block3
  const prevRow = scene[Math.floor(scene.length / 2) - 1];
  const nextRow = scene[Math.floor(scene.length / 2) + 1];

  prevRow.forEach((tile) => {
    if (
      tile?.id >= 0 &&
      prevRow.indexOf(tile) >= Math.floor(prevRow.length / 2) - 4 &&
      prevRow.indexOf(tile) <= Math.floor(prevRow.length / 2) + 4
    ) {
      isBlock3Vertical = true;
    }
  });

  nextRow.forEach((tile) => {
    if (
      tile?.id >= 0 &&
      nextRow.indexOf(tile) >= Math.floor(nextRow.length / 2) - 4 &&
      nextRow.indexOf(tile) <= Math.floor(nextRow.length / 2) + 4
    ) {
      isBlock3Vertical = true;
    }
  });

  // если в 4 блоке последний тайл двойной, перекинуть 1 тайл из 5 в 4 блок
  if (
    block4tiles[block4tiles.length - 1].left ==
      block4tiles[block4tiles.length - 1].right &&
    block4tiles[block4tiles.length - 1].id >= 0 &&
    block4tiles.length > 1
  ) {
    if (block4tiles[block4tiles.length - 1].central == true) {
      expand = { fromBlock: 5, toBlock: 4, left: false, right: false };
    }

    block4tiles.push(block5tiles[0]);
    block5tiles.shift();
  }

  // если в 5 блоке перв тайл двойной, перекинуть 2 тайла из 5 в 4 блок

  if (
    block5tiles[0].left == block5tiles[0].right &&
    block5tiles[0].id >= 0 &&
    block5tiles.length > 1
  ) {
    if (block5tiles[0].central == true) {
      expand = { fromBlock: 5, toBlock: 4, left: false, right: false };
    }
    for (let i = 0; i < 2; i++) {
      block4tiles.push(block5tiles[0]);
      block5tiles.shift();
    }
  }

  // если в 2 блоке перв тайл двойной, перекинуть 1 тайл из 1 в 2 блок
  if (
    block2tiles[0].left == block2tiles[0].right &&
    block2tiles[0].right &&
    block2tiles[0].id >= 0
  ) {
    if (block2tiles[0].central == true) {
      expand = { fromBlock: 1, toBlock: 2, left: false, right: false };
    }
    block2tiles.unshift(block1tiles[block1tiles.length - 1]);
    block1tiles.pop();
  }

  // если в 1 блоке перв тайл двойной, перекинуть 2 тайла из 1 в 2 блок
  if (
    block1tiles[block1tiles.length - 1].left ==
      block1tiles[block1tiles.length - 1].right &&
    block1tiles[block1tiles.length - 1].right &&
    block1tiles[block1tiles.length - 1].id >= 0 &&
    block1tiles.length > 1
  ) {
    if (block1tiles[block1tiles.length - 1].central == true) {
      expand = { fromBlock: 1, toBlock: 2, left: false, right: false };
    }
    for (let i = 0; i < 2; i++) {
      block2tiles.unshift(block1tiles[block1tiles.length - 1]);
      block1tiles.pop();
    }
  }

  // если в 4 блоке перв тайл двойной, перекинуть 2 тайла из 4 блока в 3 и из 5 блока в 4
  if (block4tiles[0].left == block4tiles[0].right && block4tiles[0].id >= 0) {
    if (block4tiles[0].central == true) {
      expand = { fromBlock: 4, toBlock: 3, left: false, right: false };
    }

    for (let i = 0; i < 2; i++) {
      block3tiles.push(block4tiles[0]);
      block4tiles.shift();

      block4tiles.push(block5tiles[0]);
      block5tiles.shift();
    }
  }

  // если в 2 блоке последний тайл двойной, перекинуть тайл из 3 блока в 2
  if (
    block2tiles[block2tiles.length - 1].left ==
      block2tiles[block2tiles.length - 1].right &&
    block2tiles[block2tiles.length - 1].id >= 0 &&
    block2tiles.length > 1 &&
    !isBlock3Vertical
  ) {
    if (block2tiles[block2tiles.length - 1].central == true) {
      expand = { fromBlock: 3, toBlock: 2, left: true, right: false };
    }
    block2tiles.push(block3tiles[0]);
    block3tiles.shift();
  }

  // если в 1 блоке перв тайл двойной, перекинуть 2 тайла в 2 блок
  if (
    block1tiles[0].left == block1tiles[0].right &&
    block1tiles[0].id >= 0 &&
    block1tiles.length > 1
  ) {
    if (block1tiles[0].central == true) {
      expand = { fromBlock: 2, toBlock: 1, left: false, right: false };
    }
    for (let i = 0; i < 2; i++) {
      block2tiles.unshift(block1tiles[0]);
      block1tiles.shift();
    }
  }

  blockTiles.push({ id: 3, tiles: block3tiles });
  blockTiles.push({ id: 4, tiles: block4tiles });
  blockTiles.push({ id: 5, tiles: block5tiles });
  blockTiles.push({ id: 2, tiles: block2tiles });
  blockTiles.push({ id: 1, tiles: block1tiles });

  let insertingBlocks = document.querySelectorAll(
    ".domino-game-table__table-tiles-block"
  );

  const tableBlock = document.querySelector(".domino-game-table__table");

  if (insertingBlocks.length < 5) {
    tableBlock.innerHTML = `
      <div id="1" class="domino-game-table__table-tiles-block-1 domino-game-table__table-tiles-block"></div>
      <div id="2" class="domino-game-table__table-tiles-block-2 domino-game-table__table-tiles-block"></div>
      <div id="3" class="domino-game-table__table-tiles-block-3 domino-game-table__table-tiles-block"></div>
      <div id="4" class="domino-game-table__table-tiles-block-4 domino-game-table__table-tiles-block"></div>
      <div id="5" class="domino-game-table__table-tiles-block-5 domino-game-table__table-tiles-block"></div>
      <div id="6" class="domino-game-table__table-tiles-block-6 domino-game-table__table-tiles-block"></div>
      <div id="7" class="domino-game-table__table-tiles-block-7 domino-game-table__table-tiles-block"></div>
      <div id="8" class="domino-game-table__table-tiles-block-8 domino-game-table__table-tiles-block"></div>
      <div id="9" class="domino-game-table__table-tiles-block-9 domino-game-table__table-tiles-block"></div>
    `;
    insertingBlocks = document.querySelectorAll(
      ".domino-game-table__table-tiles-block"
    );
  }
  insertingBlocks.forEach((block) => {
    block.innerHTML = "";
  });

  blockTiles.forEach((block) => {
    const insertingBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (insertingBlock) {
      insertingBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          insertingBlock.innerHTML += `
          <div class="domino-game-table__tile ${tile.rotate ? "rotated" : ""} ${
            tile.central == true ? "central" : ""
          }" tileid="${+tile.id}">
            <div class="domino-game-table__tile-half domino-game-dots-${
              tile.left
            }">
              ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
            </div>
            <div class="domino-game-table__tile-half domino-game-dots-${
              tile.right
            }">
              ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
            </div>
          </div>
          `;
        }
      });
    }
  });

  tablePlacement();
  if (verticalCoord) {
    let central = document.querySelector(".central");
    if (central) {
      central.style.background = "#ffffff";
    }

    placeVerticalTiles(
      scene,
      verticalTop,
      verticalBottom,
      verticalCoord,
      expand
    );
  }
  edgeControl();
};

function getVerticalOriginBlock(scene, verticalIndex, expand = null) {
  let middleRow = scene[Math.floor(scene.length / 2)];
  let offsetRight = 0;
  let offsetLeft = 0;
  if (expand != null) {
    const { toBlock, left, right } = expand;
    return { block: toBlock, left: left, right: right };
  } else {
    if (
      verticalIndex >= Math.floor(middleRow.length / 2) - 4 + offsetLeft &&
      verticalIndex < Math.floor(middleRow.length / 2) + 4 + offsetRight
    ) {
      if (verticalIndex == Math.floor(middleRow.length / 2) - 4 + offsetLeft) {
        return { block: 3, left: true, right: false };
      }
      if (verticalIndex == Math.floor(middleRow.length / 2) + 3 + offsetRight) {
        return { block: 3, left: false, right: true };
      }

      return { block: 3, left: false, right: false };
    }

    if (
      verticalIndex >= Math.floor(middleRow.length / 2) + 4 + offsetLeft &&
      verticalIndex < Math.floor(middleRow.length / 2) + 8 + offsetRight
    ) {
      if (verticalIndex == Math.floor(middleRow.length / 2) + 4 + offsetLeft) {
        return { block: 4, left: true, right: false };
      }
      if (verticalIndex == Math.floor(middleRow.length / 2) + 7 + offsetRight) {
        return { block: 4, left: false, right: true };
      }
      return { block: 4, left: false, right: false };
    }

    if (verticalIndex >= Math.floor(middleRow.length / 2) + 8 + offsetRight) {
      if (verticalIndex == Math.floor(middleRow.length / 2) + 8 + offsetRight) {
        return { block: 5, left: false, right: true };
      }
      return { block: 5, left: false, right: false };
    }

    if (
      verticalIndex >= Math.floor(middleRow.length / 2) - 8 + offsetLeft &&
      verticalIndex < Math.floor(middleRow.length / 2) - 4 + offsetRight
    ) {
      if (verticalIndex == Math.floor(middleRow.length / 2) - 8 + offsetLeft) {
        return { block: 2, left: true, right: false };
      }
      if (verticalIndex == Math.floor(middleRow.length / 2) - 5 + offsetRight) {
        return { block: 2, left: false, right: true };
      }
      return { block: 2, left: false, right: false };
    }

    if (verticalIndex < Math.floor(middleRow.length / 2) - 8 + offsetLeft) {
      if (verticalIndex == Math.floor(middleRow.length / 2) - 9 + offsetLeft) {
        return { block: 1, left: true, right: false };
      }
      return { block: 1, left: false, right: false };
    }
    return { block: null, left: false, right: false };
  }
}

function placeVerticalTiles(
  scene,
  verticalTop,
  verticalBottom,
  verticalIndex,
  expand
) {
  // window.removeEventListener("resize", placeVerticalTilesBlocks);
  // window.addEventListener("resize", placeVerticalTilesBlocks);

  placeVerticalTilesBlocks();
  function placeVerticalTilesBlocks() {
    let middleRow = scene[Math.floor(scene.length / 2)];
    const { block, left, right } = getVerticalOriginBlock(
      scene,
      verticalIndex,
      expand
    );
    const originTile = middleRow[verticalIndex];

    const originTileBlock = document.querySelector(
      `.domino-game-table__tile[tileid="${originTile.id}"]`
    );

    const parentBlock = document.querySelector(
      `.domino-game-table__table-tiles-block-${block}`
    );

    let parentBlockLeft = +parentBlock.style.left.split("px")[0];

    const allTilesInBlock = parentBlock.querySelectorAll(
      ".domino-game-table__tile"
    );

    const leftTileBlocks = [];
    allTilesInBlock.forEach((tile) => {
      if (
        middleRow.indexOf(
          middleRow.find(
            (middleTile) => middleTile.id == +tile.getAttribute("tileid")
          )
        ) < verticalIndex
      ) {
        leftTileBlocks.push(tile);
      }
    });

    let leftPadding = 0;

    leftTileBlocks.forEach((item) => {
      leftPadding += item.offsetWidth;
    });

    const tableBlock = document.querySelector(".domino-game-table__table");

    sceneMoving(scene, verticalTop, verticalBottom, block, left, right);

    if (block == 3) {
      placeVericalTilesBlock3(
        verticalTop,
        verticalBottom,
        leftPadding,
        tableBlock,
        parentBlock,
        parentBlockLeft,
        originTileBlock,
        block,
        right,
        left
      );
    }

    if (block == 4) {
      placeVericalTilesBlock4(
        verticalTop,
        verticalBottom,
        leftPadding,
        tableBlock,
        parentBlock,
        parentBlockLeft,
        originTileBlock,
        block,
        right,
        left
      );
    }

    if (block == 2) {
      placeVericalTilesBlock2(
        verticalTop,
        verticalBottom,
        leftPadding,
        tableBlock,
        parentBlock,
        parentBlockLeft,
        originTileBlock,
        block,
        right,
        left
      );
    }

    if (block == 5) {
      placeVericalTilesBlock5(
        verticalTop,
        verticalBottom,
        leftPadding,
        tableBlock,
        parentBlock,
        parentBlockLeft,
        originTileBlock,
        block,
        right,
        left
      );
    }

    if (block == 1) {
      placeVericalTilesBlock1(
        verticalTop,
        verticalBottom,
        leftPadding,
        tableBlock,
        parentBlock,
        parentBlockLeft,
        originTileBlock,
        block,
        right,
        left
      );
    }
  }
}
function countTilesInDefaultArr(arr) {
  let count = 0;
  arr.forEach((item) => {
    if (item?.id >= 0) {
      count++;
    }
  });
  return count;
}
window.removeEventListener("resize", edgeControl);
window.addEventListener("resize", edgeControl);

function edgeControl() {
  const outerTableBlock = document.querySelector(".domino-game-table");
  const tableBlock = document.querySelector(".domino-game-table__table");
  if (!outerTableBlock || !tableBlock) {
    return;
  }

  // scaleTimeout.forEach((timeout) => {
  //   if (timeout) {
  //     clearTimeout(timeout);
  //   }
  // });
  // let timeout = setTimeout(() => {
  //   tableBlock.style.transform = `scale(0.8)`;
  // }, 00);
  // scaleTimeout.push(timeout);
  // tableBlock.style.transform = `scale(0.8)`;

  // tableBlock.style.top = `0`;
  // tableBlock.style.left = `0`;
  // tableBlock.style.translate = `0`;
  const tableLeft = outerTableBlock.getBoundingClientRect().left;
  const tableRight =
    window.innerWidth - (tableLeft + outerTableBlock.offsetWidth);
  const tableTop = outerTableBlock.getBoundingClientRect().top;
  const tableBottom =
    window.innerHeight - (tableTop + outerTableBlock.offsetHeight);
  const tile = document.querySelector(".domino-game-table__tile");
  let tileWidth;
  if (tile) {
    tileWidth =
      tile.offsetWidth > tile.offsetHeight
        ? tile.offsetWidth
        : tile.offsetHeight;
  } else {
    tileWidth = 85;
  }

  const computedStyle = window.getComputedStyle(tableBlock);
  const transform = computedStyle.transform || computedStyle.webkitTransform;
  // Get scale by extracting the scaling factor from the transform matrix
  const matrix = new DOMMatrix(transform);
  const scale = matrix.a;
  // Calculate the scaled width of tile
  tileWidth = tileWidth * scale;

  horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth);
  verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth);
}

function verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth) {
  let allBlocks = [];
  for (let i = 1; i <= 9; i++) {
    allBlocks.push(
      document.querySelector(`.domino-game-table__table-tiles-block[id="${i}"]`)
    );
  }

  if (allBlocks.length == 0) {
    return;
  }

  // get the block that is closest to the top edge and that is closest to bottom edge
  let closestTopBlock = allBlocks[0];
  let closestBottomBlock = allBlocks[0];
  allBlocks.forEach((block) => {
    // check if block has tiles
    if (block && block.innerHTML) {
      if (
        block.getBoundingClientRect().top <
        closestTopBlock.getBoundingClientRect().top
      ) {
        closestTopBlock = block;
      }
      if (
        window.innerHeight - block.getBoundingClientRect().top <
        window.innerHeight - closestBottomBlock.getBoundingClientRect().top
      ) {
        closestBottomBlock = block;
      }
    }
  });

  const blockBottom =
    window.innerHeight - closestBottomBlock.getBoundingClientRect().bottom;

  const padding = window.innerWidth > 375 ? 45 : 40;

  const topDifference =
    closestTopBlock.getBoundingClientRect().top - tableTop - padding;
  const bottomDifference = blockBottom - tableBottom - padding;

  const computedStyle = window.getComputedStyle(tableBlock);
  const transform = computedStyle.transform;
  const matrix = new DOMMatrix(transform);
  const scale = matrix.a;

  console.log("t " + topDifference);
  console.log("b " + bottomDifference);

  if (topDifference < 0 && bottomDifference > tileWidth) {
    tableBlock.style.top = `${
      (+tableBlock.style.top.split("px")[0] || 0) + tileWidth
    }px`;
    verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth);
  } else if (topDifference < 0) {
    tableBlock.style.transform = `scale(${scale - scale * 0.01})`;
    verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth);
  }
  if (bottomDifference < 0 && topDifference > tileWidth) {
    tableBlock.style.top = `${
      (+tableBlock.style.top.split("px")[0] || 0) - tileWidth
    }px`;
    verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth);
  } else if (bottomDifference < 0) {
    tableBlock.style.transform = `scale(${scale - scale * 0.01})`;
    verticalEdgeControl(tableBlock, tableTop, tableBottom, tileWidth);
  }
}

function horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth) {
  let allBlocks = [];
  for (let i = 1; i <= 9; i++) {
    allBlocks.push(
      document.querySelector(`.domino-game-table__table-tiles-block[id="${i}"]`)
    );
  }

  // get the block that is closest to the left edge and that is closest to right edge
  let closestLeftBlock = allBlocks[0];
  let closestRightBlock = allBlocks[0];
  allBlocks.forEach((block) => {
    // check if block has tiles
    if (block && block.innerHTML) {
      if (
        block.getBoundingClientRect().left <
        closestLeftBlock.getBoundingClientRect().left
      ) {
        closestLeftBlock = block;
      }

      if (
        window.innerWidth - block.getBoundingClientRect().right <
        window.innerWidth - closestRightBlock.getBoundingClientRect().right
      ) {
        closestRightBlock = block;
      }
    }
  });

  if (!closestRightBlock && !closestLeftBlock) {
    return;
  }

  const blockRight =
    window.innerWidth - closestRightBlock.getBoundingClientRect().right;

  const padding = window.innerWidth > 375 ? 20 : 17;

  const leftDifference =
    closestLeftBlock.getBoundingClientRect().left - tableLeft - padding;

  const rightDifference = blockRight - tableRight - padding;

  console.log("r " + rightDifference);
  console.log("l " + leftDifference);

  const tableBlockLeft = +tableBlock.style.translate.split("px")[0];

  if (leftDifference < 0 && rightDifference > tileWidth / 2) {
    tableBlock.style.translate = `${tableBlockLeft + tileWidth / 2}px`;

    horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth);
  } else if (leftDifference < 0) {
    const computedStyle = window.getComputedStyle(tableBlock);
    const transform = computedStyle.transform;
    const matrix = new DOMMatrix(transform);
    const scale = matrix.a;

    tableBlock.style.transform = `scale(${scale - scale * 0.05})`;

    horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth);
  } else if (rightDifference < 0 && leftDifference > tileWidth) {
    tableBlock.style.translate = `${tableBlockLeft - tileWidth / 2}px`;

    horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth);
  } else if (rightDifference < 0) {
    const computedStyle = window.getComputedStyle(tableBlock);
    const transform = computedStyle.transform;
    const matrix = new DOMMatrix(transform);
    const scale = matrix.a;

    tableBlock.style.transform = `scale(${scale - scale * 0.05})`;

    horizontalEdgeControl(tableBlock, tableLeft, tableRight, tileWidth);
  }
}

function sceneMoving(scene, verticalTop, verticalBottom, block, left, right) {
  const tableBlock = document.querySelector(".domino-game-table__table");
  let verticalTopAmount = countTilesInDefaultArr(verticalTop);
  let verticalBottomAmount = countTilesInDefaultArr(verticalBottom);

  const middleTile =
    scene[Math.floor(scene.length / 2)][Math.floor(scene[0].length / 2)];
  const middleTileBlock = document.querySelector(
    `.domino-game-table__tile[tileid="${middleTile.id}"]`
  );
  const tileWidth =
    middleTileBlock.offsetWidth > middleTileBlock.offsetHeight
      ? middleTileBlock.offsetWidth
      : middleTileBlock.offsetHeight;

  switch (block) {
    case 3:
      let desktopLimit = 5;
      let tabletLimit = 5; // 768
      let mobileLimit = 5;
      let currWindowWidth = window.innerWidth;

      if (currWindowWidth >= 900) {
        if (
          verticalTopAmount > desktopLimit ||
          verticalBottomAmount > desktopLimit
        ) {
          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.05 * (verticalTopAmount - desktopLimit);
          let scaleNumberBottom =
            1 - 0.05 * (verticalBottomAmount - desktopLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
        // desktopLimit;
      } else if (currWindowWidth < 900 && currWindowWidth > 768) {
        if (
          verticalTopAmount > tabletLimit ||
          verticalBottomAmount > desktopLimit
        ) {
          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.09 * (verticalTopAmount - desktopLimit);
          let scaleNumberBottom =
            1 - 0.09 * (verticalBottomAmount - desktopLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
        // tabletLimit;
      } else if (currWindowWidth <= 768 && currWindowWidth > 600) {
        if (
          verticalTopAmount > tabletLimit ||
          verticalBottomAmount > tabletLimit
        ) {
          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.09 * (verticalTopAmount - tabletLimit);
          let scaleNumberBottom =
            1 - 0.09 * (verticalBottomAmount - tabletLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
      } else if (currWindowWidth <= 600 && currWindowWidth >= 520) {
        if (
          verticalTopAmount > tabletLimit ||
          verticalBottomAmount > tabletLimit
        ) {
          let newscaleNumber = 0;
          if (verticalTopAmount > 7) {
            let count = verticalTopAmount - tabletLimit - 7;
            if (count > 0) {
              newscaleNumber = 0.1 * (verticalTopAmount - 7);
            }
          }

          let scaleNumber = 1;

          let scaleNumberTop = 1 - 0.09 * (verticalTopAmount - tabletLimit);
          let scaleNumberBottom =
            1 - 0.09 * (verticalBottomAmount - tabletLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }

          tableBlock.style.scale = `${scaleNumber}`;
        }
      } else if (currWindowWidth < 520 && currWindowWidth >= 425) {
        if (
          verticalTopAmount > tabletLimit ||
          verticalBottomAmount > tabletLimit
        ) {
          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.07 * (verticalTopAmount - desktopLimit);
          let scaleNumberBottom =
            1 - 0.07 * (verticalBottomAmount - desktopLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
      } else if (currWindowWidth < 425 && currWindowWidth > 375) {
        if (verticalTopAmount > 4) {
          let newscaleNumber = 0;
          if (verticalTopAmount > 5) {
            let count = verticalTopAmount - 5;
            if (count > 0) {
              newscaleNumber = 0.08 * (verticalTopAmount - 5);
            }
          }

          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.072 * (verticalTopAmount - desktopLimit);
          let scaleNumberBottom =
            1 - 0.072 * (verticalBottomAmount - desktopLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
      } else if (currWindowWidth <= 375) {
        if (verticalTopAmount > 4) {
          let scaleNumber = 1;
          let scaleNumberTop = 1 - 0.07 * (verticalTopAmount - desktopLimit);
          let scaleNumberBottom =
            1 - 0.07 * (verticalBottomAmount - desktopLimit);
          if (scaleNumberBottom < scaleNumberTop) {
            scaleNumber = scaleNumberBottom;
          } else {
            scaleNumber = scaleNumberTop;
          }
          tableBlock.style.scale = `${scaleNumber}`;
        }
      }

      break;
  }
}

function placeVericalTilesBlock3(
  verticalTop,
  verticalBottom,
  leftPadding,
  tableBlock,
  parentBlock,
  parentBlockLeft,
  originTileBlock,
  block,
  right,
  left
) {
  let blockTiles = [];
  let block7tiles = verticalTop.splice(0, verticalTop.length - 2);
  let block6tiles = verticalTop.splice(0);
  let block8tiles = verticalBottom.splice(0, 2);
  let block9tiles = verticalBottom.splice(0);
  blockTiles.push({ id: 6, tiles: block6tiles });
  blockTiles.push({ id: 7, tiles: block7tiles });
  blockTiles.push({ id: 8, tiles: block8tiles });
  blockTiles.push({ id: 9, tiles: block9tiles });

  // check if first tile in block 6 is double
  let topTileIsDouble = false;
  const lastBlock6Tile = block6tiles[0];
  if (
    lastBlock6Tile &&
    lastBlock6Tile.left == lastBlock6Tile.right &&
    lastBlock6Tile.id >= 0
  ) {
    block6tiles.unshift(block7tiles[block7tiles.length - 1]);
    block7tiles.pop();
    topTileIsDouble = true;
  }

  // check if last tile in block 8 is double
  let bottomTileIsDouble = false;
  const lastBlock8Tile = block8tiles[block8tiles.length - 1];
  if (
    lastBlock8Tile &&
    lastBlock8Tile.left == lastBlock8Tile.right &&
    lastBlock8Tile.id >= 0
  ) {
    block8tiles.push(block9tiles[0]);
    block9tiles.shift();
    bottomTileIsDouble = true;
  }

  blockTiles.forEach((block) => {
    const newBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (newBlock) {
      newBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          newBlock.innerHTML += `
        <div class="domino-game-table__tile ${
          tile.rotate ? "rotated" : ""
        }" tileid="${+tile.id}">
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.left
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
          </div>
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.right
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
          </div>
        </div>
        `;
        }
      });
    }
    tableBlock.appendChild(newBlock);
  });

  const newBlock6 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${6}"]`
  );

  const newBlock7 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${7}"]`
  );
  const newBlock8 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${8}"]`
  );
  const newBlock9 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${9}"]`
  );

  const block5 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${5}"]`
  );
  const block1 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${1}"]`
  );

  let block6Elements = newBlock6.querySelectorAll(".domino-game-table__tile");
  let block7Elements = newBlock7.querySelectorAll(".domino-game-table__tile");
  let block8Elements = newBlock8.querySelectorAll(".domino-game-table__tile");
  let block9Elements = newBlock9.querySelectorAll(".domino-game-table__tile");

  // если в 6 блоке последняя перевернутая то повертаем ее обратно
  if (block7Elements.length > 0) {
    let lastElement = block6Elements[0];
    lastElement.classList.remove("rotated");
  }
  if (block9Elements.length > 0) {
    let lastElement = block8Elements[block8Elements.length - 1];
    lastElement.classList.remove("rotated");
  }

  // нормальная x координата для перевернутой вертикально
  let newBlock6XCoord =
    parentBlockLeft +
    leftPadding -
    newBlock6.offsetWidth / 2 +
    newBlock6.offsetHeight / 2 -
    10;

  let newBlock6YCoord =
    tableBlock.offsetHeight / 2 -
    newBlock6.offsetWidth / 2 -
    newBlock6.offsetHeight -
    10;

  newBlock6.style.left = `${newBlock6XCoord}px`;
  newBlock6.style.top = `${newBlock6YCoord}px`;
  newBlock6.style.transform = `rotateZ(90deg)`;

  let newBlock7XCoord = parentBlockLeft + leftPadding - newBlock7.offsetWidth;

  let newBlock7YCoord =
    tableBlock.offsetHeight / 2 -
    newBlock6.offsetWidth / 2 -
    parentBlock.offsetHeight -
    originTileBlock.offsetHeight +
    10;

  if (topTileIsDouble) {
    newBlock7YCoord -= 20;
  }

  newBlock7.style.left = `${newBlock7XCoord}px`;
  newBlock7.style.top = `${newBlock7YCoord}px`;

  // =============================================================================================================================

  // если начальний елемент с самого правого края
  if (right) {
    // нормальная x координата для перевернутой вертикально
    newBlock6XCoord =
      parentBlockLeft + leftPadding + originTileBlock.offsetWidth;

    newBlock6YCoord = tableBlock.offsetHeight / 2 - newBlock6.offsetHeight / 2;

    newBlock6.style.transform = `rotateZ(180deg)`;
    newBlock6.style.left = `${newBlock6XCoord}px`;
    newBlock6.style.top = `${newBlock6YCoord}px`;

    newBlock7XCoord = newBlock6XCoord + newBlock6.offsetWidth;
    newBlock7YCoord = newBlock6YCoord;

    newBlock7.style.left = `${newBlock7XCoord}px`;
    newBlock7.style.top = `${newBlock7YCoord}px`;
    newBlock7.style.transform = `rotateZ(-180deg)`;
  }

  // нижний кусочек
  let newBlock8XCoord =
    parentBlockLeft +
    leftPadding -
    newBlock8.offsetWidth / 2 +
    newBlock8.offsetHeight / 2 -
    10;

  let newBlock8YCoord =
    tableBlock.offsetHeight / 2 +
    parentBlock.offsetHeight / 2 +
    newBlock8.offsetWidth / 2 -
    newBlock8.offsetHeight / 2 +
    10;

  newBlock8.style.transform = `rotateZ(90deg)`;
  newBlock8.style.left = `${newBlock8XCoord}px`;
  newBlock8.style.top = `${newBlock8YCoord}px`;

  let newBlock9XCoord =
    parentBlockLeft + leftPadding + originTileBlock.offsetWidth;

  let newBlock9YCoord =
    tableBlock.offsetHeight / 2 +
    parentBlock.offsetHeight +
    originTileBlock.offsetHeight +
    12;

  if (bottomTileIsDouble) {
    newBlock9YCoord += 40;
  }

  newBlock9.style.left = `${newBlock9XCoord}px`;
  newBlock9.style.top = `${newBlock9YCoord}px`;

  // если начальний елемент с самого левого края
  if (left) {
    let newBlock8XCoord = parentBlockLeft - newBlock8.offsetWidth;
    let newBlock8YCoord =
      tableBlock.offsetHeight / 2 - newBlock6.offsetHeight / 2;

    newBlock8.style.transform = `rotateZ(180deg)`;
    newBlock8.style.left = `${newBlock8XCoord}px`;
    newBlock8.style.top = `${newBlock8YCoord}px`;

    let newBlock9XCoord = newBlock8XCoord - newBlock9.offsetWidth;

    let newBlock9YCoord =
      tableBlock.offsetHeight / 2 - newBlock6.offsetHeight / 2;

    newBlock9.style.transform = `rotateZ(180deg)`;
    newBlock9.style.left = `${newBlock9XCoord}px`;
    newBlock9.style.top = `${newBlock9YCoord}px`;
  }
}

function placeVericalTilesBlock5(
  verticalTop,
  verticalBottom,
  leftPadding,
  tableBlock,
  parentBlock,
  parentBlockLeft,
  originTileBlock,
  block,
  right,
  left
) {
  let blockTiles = [];
  let block7tiles = verticalTop.splice(0, verticalTop.length - 2);
  let block6tiles = verticalTop.splice(0);
  let block8tiles = verticalBottom.splice(0);
  blockTiles.push({ id: 6, tiles: block6tiles });
  blockTiles.push({ id: 7, tiles: block7tiles });
  blockTiles.push({ id: 8, tiles: block8tiles });
  blockTiles.forEach((block) => {
    const newBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (newBlock) {
      newBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          newBlock.innerHTML += `
        <div class="domino-game-table__tile ${
          tile.rotate ? "rotated" : ""
        }" tileid="${+tile.id}">
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.left
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
          </div>
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.right
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
          </div>
        </div>
        `;
        }
      });
    }
    tableBlock.appendChild(newBlock);
  });

  const newBlock6 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${6}"]`
  );

  const newBlock7 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${7}"]`
  );
  const newBlock8 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${8}"]`
  );

  const main3Block = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${3}"]`
  );

  const block5 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${5}"]`
  );
  const block4 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${4}"]`
  );
  const block1 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${1}"]`
  );

  let block5Elements = block5.querySelectorAll(".domino-game-table__tile");
  // find block5 tiles that are on the left of origin tile
  const leftTileBlocks = [];
  let flag = false;
  block5Elements.forEach((tile) => {
    if (
      +originTileBlock.getAttribute("tileid") == +tile.getAttribute("tileid")
    ) {
      flag = true;
    }
    if (
      !flag &&
      +tile.getAttribute("tileid") != +originTileBlock.getAttribute("tileid")
    ) {
      leftTileBlocks.push(tile);
    }
  });

  let leftVerticalPadding = 0;
  leftTileBlocks.forEach((item) => {
    leftVerticalPadding += item.offsetWidth;
  });

  // coordinates for non-rotated
  // let newBlock6XCoord =
  //   main3Block.offsetLeft +
  //   main3Block.offsetWidth -
  //   block4.offsetHeight -
  //   leftPadding -
  //   originTileBlock.offsetWidth +
  //   10;

  // let newBlock6YCoord =
  //   tableBlock.offsetHeight / 2 -
  //   block4.offsetWidth -
  //   10 +
  //   originTileBlock.offsetHeight / 2;

  let newBlock6XCoord =
    main3Block.offsetLeft +
    main3Block.offsetWidth -
    block4.offsetHeight -
    leftPadding -
    originTileBlock.offsetWidth +
    10 -
    newBlock6.offsetWidth / 2 +
    newBlock6.offsetHeight / 2 -
    5;

  let newBlock6YCoord =
    tableBlock.offsetHeight / 2 -
    block4.offsetWidth +
    originTileBlock.offsetHeight / 2 +
    newBlock6.offsetWidth / 2 -
    newBlock6.offsetHeight / 2;

  newBlock6.style.left = `${newBlock6XCoord}px`;
  newBlock6.style.top = `${newBlock6YCoord}px`;
  newBlock6.style.transform = `rotateZ(-90deg)`;

  let newBlock7XCoord =
    main3Block.offsetLeft +
    main3Block.offsetWidth -
    block4.offsetHeight -
    leftPadding -
    originTileBlock.offsetWidth +
    10 -
    newBlock7.offsetWidth +
    5;

  let newBlock7YCoord = newBlock6YCoord + newBlock6.offsetHeight + 5;

  // check if last tile in newBlock6 is double
  const firstNewBlock6Tile = newBlock6.querySelectorAll(
    ".domino-game-table__tile"
  )[0];

  const lastNewBlock6TileLeft = +firstNewBlock6Tile
    .querySelector(".domino-game-table__tile-half:first-child")
    .classList[1].split("-")[3];

  const lastNewBlock6TileRight = +firstNewBlock6Tile
    .querySelector(".domino-game-table__tile-half:last-child")
    .classList[1].split("-")[3];

  if (lastNewBlock6TileLeft == lastNewBlock6TileRight) {
    // move 7 block half tile up and half left
    newBlock7XCoord -= firstNewBlock6Tile.offsetWidth / 2;
    newBlock7YCoord -= firstNewBlock6Tile.offsetWidth / 2 + 1;
  }

  newBlock7.style.left = `${newBlock7XCoord}px`;
  newBlock7.style.top = `${newBlock7YCoord}px`;

  let newBlock8XCoord =
    main3Block.offsetLeft +
    main3Block.offsetWidth -
    block4.offsetHeight -
    leftPadding -
    originTileBlock.offsetWidth +
    5 -
    newBlock8.offsetWidth / 2 +
    newBlock8.offsetHeight / 2;

  let newBlock8YCoord =
    tableBlock.offsetHeight / 2 -
    block4.offsetWidth -
    originTileBlock.offsetHeight / 2 +
    newBlock8.offsetWidth / 2 -
    newBlock8.offsetHeight / 2 -
    newBlock8.offsetWidth;

  newBlock8.style.left = `${newBlock8XCoord}px`;
  newBlock8.style.top = `${newBlock8YCoord}px`;
  newBlock8.style.transform = `rotateZ(-90deg)`;

  if (right) {
    // dont rotate first tile in the block5
    const firstTile = block5.querySelector(".domino-game-table__tile");
    firstTile.classList.remove("rotated");
    // move 5 block to the left on half of tile
    block5.style.left = `${block5.offsetLeft - firstTile.offsetWidth / 2}px`;
    newBlock6.style.left = `${
      newBlock6.offsetLeft - firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.left = `${
      newBlock7.offsetLeft - firstTile.offsetWidth / 4
    }px`;
    newBlock6.style.top = `${
      newBlock6.offsetTop - firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.top = `${
      newBlock7.offsetTop - firstTile.offsetWidth / 4
    }px`;
    newBlock8.style.left = `${
      newBlock8.offsetLeft - firstTile.offsetWidth / 4
    }px`;
    newBlock8.style.top = `${
      newBlock8.offsetTop + firstTile.offsetWidth / 4
    }px`;
  }
}

function placeVericalTilesBlock1(
  verticalTop,
  verticalBottom,
  leftPadding,
  tableBlock,
  parentBlock,
  parentBlockLeft,
  originTileBlock,
  block,
  right,
  left
) {
  let blockTiles = [];
  let block7tiles = verticalTop.splice(0, verticalTop.length - 2);
  let block6tiles = verticalTop.splice(0);
  let block8tiles = verticalBottom.splice(0);
  blockTiles.push({ id: 6, tiles: block6tiles });
  blockTiles.push({ id: 7, tiles: block7tiles });
  blockTiles.push({ id: 8, tiles: block8tiles });
  blockTiles.forEach((block) => {
    const newBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (newBlock) {
      newBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          newBlock.innerHTML += `
        <div class="domino-game-table__tile ${
          tile.rotate ? "rotated" : ""
        }" tileid="${+tile.id}">
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.left
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
          </div>
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.right
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
          </div>
        </div>
        `;
        }
      });
    }
    tableBlock.appendChild(newBlock);
  });

  const newBlock6 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${6}"]`
  );

  const newBlock7 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${7}"]`
  );
  const newBlock8 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${8}"]`
  );

  const main3Block = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${3}"]`
  );

  const block5 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${5}"]`
  );
  const block4 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${4}"]`
  );
  const block2 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${2}"]`
  );
  const block1 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${1}"]`
  );

  // find block1 tiles that are on the right of origin tile
  let block1Elements = block1.querySelectorAll(".domino-game-table__tile");
  block1Elements = Array.from(block1Elements).reverse();
  let firstTile = block1Elements[0];
  const leftTileBlocks = [];
  let flag = false;

  block1Elements.forEach((tile) => {
    if (
      +originTileBlock.getAttribute("tileid") == +tile.getAttribute("tileid")
    ) {
      flag = true;
    }
    if (
      !flag &&
      +tile.getAttribute("tileid") != +originTileBlock.getAttribute("tileid")
    ) {
      leftTileBlocks.push(tile);
    }
  });

  let leftVerticalPadding = 0;
  leftTileBlocks.forEach((item) => {
    leftVerticalPadding += item.offsetWidth;
  });

  let newBlock6XCoord =
    main3Block.offsetLeft +
    leftVerticalPadding +
    originTileBlock.offsetHeight / 2 -
    newBlock6.offsetWidth / 2 +
    newBlock6.offsetHeight / 2 -
    12.5;

  let newBlock6YCoord =
    tableBlock.offsetHeight / 2 +
    block2.offsetWidth -
    originTileBlock.offsetHeight -
    newBlock6.offsetWidth / 2 +
    newBlock6.offsetHeight / 2 -
    15;

  newBlock6.style.left = `${newBlock6XCoord}px`;
  newBlock6.style.top = `${newBlock6YCoord}px`;
  newBlock6.style.transform = `rotateZ(90deg)`;

  let newBlock7XCoord =
    main3Block.offsetLeft +
    leftVerticalPadding +
    originTileBlock.offsetHeight -
    5;

  let newBlock7YCoord =
    tableBlock.offsetHeight / 2 +
    block2.offsetWidth -
    originTileBlock.offsetHeight / 2 -
    7.5 -
    newBlock6.offsetWidth;

  newBlock7.style.left = `${newBlock7XCoord}px`;
  newBlock7.style.top = `${newBlock7YCoord}px`;
  newBlock7.style.transform = `rotateZ(180deg)`;

  let newBlock8XCoord =
    main3Block.offsetLeft +
    leftVerticalPadding +
    originTileBlock.offsetHeight / 2 -
    newBlock8.offsetWidth / 2 +
    newBlock8.offsetHeight / 2 -
    12.5;

  let newBlock8YCoord =
    tableBlock.offsetHeight / 2 +
    block2.offsetWidth +
    originTileBlock.offsetHeight / 2 +
    newBlock8.offsetWidth / 2 -
    newBlock8.offsetHeight / 2 -
    5;

  newBlock8.style.left = `${newBlock8XCoord}px`;
  newBlock8.style.top = `${newBlock8YCoord}px`;
  newBlock8.style.transform = `rotateZ(90deg)`;

  // left doesn't work properly, check if first tile is double
  const firstTileLeft = +firstTile
    .querySelector(".domino-game-table__tile-half:first-child")
    .classList[1].split("-")[3];
  const firstTileRight = +firstTile
    .querySelector(".domino-game-table__tile-half:last-child")
    .classList[1].split("-")[3];
  left = firstTileLeft == firstTileRight;
  if (left) {
    firstTile.classList.remove("rotated");
    newBlock6.style.left = `${
      newBlock6.offsetLeft + firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.left = `${
      newBlock7.offsetLeft + firstTile.offsetWidth / 4
    }px`;
    newBlock6.style.top = `${
      newBlock6.offsetTop + firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.top = `${
      newBlock7.offsetTop + firstTile.offsetWidth / 4
    }px`;
    newBlock8.style.left = `${
      newBlock8.offsetLeft + firstTile.offsetWidth / 4
    }px`;
    newBlock8.style.top = `${
      newBlock8.offsetTop - firstTile.offsetWidth / 4
    }px`;
  }
}

function placeVericalTilesBlock4(
  verticalTop,
  verticalBottom,
  leftPadding,
  tableBlock,
  parentBlock,
  parentBlockLeft,
  originTileBlock,
  block,
  right,
  left
) {
  let blockTiles = [];
  let block7tiles = verticalTop.splice(0);
  let block6tiles = verticalBottom.splice(0);

  blockTiles.push({ id: 6, tiles: block6tiles });
  blockTiles.push({ id: 7, tiles: block7tiles });

  blockTiles.forEach((block) => {
    const newBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (newBlock) {
      newBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          newBlock.innerHTML += `
        <div class="domino-game-table__tile ${
          tile.rotate ? "rotated" : ""
        }" tileid="${+tile.id}">
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.left
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
          </div>
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.right
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
          </div>
        </div>
        `;
        }
      });
    }
    tableBlock.appendChild(newBlock);
  });
  // get all tiles that are on the right of origin tile
  const allTilesInBlock = parentBlock.querySelectorAll(
    ".domino-game-table__tile"
  );
  const leftTileBlocks = [];
  let flag = false;
  allTilesInBlock.forEach((tile) => {
    if (
      +originTileBlock.getAttribute("tileid") == +tile.getAttribute("tileid")
    ) {
      flag = true;
    }
    if (
      !flag &&
      +tile.getAttribute("tileid") != +originTileBlock.getAttribute("tileid")
    ) {
      leftTileBlocks.push(tile);
    }
  });

  let leftVerticalPadding = 0;
  leftTileBlocks.forEach((item) => {
    leftVerticalPadding += item.offsetWidth;
  });

  let main3Block = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${3}"]`
  );

  let main3BlockLeft = +main3Block.style.left.split("px")[0];

  const newBlock6 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${6}"]`
  );

  const newBlock7 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${7}"]`
  );

  const block4 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${4}"]`
  );
  const block5 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${5}"]`
  );

  // нормальная x координата для перевернутой вертикально
  let newBlock6XCoord =
    main3BlockLeft +
    main3Block.offsetWidth +
    parentBlock.offsetHeight * 0.25 +
    10;

  let newBlock6YCoord =
    tableBlock.offsetHeight / 2 -
    originTileBlock.offsetHeight -
    leftVerticalPadding +
    15;

  newBlock6.style.left = `${newBlock6XCoord}px`;
  newBlock6.style.top = `${newBlock6YCoord}px`;
  newBlock6.style.transform = `rotateZ(90deg)`;

  // if(right){
  //    newBlock6XCoord =
  //   main3BlockLeft +
  //   main3Block.offsetWidth +
  //   parentBlock.offsetHeight * 0.25 +
  //   10;

  //  newBlock6YCoord =
  //   tableBlock.offsetHeight / 2 -
  //   originTileBlock.offsetHeight -
  //   leftVerticalPadding +
  //   15;

  // newBlock6.style.left = `${newBlock6XCoord}px`;
  // newBlock6.style.top = `${newBlock6YCoord}px`;
  // newBlock6.style.transform = `rotateZ(90deg)`;
  // }

  let newBlock7XCoord =
    main3BlockLeft +
    main3Block.offsetWidth -
    parentBlock.offsetHeight -
    newBlock7.offsetWidth;

  let newBlock7YCoord =
    tableBlock.offsetHeight / 2 -
    originTileBlock.offsetHeight -
    leftVerticalPadding +
    15;

  newBlock7.style.left = `${newBlock7XCoord}px`;
  newBlock7.style.top = `${newBlock7YCoord}px`;
  newBlock6.style.transform = `rotateZ(0deg)`;

  if (left) {
    const firstTile = parentBlock.querySelector(".domino-game-table__tile");
    firstTile.classList.remove("rotated");
    block4.style.left = `${block4.offsetLeft - firstTile.offsetWidth / 4}px`;
    block4.style.top = `${block4.offsetTop - firstTile.offsetWidth / 4}px`;
    block5.style.top = `${block5.offsetTop - firstTile.offsetWidth / 2}px`;
    newBlock6.style.left = `${
      newBlock6.offsetLeft - firstTile.offsetWidth / 4
    }px`;
    newBlock6.style.top = `${
      newBlock6.offsetTop - firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.left = `${
      newBlock7.offsetLeft + firstTile.offsetWidth / 4
    }px`;
    newBlock7.style.top = `${
      newBlock7.offsetTop - firstTile.offsetWidth / 4
    }px`;
  }
}

function placeVericalTilesBlock2(
  verticalTop,
  verticalBottom,
  leftPadding,
  tableBlock,
  parentBlock,
  parentBlockLeft,
  originTileBlock,
  block,
  right,
  left
) {
  let blockTiles = [];
  let block7tiles = verticalTop.splice(0);
  let block6tiles = verticalBottom.splice(0);

  blockTiles.push({ id: 6, tiles: block6tiles });
  blockTiles.push({ id: 7, tiles: block7tiles });

  blockTiles.forEach((block) => {
    const newBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (newBlock) {
      newBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        if (tile?.id >= 0) {
          newBlock.innerHTML += `
        <div class="domino-game-table__tile ${
          tile.rotate ? "rotated" : ""
        }" tileid="${+tile.id}">
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.left
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
          </div>
          <div class="domino-game-table__tile-half domino-game-dots-${
            tile.right
          }">
            ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
          </div>
        </div>
        `;
        }
      });
    }
    tableBlock.appendChild(newBlock);
  });
  // get all tiles that are on the right of origin tile
  let allTilesInBlock = parentBlock.querySelectorAll(
    ".domino-game-table__tile"
  );
  const leftTileBlocks = [];
  let flag = false;
  // reverse allTilesInBlock
  let allTilesInBlockArr = Array.from(allTilesInBlock);
  allTilesInBlockArr.reverse();
  allTilesInBlock = allTilesInBlockArr;

  allTilesInBlock.forEach((tile) => {
    if (
      +originTileBlock.getAttribute("tileid") == +tile.getAttribute("tileid")
    ) {
      flag = true;
    }
    if (
      !flag &&
      +tile.getAttribute("tileid") != +originTileBlock.getAttribute("tileid")
    ) {
      leftTileBlocks.push(tile);
    }
  });

  let leftVerticalPadding = 0;
  leftTileBlocks.forEach((item) => {
    leftVerticalPadding += item.offsetWidth;
  });

  let main3Block = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${3}"]`
  );

  let main3BlockLeft = +main3Block.style.left.split("px")[0];

  const newBlock6 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${6}"]`
  );

  const newBlock7 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${7}"]`
  );

  const block2 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${2}"]`
  );
  const block5 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${5}"]`
  );

  const block1 = document.querySelector(
    `.domino-game-table__table-tiles-block[id="${1}"]`
  );

  // нормальная x координата для перевернутой вертикально
  let newBlock6XCoord =
    tableBlock.offsetWidth / 2 -
    main3Block.offsetWidth / 2 -
    parentBlock.offsetHeight * 0.25 -
    newBlock6.offsetWidth -
    8;

  let newBlock6YCoord = tableBlock.offsetHeight / 2 + leftVerticalPadding + 10;

  newBlock6.style.left = `${newBlock6XCoord}px`;
  newBlock6.style.top = `${newBlock6YCoord}px`;
  newBlock6.style.transform = `rotateZ(180deg)`;

  let newBlock7XCoord =
    tableBlock.offsetWidth / 2 -
    main3Block.offsetWidth / 2 +
    parentBlock.offsetHeight +
    2;

  let newBlock7YCoord = tableBlock.offsetHeight / 2 + leftVerticalPadding + 10;
  // newBlock7.style.opacity = 0;

  newBlock7.style.left = `${newBlock7XCoord}px`;
  newBlock7.style.top = `${newBlock7YCoord}px`;
  newBlock7.style.transform = `rotateZ(180deg)`;

  const lastTile = parentBlock.querySelector(
    ".domino-game-table__tile:last-child"
  );
  // check if first tile is double
  const lastTileLeft = +lastTile
    .querySelector(".domino-game-table__tile-half:first-child")
    .classList[1].split("-")[3];
  const lastTileRight = +lastTile
    .querySelector(".domino-game-table__tile-half:last-child")
    .classList[1].split("-")[3];
  left = lastTileLeft == lastTileRight;

  if (left) {
    lastTile.classList.remove("rotated");
    block2.style.left = `${
      block2.offsetLeft - originTileBlock.offsetWidth / 4
    }px`;
    block2.style.top = `${
      block2.offsetTop + originTileBlock.offsetWidth / 4
    }px`;
    block1.style.top = `${
      block1.offsetTop + originTileBlock.offsetWidth / 2
    }px`;
    newBlock6.style.left = `${
      newBlock6.offsetLeft + originTileBlock.offsetWidth / 4
    }px`;
    newBlock6.style.top = `${
      newBlock6.offsetTop + originTileBlock.offsetWidth / 4
    }px`;
    newBlock7.style.left = `${
      newBlock7.offsetLeft - originTileBlock.offsetWidth / 4
    }px`;
    newBlock7.style.top = `${
      newBlock7.offsetTop + originTileBlock.offsetWidth / 4
    }px`;
  }
}

const drawClassicGameScene = (defaultScene, newScene, player = null) => {
  const tableBlock = document.querySelector(".domino-game-table__table");
  let tilesAmount = countTiles(defaultScene);
  let blockTiles = [];
  let gameMode = location.hash.split("/")[location.hash.split("/").length - 1];

  let parsedScene = parseGameScene(newScene, gameMode.toUpperCase());
  // const sceneLength = newScene.length;

  if (tilesAmount <= 8) {
    blockTiles = [{ id: 3, tiles: parsedScene }];
  } else if (tilesAmount > 8 && tilesAmount <= 12) {
    blockTiles.push(
      { id: 3, tiles: parsedScene.slice(0, 8) },
      { id: 4, tiles: parsedScene.slice(8) }
    );
  } else if (tilesAmount > 12 && tilesAmount <= 18) {
    blockTiles.push(
      { id: 3, tiles: parsedScene.slice(0, 8) },
      { id: 4, tiles: parsedScene.slice(8, 12) },
      { id: 5, tiles: parsedScene.slice(12) }
    );
  } else if (tilesAmount > 18 && tilesAmount <= 22) {
    let firstRowDelete = parsedScene.length - 18;
    blockTiles.push(
      {
        id: 5,
        tiles: parsedScene.slice(firstRowDelete + 12, firstRowDelete + 18),
      },
      {
        id: 4,
        tiles: parsedScene.slice(firstRowDelete + 8, firstRowDelete + 12),
      },
      { id: 3, tiles: parsedScene.slice(firstRowDelete, firstRowDelete + 8) },
      { id: 2, tiles: parsedScene.slice(0, firstRowDelete) }
    );
  } else if (tilesAmount > 22 && tilesAmount <= 28) {
    let firstRowDelete = parsedScene.length - 22;
    blockTiles.push(
      {
        id: 5,
        tiles: parsedScene.slice(firstRowDelete + 16, firstRowDelete + 22),
      },
      {
        id: 4,
        tiles: parsedScene.slice(firstRowDelete + 12, firstRowDelete + 16),
      },
      {
        id: 3,
        tiles: parsedScene.slice(firstRowDelete + 4, firstRowDelete + 12),
      },
      { id: 2, tiles: parsedScene.slice(firstRowDelete, firstRowDelete + 4) },
      { id: 1, tiles: parsedScene.slice(0, firstRowDelete) }
    );
  }

  let insertingBlocks = document.querySelectorAll(
    ".domino-game-table__table-tiles-block"
  );

  if (insertingBlocks.length < 5) {
    tableBlock.innerHTML = `
      <div id="1" class="domino-game-table__table-tiles-block-1 domino-game-table__table-tiles-block"></div>
      <div id="2" class="domino-game-table__table-tiles-block-2 domino-game-table__table-tiles-block"></div>
      <div id="3" class="domino-game-table__table-tiles-block-3 domino-game-table__table-tiles-block"></div>
      <div id="4" class="domino-game-table__table-tiles-block-4 domino-game-table__table-tiles-block"></div>
      <div id="5" class="domino-game-table__table-tiles-block-5 domino-game-table__table-tiles-block"></div>
      <div id="6" class="domino-game-table__table-tiles-block-6 domino-game-table__table-tiles-block"></div>
      <div id="7" class="domino-game-table__table-tiles-block-7 domino-game-table__table-tiles-block"></div>
      <div id="8" class="domino-game-table__table-tiles-block-8 domino-game-table__table-tiles-block"></div>
      <div id="9" class="domino-game-table__table-tiles-block-9 domino-game-table__table-tiles-block"></div>
    `;
    insertingBlocks = document.querySelectorAll(
      ".domino-game-table__table-tiles-block"
    );
  }
  insertingBlocks.forEach((block) => {
    block.innerHTML = "";
  });
  blockTiles.forEach((block) => {
    const insertingBlock = document.querySelector(
      `.domino-game-table__table-tiles-block[id="${block.id}"]`
    );
    if (insertingBlock) {
      insertingBlock.innerHTML = "";
      block.tiles.forEach((tile) => {
        insertingBlock.innerHTML += `
          <div class="domino-game-table__tile ${
            tile.rotate ? "rotated" : ""
          }" tileid="${+tile.id}">
            <div class="domino-game-table__tile-half domino-game-dots-${
              tile.left
            }">
              ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.left)}
            </div>
            <div class="domino-game-table__tile-half domino-game-dots-${
              tile.right
            }">
              ${`<div class="domino-game-tile__dot"></div>`.repeat(tile.right)}
            </div>
          </div>
          `;
      });
    }
  });
  tablePlacement();
  // scaleDominoTable(newScene);

  return;
};

function parseGameScene(scene, gameMode) {
  if (gameMode && gameMode == "CLASSIC") {
    let parsedScene = [];
    scene.forEach((item) => {
      if (item && item.id >= 0) {
        parsedScene.push(item);
      }
    });
    return parsedScene;
  } else {
    // для телефона
  }
}

const drawUserInfo = (playerData, user) => {
  const userBlock = document.querySelector(".domino-game-user");
  const usernameBlock = userBlock.querySelector(".domino-game-user__name");
  const userScoreBlock = userBlock.querySelector(
    ".domino-game-user__score span"
  );

  usernameBlock.innerHTML = user.username;
  if (userScoreBlock) {
    userScoreBlock.innerHTML = playerData.score;
  }
};

const addTelephoneSisterEventListeners = (
  tile,
  roomId,
  tableId,
  playerMode,
  gameMode,
  sisterCorners,
  user
) => {
  // функция для отправки систр тайла и очистки после нажатия
  function telephoneSisterTilesListener(sisterTile, thisTile) {
    return function () {
      if (!thisTile.classList.contains("highlight")) {
        return;
      }
      window.ws.send(
        JSON.stringify({
          method: "playDominoTurn",
          userId: +user.userId,
          roomId,
          tableId,
          playerMode,
          gameMode,
          tile,
          sisterTile,
        })
      );

      let tiles = document.querySelectorAll(".domino-game__tile");
      tiles.forEach((tile) => {
        tile.classList.add("disabled");
        tile.classList.remove("highlight");
      });

      let sceneTiles = document.querySelectorAll(".domino-game-table__tile");

      sceneTiles.forEach((sceneTile) => {
        if (sceneTile) {
          let sceneTileClickArea = sceneTile.querySelector(
            ".scene-sister-tile-click-area"
          );
          if (sceneTileClickArea) {
            sceneTileClickArea.remove();
          }
        }
        sceneTile.classList.remove("highlight", `finger-left`);
        sceneTile.classList.remove("sister-highlight");
      });

      sisterCorners.forEach((corner) => {
        const sisterTileElement = document.querySelector(
          `.domino-game-table__tile[tileid="${corner.id}"]`
        );
        if (sisterTileElement) {
          sisterTileElement.classList.remove("highlight");
          sisterTileElement.classList.remove("sister-highlight");
        }
      });
    };
  }

  // чистим все тайлики от лисенеров
  let sceneTiles = document.querySelectorAll(".domino-game-table__tile");
  sceneTiles.forEach((sceneTile) => {
    if (sceneTile) {
      let sceneTileClickArea = sceneTile.querySelector(
        ".scene-sister-tile-click-area"
      );
      if (sceneTileClickArea) {
        sceneTileClickArea.remove();
      }
    }
    sceneTile.classList.remove("highlight", `finger-left`);
    sceneTile.classList.remove("sister-highlight");
  });

  // ставим новые лисенеры
  sisterCorners.forEach((corner) => {
    let sisterTile = corner.side;
    const sisterTileElement = document.querySelector(
      `.domino-game-table__tile[tileid="${corner.id}"]`
    );

    if (sisterTileElement) {
      let existingTileClickArea = sisterTileElement.querySelector(
        ".scene-sister-tile-click-area"
      );
      if (existingTileClickArea) {
        existingTileClickArea.remove();
      }
      // check if sisterTileElement is double and contains class central
      const sisterTileLeft = +sisterTileElement
        .querySelector(".domino-game-table__tile-half:first-child")
        .classList[1].split("-")[3];

      const sisterTileRight = +sisterTileElement
        .querySelector(".domino-game-table__tile-half:last-child")
        .classList[1].split("-")[3];

      const isTileAvailable = true;

      if (sisterTileLeft == sisterTileRight) {
        // get tiles that are on the left and on the right of sisterTileElement in scene
        const scene = JSON.parse(localStorage.getItem("dominoGameScene"));
        const middleRow = scene[Math.floor(scene.length / 2)];
        const leftTile = middleRow[middleRow.indexOf(corner) - 1];
        const rightTile = middleRow[middleRow.indexOf(corner) + 1];

        if (
          leftTile &&
          rightTile &&
          leftTile?.id >= 0 &&
          rightTile?.id >= 0 &&
          !sisterTileElement.classList.contains("central")
        ) {
          isTileAvailable = false;
        }
      }
      if (isTileAvailable) {
        sisterTileElement.classList.add("highlight");
        const clickHandler = telephoneSisterTilesListener(
          sisterTile,
          sisterTileElement
        );

        let sisterTileEmelementClickArea = document.createElement("div");
        sisterTileEmelementClickArea.classList.add(
          "scene-sister-tile-click-area"
        );
        sisterTileElement.appendChild(sisterTileEmelementClickArea);

        sisterTileEmelementClickArea.addEventListener("click", clickHandler);
      }
    }
  });
};

const addTwoTilesEventListeners = (
  tile,
  roomId,
  tableId,
  playerMode,
  gameMode,
  leftTile,
  rightTile,
  user,
  sisterTileElement
) => {
  function twoTilesListener(sisterTile, thisTile) {
    return function () {
      if (!thisTile.classList.contains("highlight")) {
        return;
      }
      window.ws.send(
        JSON.stringify({
          method: "playDominoTurn",
          userId: +user.userId,
          roomId,
          tableId,
          playerMode,
          gameMode,
          tile,
          sisterTile,
        })
      );

      // удалить подсветку всех
      let tiles = document.querySelectorAll(".domino-game__tile");
      tiles.forEach((tile) => {
        if (tile) {
          let tileClickArea = tile.querySelector(
            ".scene-sister-tile-click-area"
          );
          if (tileClickArea) {
            tileClickArea.remove();
          }
        }
        tile.classList.add("disabled");
        tile.classList.remove("highlight");
      });

      leftTile.removeEventListener("click", leftTileListener);
      rightTile.removeEventListener("click", rightTileListener);

      leftTile.classList.remove("highlight", "finger-left");
      rightTile.classList.remove("highlight", "finger-right");
      sisterTileElement.classList.remove("sister-highlight");
    };
  }

  let leftTileClickArea = leftTile.querySelector(
    ".scene-sister-tile-click-area"
  );
  if (leftTileClickArea) {
    leftTileClickArea.remove();
  }

  let rightTileClickArea = rightTile.querySelector(
    ".scene-sister-tile-click-area"
  );
  if (rightTileClickArea) {
    rightTileClickArea.remove();
  }

  let tileClickAreaLeft = document.createElement("div");
  tileClickAreaLeft.classList.add("scene-sister-tile-click-area");
  leftTile.appendChild(tileClickAreaLeft);
  let tileClickAreaRight = document.createElement("div");
  tileClickAreaRight.classList.add("scene-sister-tile-click-area");
  rightTile.appendChild(tileClickAreaRight);

  const leftTileListener = twoTilesListener("left", leftTile);
  const rightTileListener = twoTilesListener("right", rightTile);

  leftTile.classList.add("highlight", "finger-left");
  rightTile.classList.add("highlight", "finger-right");

  leftTileClickArea = leftTile.querySelector(".scene-sister-tile-click-area");
  rightTileClickArea = rightTile.querySelector(".scene-sister-tile-click-area");
  leftTileClickArea.addEventListener("click", leftTileListener);
  rightTileClickArea.addEventListener("click", rightTileListener);
};

export const openTilesMarket = (market) => {
  const siteLanguage = window.siteLanguage;

  let mainContainer = document.querySelector(".main__container");

  const existingPopup = document.querySelector(".market-popup");
  if (existingPopup) {
    return;
  }

  let marketPopup = document.createElement("div");
  marketPopup.classList.add("popup", "market-popup");
  marketPopup.innerHTML = `
 
  <div class="market-popup__body-wrapper">
    <h2 class="market-popup__title">${siteLanguage.dominoTable.market}</h2>
    <div class="market-popup__body">
    ${`
    <div class="market-popup__item available">
      <img src="img/logo-img-90deg.png" alt="" />
    </div>
    `.repeat(market.length)}
    </div>
  </div>

  `;

  mainContainer.appendChild(marketPopup);

  let marketTileItem = document.querySelectorAll(".market-popup__item");
  marketTileItem.forEach((tile) => {
    tile.addEventListener("click", function () {
      if (tile.classList.contains("available")) {
        marketTileItem.forEach((marketTile) => {
          marketTile.classList.remove("available");
        });
        const user = JSON.parse(localStorage.getItem("user"));
        tile.classList.add("market-tile__used");
        window.ws.send(
          JSON.stringify({
            method: "getMarketTile",
            userId: user.userId,
          })
        );
      }
    });
  });
};

export const getMarketTile = (tile, msg) => {
  let userTilesBlock = document.querySelector(".domino-game__tiles");

  let userTile = document.createElement("div");
  userTile.classList.add("domino-game__tile", "domino-tile", "disabled");
  userTile.setAttribute("tileid", tile.id);
  userTile.innerHTML = `
      <div class = "domino-game__tile-tile"> 
          <div class="domino-tile__half domino-dots-${tile.left}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.left)}
        </div>
        <div class="domino-tile__half domino-dots-${tile.right}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.right)}
        </div>
      </div>
      <div class = "domino-game__tile-click-area"> 
      </div>
  `;
  userTilesBlock.appendChild(userTile);

  // подсвечиваем если доминошка подходит
  tilesState(msg.turn, msg.scene);
  // добавляем функционал на доминошку для систер тайла и потом для обычного

  let marketPopup = document.querySelector(".market-popup");

  if (msg.closeMarket) {
    marketPopup.remove();
  } else if (!msg.closeMarket) {
    let marketTiles = marketPopup.querySelectorAll(".market-popup__item");
    marketTiles.forEach((tile) => {
      tile.classList.add("available");
    });
  }
};

export function updateMarketNum(marketNumber, playerId = null) {
  let dominoTableMarket = document.querySelector(".domino-table-store");
  if (dominoTableMarket) {
    let tableMarketScore = document.querySelector(".domino-table-store__score");
    if (tableMarketScore) {
      tableMarketScore.innerHTML = marketNumber;
    }
  }
  if (playerId) {
    animateMarketGettingTile(playerId);
  }
}

export const showMarketEnemy = (userId) => {
  let enemyBlock = document.querySelector(
    `.domino-game-table__enemy-player[userId="${userId}"]`
  );
  showMarketEnemyText(enemyBlock);

  if (enemyBlock) {
    enemyBlock.classList.add("skipped-turn");

    setTimeout(() => {
      enemyBlock.classList.remove("skipped-turn");
    }, 2000);
  }

  function showMarketEnemyText(enemyBlock) {
    const siteLanguage = window.siteLanguage;
    const existingAutoWindow = document.querySelector(".auto-window-enemy");
    if (existingAutoWindow) {
      existingAutoWindow.remove();
    }

    const autoWindow = document.createElement("div");
    autoWindow.classList.add("auto-window-enemy", "bg-red");
    autoWindow.innerHTML = siteLanguage.dominoGame.goMarket;

    if (enemyBlock) {
      enemyBlock.appendChild(autoWindow);
    }

    setTimeout(() => {
      autoWindow.remove();
    }, 2000);
  }
};

function animateMarketGettingTile(playerId) {}

export function updateEnemysTilesCount(tilesData) {
  tilesData.forEach((userTiles) => {
    let enemyUser = document.querySelector(
      `.domino-game-table__enemy-player[userid="${userTiles.userId}"]`
    );
    if (enemyUser) {
      let enemyUserTilesCount = enemyUser.querySelector(
        ".domino-enemy-player__img span"
      );
      if (enemyUserTilesCount) {
        enemyUserTilesCount.innerHTML = +userTiles.tilesNumber;
      }
    }
  });
}

export const countTiles = (scene) => {
  let tilesAmount = 0;
  scene.forEach((row) => {
    row.forEach((tile) => {
      if (tile && tile.id >= 0) {
        tilesAmount++;
      }
    });
  });
  return tilesAmount;
};

const checkIfVerticalsFilled = (scene) => {
  // take middle row
  let middleRow = scene[Math.floor(scene.length / 2)];
  // check if any other row has tiles
  let areVerticalsFilled = false;
  scene.forEach((row) => {
    if (row != middleRow) {
      row.forEach((tile) => {
        if (tile?.id) {
          areVerticalsFilled = true;
        }
      });
    }
  });
  return areVerticalsFilled;
};

const findVerticalCorners = (scene) => {
  // take middle row
  let verticalIndex = null;

  scene.forEach((row, i) => {
    if (i != Math.floor(scene.length / 2)) {
      row.forEach((tile) => {
        if (tile && tile.id >= 0) {
          verticalIndex = row.indexOf(tile);
        }
      });
    }
  });

  let top = null;
  let bottom = null;
  // find first and last element in rows with index verticalIndex
  scene.forEach((row) => {
    if (row[verticalIndex] && row[verticalIndex].id >= 0) {
      if (top == null) {
        top = row[verticalIndex];
      }
      bottom = row[verticalIndex];
    }
  });

  return { top, bottom };
};

export const tilesState = (
  turn,
  scene,
  continued = false,
  firstTurn = false
) => {
  let dominoGamePage = document.querySelector(".domino-game-page");
  if (dominoGamePage) {
    let userTiles = document.querySelectorAll(".domino-game__tile");
    let sceneTilesAmount = countTiles(scene);
    userTiles.forEach((tile) => {
      tile.classList.remove("sister-highlight");
      tile.classList.add("disabled");
      tile.classList.remove("highlight");

      let tileClickArea = tile.querySelector(".domino-game__tile-click-area");
      if (tileClickArea) {
        tileClickArea.remove();
      }
    });

    let user = localStorage.getItem("user");
    user = JSON.parse(user);

    if (turn == user.userId) {
      if (sceneTilesAmount == 0 && continued == true) {
        userTiles.forEach((tile) => {
          tile.classList.remove("disabled");
          tile.classList.add("highlight");

          let existingTileClickArea = tile.querySelector(
            ".domino-game__tile-click-area"
          );
          if (existingTileClickArea) {
            existingTileClickArea.remove();
          }
          let tileClickArea = document.createElement("div");
          tileClickArea.classList.add("domino-game__tile-click-area");
          tile.appendChild(tileClickArea);
          tileClickArea.addEventListener("click", addTileEventListeners(tile));
        });
        return;
      }

      let gameMode = "CLASSIC";

      if (location.hash.includes("CLASSIC")) {
        gameMode = "CLASSIC";
      } else if (location.hash.includes("TELEPHONE")) {
        gameMode = "TELEPHONE";
      }

      // location.hash.split("/")[location.hash.split("/").length - 1];
      gameMode = gameMode.toUpperCase();

      if (gameMode == "CLASSIC") {
        scene = scene[Math.floor(scene.length / 2)];

        if (sceneTilesAmount == 0) {
          // find double tiles in user tiles
          let doubleTiles = [];
          userTiles.forEach((tile) => {
            let left = +tile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];
            let right = +tile
              .querySelector(".domino-tile__half:last-child")
              .classList[1].split("-")[2];
            if (left == right) {
              doubleTiles.push(tile);
            }
          });

          // find the smallest tile from doubleTiles, not including 0
          if (doubleTiles.length == 0) {
            return;
          }

          let smallestDoubleTile = doubleTiles[0];

          doubleTiles.forEach((tile) => {
            let leftSmallest = +smallestDoubleTile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];
            let left = +tile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];

            if ((left < leftSmallest && left != 0) || leftSmallest == 0) {
              smallestDoubleTile = tile;
            }
          });

          smallestDoubleTile.classList.remove("disabled");
          smallestDoubleTile.classList.add("highlight");
          let existingTileClickArea = smallestDoubleTile.querySelector(
            ".domino-game__tile-click-area"
          );
          if (existingTileClickArea) {
            existingTileClickArea.remove();
          }
          let tileClickArea = document.createElement("div");
          tileClickArea.classList.add("domino-game__tile-click-area");
          smallestDoubleTile.appendChild(tileClickArea);
          tileClickArea.addEventListener(
            "click",
            addTileEventListeners(smallestDoubleTile)
          );

          // highlight all double tiles
          // doubleTiles.forEach((tile) => {
          //   tile.classList.remove("disabled");
          //   tile.classList.add("highlight");
          //   let existingTileClickArea = tile.querySelector(
          //     ".domino-game__tile-click-area"
          //   );
          //   if (existingTileClickArea) {
          //     existingTileClickArea.remove();
          //   }
          //   let tileClickArea = document.createElement("div");
          //   tileClickArea.classList.add("domino-game__tile-click-area");
          //   tile.appendChild(tileClickArea);
          //   tileClickArea.addEventListener(
          //     "click",
          //     addTileEventListeners(tile)
          //   );
          // });
          return;
        } else if (sceneTilesAmount == 0) {
          userTiles.forEach((tile) => {
            let left = +tile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];
            let right = +tile
              .querySelector(".domino-tile__half:last-child")
              .classList[1].split("-")[2];
            if ((left == 2 && right == 3) || (left == 3 && right == 2)) {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            }
          });
        } else if (sceneTilesAmount > 0) {
          // get right and left tiles
          let leftTile = null;
          let rightTile = null;
          for (let i = 0; i < scene.length; i++) {
            if (scene[i]?.id >= 0 && !leftTile) {
              leftTile = scene[i];
            }
          }
          for (let i = scene.length - 1; i >= 0; i--) {
            if (scene[i]?.id >= 0 && !rightTile) {
              rightTile = scene[i];
            }
          }

          // get left and right dots
          let leftDots = leftTile.left;
          let rightDots = rightTile.right;

          // find tiles with left and right dots in user tiles
          let leftTiles = [];
          let rightTiles = [];

          userTiles.forEach((tile) => {
            let left = +tile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];
            let right = +tile
              .querySelector(".domino-tile__half:last-child")
              .classList[1].split("-")[2];
            if (left == leftDots || right == leftDots) {
              leftTiles.push(tile);
            }
            if (right == rightDots || left == rightDots) {
              rightTiles.push(tile);
            }
          });

          // highlight all tiles with left and right dots
          leftTiles.forEach((tile) => {
            tile.classList.remove("disabled");
            tile.classList.add("highlight");
            let existingTileClickArea = tile.querySelector(
              ".domino-game__tile-click-area"
            );
            if (existingTileClickArea) {
              existingTileClickArea.remove();
            }
            let tileClickArea = document.createElement("div");
            tileClickArea.classList.add("domino-game__tile-click-area");
            tile.appendChild(tileClickArea);
            tileClickArea.addEventListener(
              "click",
              addTileEventListeners(tile)
            );
          });

          rightTiles.forEach((tile) => {
            tile.classList.remove("disabled");
            tile.classList.add("highlight");
            let existingTileClickArea = tile.querySelector(
              ".domino-game__tile-click-area"
            );
            if (existingTileClickArea) {
              existingTileClickArea.remove();
            }
            let tileClickArea = document.createElement("div");
            tileClickArea.classList.add("domino-game__tile-click-area");
            tile.appendChild(tileClickArea);
            tileClickArea.addEventListener(
              "click",
              addTileEventListeners(tile)
            );
          });
        }

        //
      } else {
        const areVerticalsFilled = checkIfVerticalsFilled(scene);

        if (!areVerticalsFilled) {
          let centralScene = scene[Math.floor(scene.length / 2)];
          if (sceneTilesAmount == 0) {
            // find double tiles in user tiles

            let is32tile = false;

            if (firstTurn) {
              userTiles.forEach((tile) => {
                let left = +tile
                  .querySelector(".domino-tile__half:first-child")
                  .classList[1].split("-")[2];
                let right = +tile
                  .querySelector(".domino-tile__half:last-child")
                  .classList[1].split("-")[2];
                if ((left == 3 && right == 2) || (right == 3 && left == 2)) {
                  tile.classList.remove("disabled");
                  tile.classList.add("highlight");
                  let existingTileClickArea = tile.querySelector(
                    ".domino-game__tile-click-area"
                  );
                  if (existingTileClickArea) {
                    existingTileClickArea.remove();
                  }
                  let tileClickArea = document.createElement("div");
                  tileClickArea.classList.add("domino-game__tile-click-area");
                  tile.appendChild(tileClickArea);
                  tileClickArea.addEventListener(
                    "click",
                    addTileEventListeners(tile)
                  );
                  is32tile = true;
                }
              });
            }

            if (!is32tile) {
              let doubleTiles = [];
              userTiles.forEach((tile) => {
                let left = +tile
                  .querySelector(".domino-tile__half:first-child")
                  .classList[1].split("-")[2];
                let right = +tile
                  .querySelector(".domino-tile__half:last-child")
                  .classList[1].split("-")[2];
                if (left == right) {
                  doubleTiles.push(tile);
                }
              });

              // highlight all double tiles
              doubleTiles.forEach((tile) => {
                tile.classList.remove("disabled");
                tile.classList.add("highlight");
                let existingTileClickArea = tile.querySelector(
                  ".domino-game__tile-click-area"
                );
                if (existingTileClickArea) {
                  existingTileClickArea.remove();
                }
                let tileClickArea = document.createElement("div");
                tileClickArea.classList.add("domino-game__tile-click-area");
                tile.appendChild(tileClickArea);
                tileClickArea.addEventListener(
                  "click",
                  addTileEventListeners(tile)
                );
              });
            }

            return;
          } else if (sceneTilesAmount > 0) {
            // get right and left tiles
            let leftTile = null;
            let rightTile = null;
            for (let i = 0; i < centralScene.length; i++) {
              if (centralScene[i]?.id >= 0 && !leftTile) {
                leftTile = centralScene[i];
              }
            }
            for (let i = centralScene.length - 1; i >= 0; i--) {
              if (centralScene[i]?.id >= 0 && !rightTile) {
                rightTile = centralScene[i];
              }
            }

            // get left and right dots
            let leftDots = leftTile.left;
            let rightDots = rightTile.right;

            // find tiles with left and right dots in user tiles
            let leftTiles = [];
            let rightTiles = [];
            let doubleTiles = [];

            // find double tiles on scene and highlight them
            centralScene.forEach((tile) => {
              if (tile?.left == tile?.right) {
                doubleTiles.push(tile);
              }
            });

            userTiles.forEach((tile) => {
              let left = +tile
                .querySelector(".domino-tile__half:first-child")
                .classList[1].split("-")[2];
              let right = +tile
                .querySelector(".domino-tile__half:last-child")
                .classList[1].split("-")[2];
              if (left == leftDots || right == leftDots) {
                leftTiles.push(tile);
              }
              if (right == rightDots || left == rightDots) {
                rightTiles.push(tile);
              }
            });

            // tyt
            doubleTiles.forEach((doubleTile) => {
              if (doubleTile.central == true) {
                userTiles.forEach((tile) => {
                  let left = +tile
                    .querySelector(".domino-tile__half:first-child")
                    .classList[1].split("-")[2];
                  let right = +tile
                    .querySelector(".domino-tile__half:last-child")
                    .classList[1].split("-")[2];
                  if (left == doubleTile.left || right == doubleTile.left) {
                    tile.classList.remove("disabled");
                    tile.classList.add("highlight");
                    let existingTileClickArea = tile.querySelector(
                      ".domino-game__tile-click-area"
                    );
                    if (existingTileClickArea) {
                      existingTileClickArea.remove();
                    }
                    let tileClickArea = document.createElement("div");
                    tileClickArea.classList.add("domino-game__tile-click-area");
                    tile.appendChild(tileClickArea);
                    tileClickArea.addEventListener(
                      "click",
                      addTileEventListeners(tile)
                    );
                  }
                });
              }
            });

            // highlight all tiles with left and right dots
            leftTiles.forEach((tile) => {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            });

            rightTiles.forEach((tile) => {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            });
          }
        } else {
          // when there are verticals, check all 4 corners
          const { top, bottom } = findVerticalCorners(scene);
          let leftTile = null;
          let rightTile = null;
          let newScene = scene[Math.floor(scene.length / 2)];
          for (let i = 0; i < newScene.length; i++) {
            if ((newScene[i]?.left || newScene[i]?.right) && !leftTile) {
              leftTile = newScene[i];
            }
          }
          for (let i = newScene.length - 1; i >= 0; i--) {
            if ((newScene[i]?.left || newScene[i]?.right) && !rightTile) {
              rightTile = newScene[i];
            }
          }
          const leftDots = leftTile.left;
          const rightDots = rightTile.right;
          // find tiles with left and right dots, with top and bottom dots in user tiles
          userTiles.forEach((tile) => {
            let left = +tile
              .querySelector(".domino-tile__half:first-child")
              .classList[1].split("-")[2];
            let right = +tile
              .querySelector(".domino-tile__half:last-child")
              .classList[1].split("-")[2];
            if (left == leftDots || right == leftDots) {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            }
            if (left == top.left || right == top.left) {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            }
            if (right == rightDots || left == rightDots) {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            }
            if (right == bottom.right || left == bottom.right) {
              tile.classList.remove("disabled");
              tile.classList.add("highlight");
              let existingTileClickArea = tile.querySelector(
                ".domino-game__tile-click-area"
              );
              if (existingTileClickArea) {
                existingTileClickArea.remove();
              }
              let tileClickArea = document.createElement("div");
              tileClickArea.classList.add("domino-game__tile-click-area");
              tile.appendChild(tileClickArea);
              tileClickArea.addEventListener(
                "click",
                addTileEventListeners(tile)
              );
            }
          });
        }
      }
    }
  }
};

// function addTilesEventListeners(tilesArr){
//   tilesArr.forEach(tile=>{
//     addTileEventListeners(tile)
//   })
// }

function addTileEventListeners(tile) {
  let roomId = window.dominoRoomId;
  let tableId = window.tableId;
  let playerMode = window.playerMode;
  let gameMode = window.gameMode;

  if (!roomId || !tableId || !playerMode || !gameMode) {
    return;
  }

  return function () {
    if (tile.classList.contains("sister-highlight")) {
      let scene = localStorage.getItem("dominoGameScene");
      if (scene) {
        scene = JSON.parse(scene);
        let gameTiles = document.querySelectorAll(".domino-game-table__tile");
        gameTiles.forEach((gameTile) => {
          gameTile.classList.add("disabled");
          gameTile.classList.remove("finger-right", "finger-left", "highlight");
        });

        tilesState(window.currentTurn, scene);
      }

      return;
    }
    // if (tile.classList.contains("disabled")) {
    //   return;
    // }

    let user = JSON.parse(localStorage.getItem("user"));
    if (window.currentTurn) {
      if (user.userId != window.currentTurn) {
        return;
      }
    }

    let tiles = document.querySelectorAll(".domino-game__tile");
    tiles.forEach((tile) => {
      tile.classList.add("disabled");
      tile.classList.remove("highlight");

      let tileClickArea = tile.querySelector(".domino-game__tile-click-area");
      if (tileClickArea) {
        tileClickArea.remove();
      }
    });

    const left = +tile
      .querySelector(".domino-tile__half:first-child")
      .classList[1].split("-")[2];
    const right = +tile
      .querySelector(".domino-tile__half:last-child")
      .classList[1].split("-")[2];
    const id = +tile.getAttribute("tileid");

    const tableBlock = document.querySelector(".domino-game-table__table");
    const tableTiles = tableBlock.querySelectorAll(".domino-game-table__tile");
    if (gameMode == "CLASSIC") {
      if (tableTiles && tableTiles.length > 1) {
        const leftTile = tableTiles[0];

        let leftTileArea = leftTile.querySelector(
          ".scene-sister-tile-click-area"
        );
        if (leftTileArea) {
          leftTileArea.remove();
        }

        const sceneLeft = +leftTile
          .querySelector(".domino-game-table__tile-half:first-child")
          .classList[1].split("-")[3];
        const rightTile = tableTiles[tableTiles.length - 1];
        let rightTileArea = rightTile.querySelector(
          ".scene-sister-tile-click-area"
        );
        if (rightTileArea) {
          rightTileArea.remove();
        }
        const sceneRight = +rightTile
          .querySelector(".domino-game-table__tile-half:last-child")
          .classList[1].split("-")[3];

        if (
          sceneLeft == sceneRight ||
          (left == sceneLeft && right == sceneRight) ||
          (right == sceneLeft && left == sceneRight)
        ) {
          tile.classList.add("sister-highlight");

          let existingTileClickArea = tile.querySelector(
            ".domino-game__tile-click-area"
          );
          if (existingTileClickArea) {
            existingTileClickArea.remove();
          }
          let tileClickArea = document.createElement("div");
          tileClickArea.classList.add("domino-game__tile-click-area");
          tile.appendChild(tileClickArea);
          tileClickArea.addEventListener("click", addTileEventListeners(tile));

          user = JSON.parse(localStorage.getItem("user"));

          addTwoTilesEventListeners(
            { left, right, id },
            roomId,
            tableId,
            playerMode,
            gameMode,
            leftTile,
            rightTile,
            user,
            tile
          );
          return;
        }
      }
    } else if (gameMode == "TELEPHONE") {
      let scene = localStorage.getItem("dominoGameScene");

      scene = JSON.parse(scene);
      const tilesAmount = countTiles(scene);

      let middleRow = scene[Math.floor(scene.length / 2)];
      let leftTile = null;
      let rightTile = null;
      for (let i = 0; i < middleRow.length; i++) {
        if (middleRow[i]?.id >= 0 && !leftTile) {
          leftTile = middleRow[i];
        }
      }
      for (let i = middleRow.length - 1; i >= 0; i--) {
        if (middleRow[i]?.id >= 0 && !rightTile) {
          rightTile = middleRow[i];
        }
      }

      let { top, bottom } = findVerticalCorners(scene);

      const left = +tile
        .querySelector(".domino-tile__half:first-child")
        .classList[1].split("-")[2];
      const right = +tile
        .querySelector(".domino-tile__half:last-child")
        .classList[1].split("-")[2];
      const id = +tile.getAttribute("tileid");

      let corners = [];
      if (leftTile && rightTile) {
        if (top && bottom) {
          corners = [
            { value: top.left, side: "top", id: top.id },
            { value: bottom.right, side: "bottom", id: bottom.id },
            { value: leftTile.left, side: "left", id: leftTile.id },
            { value: rightTile.right, side: "right", id: rightTile.id },
          ];
        } else {
          corners = [
            { value: leftTile.left, side: "left", id: leftTile.id },
            { value: rightTile.right, side: "right", id: rightTile.id },
          ];
          // get double tiles in middle row
          let doubleTiles = [];
          middleRow.forEach((tile) => {
            if (tile?.left == tile?.right) {
              doubleTiles.push(tile);
            }
          });

          let availableDoubles = [];

          doubleTiles.forEach((tile) => {
            // check if on the right and left of double there are tiles
            const leftTile = middleRow[middleRow.indexOf(tile) - 1];
            const rightTile = middleRow[middleRow.indexOf(tile) + 1];
            if (
              leftTile &&
              rightTile &&
              leftTile?.id >= 0 &&
              rightTile?.id >= 0 &&
              tile &&
              tile.central
            ) {
              availableDoubles.push(tile);
            }
          });

          availableDoubles.forEach((doubleTile) => {
            if (doubleTile.central == true) {
              corners.push({
                value: doubleTile.left,
                side: "top",
                id: doubleTile.id,
              });
            }
          });
        }
      }

      const sisterCorners = [];

      corners.forEach((corner) => {
        if (
          corner.value == left ||
          (corner.value == right && corner !== left && corner !== right)
        ) {
          sisterCorners.push(corner);
        }
      });

      if (sisterCorners.length > 1 && tilesAmount > 1) {
        tile.classList.add("sister-highlight");

        let existingTileClickArea = tile.querySelector(
          ".domino-game__tile-click-area"
        );
        if (existingTileClickArea) {
          existingTileClickArea.remove();
        }
        let tileClickArea = document.createElement("div");
        tileClickArea.classList.add("domino-game__tile-click-area");
        tile.appendChild(tileClickArea);
        tileClickArea.addEventListener("click", addTileEventListeners(tile));

        user = JSON.parse(localStorage.getItem("user"));

        addTelephoneSisterEventListeners(
          { left, right, id },
          roomId,
          tableId,
          playerMode,
          gameMode,
          sisterCorners,
          user
        );

        return;
      }
    }

    window.ws.send(
      JSON.stringify({
        method: "playDominoTurn",
        userId: +user.userId,
        roomId: roomId,
        tableId: tableId,
        playerMode: playerMode,
        gameMode: gameMode,
        tile: { left, right, id },
      })
    );
  };
}

export const drawPlayerTiles = (playerTilesArr) => {
  const playerTiles = document.querySelector(".domino-game__tiles");
  playerTiles.innerHTML = "";
  playerTilesArr.forEach((tile) => {
    playerTiles.innerHTML += `
    <div class="domino-game__tile domino-tile disabled" tileid="${+tile.id}">
      <div class = "domino-game__tile-tile"> 
        <div class="domino-tile__half domino-dots-${tile.left}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.left)}
        </div>
        <div class="domino-tile__half domino-dots-${tile.right}">
          ${`<div class="domino-tile__dot"></div>`.repeat(tile.right)}
        </div>
      </div>
      <div class = "domino-game__tile-click-area"> 
         
      </div>
    </div>
    `;
  });
};

export const deletePlayerTiles = (deletedTileId, tilesArr) => {
  const playerTiles = document.querySelector(".domino-game__tiles");

  let tileToDelete = playerTiles.querySelector(
    `.domino-game__tile[tileid="${+deletedTileId}"]`
  );

  tileToDelete.remove();
};

export const setDominoTurn = async (currentTurn, turnTime = null) => {
  startDominoTurnTimer(currentTurn, turnTime);
};

const startDominoTurnTimer = async (currentTurn, currTurnTime = null) => {
  activeTurnTimers.forEach((timer) => {
    clearInterval(timer);
  });

  let dominoRoom = document.querySelector(".domino-game-page");
  if (dominoRoom) {
    let user = localStorage.getItem("user");
    if (user) {
      user = JSON.parse(user);
    }

    let allEnemyes = document.querySelectorAll(
      `.domino-game-table__enemy-player`
    );
    allEnemyes.forEach((enemy) => {
      enemy.classList.remove("current-turn");
    });

    let existingTimer = document.querySelector(".user-avatar__countdown");
    if (existingTimer) {
      let userBlock = document.querySelector(".domino-game-user__avatar");
      userBlock.classList.remove("current-turn");
      existingTimer.remove();
    }

    let existingEnemyTimer = document.querySelectorAll(".enemy-domino__timer");

    if (existingEnemyTimer) {
      existingEnemyTimer.forEach((existingTimer) => {
        let userBlock = document.querySelector(
          ".domino-game-table__enemy-player"
        );
        userBlock.classList.remove("current-turn");
        existingTimer.remove();
      });
    }

    if (user.userId == currentTurn) {
      let userBlock = document.querySelector(".domino-game-user__avatar");
      userBlock.classList.add("current-turn");
      let userInventaryTiles = document.querySelectorAll(".domino-game__tile");
      let userTurnTimer = document.createElement("div");
      userTurnTimer.classList.add("user-avatar__countdown");
      // let countDownDate = new Date().getTime() + 25000;
      let distance = 0;
      if (currTurnTime) {
        let countDownDate = new Date(currTurnTime).getTime() + 25000;
        let nowClientTime = await time.NowClientTime();
        distance = countDownDate - nowClientTime;
      } else {
        distance = 25000;
      }

      let existingTimer = document.querySelector(".user-avatar__countdown");

      let timer = setTimer(
        distance,
        userTurnTimer,
        existingTimer,
        userBlock,
        userInventaryTiles
      );

      if (existingTimer) {
        existingTimer.remove();
      }

      activeTurnTimers.forEach((timer) => {
        clearInterval(timer);
      });
      activeTurnTimers = [];
      activeTurnTimers.push(timer);
      userBlock.appendChild(userTurnTimer);
    } else {
      let enemyBlock = document.querySelector(
        `.domino-game-table__enemy-player[userId="${currentTurn}"]`
      );

      if (enemyBlock) {
        enemyBlock.classList.add("current-turn");
      }

      let enemyTurnTimer = document.createElement("div");
      enemyTurnTimer.classList.add("enemy-domino__timer");
      let distance = 0;
      if (currTurnTime) {
        let countDownDate = new Date(currTurnTime).getTime() + 25000;
        let nowClientTime = await time.NowClientTime();
        distance = countDownDate - nowClientTime;
      } else {
        distance = 25000;
      }

      let existingTimer = document.querySelector(".enemy-domino__timer");
      let timer = setTimer(distance, enemyTurnTimer, existingTimer, enemyBlock);

      if (existingTimer) {
        existingTimer.remove();
      }

      activeTurnTimers.forEach((timer) => {
        clearInterval(timer);
      });
      activeTurnTimers = [];
      activeTurnTimers.push(timer);
      let enemyAvatarBlock = enemyBlock.querySelector(
        ".domino-enemy-player__img"
      );
      if (enemyAvatarBlock) {
        enemyAvatarBlock.appendChild(enemyTurnTimer);
      }
    }
  }
};

function setTimer(distance, timer, existingTimer, userBlock, tiles = null) {
  let newTimer = setInterval(() => {
    distance -= 50;
    // cutting any extra minutes
    while (distance > 60000) {
      distance -= 60000;
    }
    if (distance <= 0) {
      activeTurnTimers.forEach((timer) => {
        clearInterval(timer);
      });
      // удаляем елемент таймера
      let existingTimer = document.querySelector(".user-avatar__countdown");
      if (tiles) {
        tiles.forEach((tile) => {
          tile.classList.remove("highlight");
          tile.classList.add("disabled");
          tile.classList.remove("sister-highlight");
        });
      }
      const sceneTiles = document.querySelectorAll(".domino-game-table__tile");
      sceneTiles.forEach((tile) => {
        tile.classList.remove("highlight");
      });
      if (existingTimer) {
        let userBlock = document.querySelector(".domino-game-user__avatar");
        userBlock.classList.remove("current-turn");

        console.log("time out");
        showAutoTurnWindow("auto");

        userBlock.classList.add("skipped-turn");
        setTimeout(() => {
          userBlock.classList.remove("skipped-turn");
          // const popup = document.querySelector(".popup");
          // if (popup) {
          //   impPopup.close(popup);
          // }
        }, 2000);

        if (existingTimer.classList.contains("user-avatar__countdown")) {
          let gamePage = document.querySelector(".domino-game-page");

          if (gamePage) {
            let loadingElement = document.createElement("div");
            loadingElement.innerHTML =
              '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
            loadingElement.classList.add("domino-game-loader");
            gamePage.appendChild(loadingElement);
          }
        }
        existingTimer.remove();
      }
    } else {
      const minutes = Math.floor(distance / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      timer.innerHTML = `${formattedSeconds}`;
    }
  }, 50);

  return newTimer;
}

export function showAutoTurnWindow(status = "auto") {
  const siteLanguage = window.siteLanguage;
  // place small window above user avatar
  let userBlock = document.querySelector(".domino-game-user");

  const existingAutoWindow = document.querySelector(".auto-window");
  if (existingAutoWindow) {
    existingAutoWindow.remove();
  }

  const autoWindow = document.createElement("div");
  autoWindow.classList.add("auto-window", "bg-red");
  if (status == "skipped") {
    autoWindow.innerHTML = siteLanguage.dominoGame.turnSkipped;

    // userBlock.innerHTML = autoWindow;
  } else {
    autoWindow.innerHTML = siteLanguage.dominoGame.autoTurn;
  }

  userBlock.appendChild(autoWindow);
  console.log(userBlock);

  setTimeout(() => {
    autoWindow.remove();
  }, 4500);
}

export function showSkipedTurnWindow() {
  const siteLanguage = window.siteLanguage;

  let userBlock = document.querySelector(".domino-game-user");

  const existingAutoWindow = document.querySelector(".auto-window");
  if (existingAutoWindow) {
    existingAutoWindow.remove();
  }

  const autoWindow = document.createElement("div");
  autoWindow.classList.add("auto-window", "bg-red");

  autoWindow.innerHTML = siteLanguage.dominoGame.turnSkipped;

  userBlock.appendChild(autoWindow);
  console.log(userBlock);

  setTimeout(() => {
    autoWindow.remove();
  }, 4500);
}

export function reconnectFillTable(msg) {
  let {
    scene,
    market,
    turnQueue,
    turn,
    turnTime,
    players,
    userTiles,
    roomId,
    tableId,
    playerMode,
    gameMode,
    clearScene,
    continued,
  } = msg;

  const user = JSON.parse(localStorage.getItem("user"));

  if (clearScene) {
    let tableBlock = document.querySelector(".domino-game-table__table");
    tableBlock.innerHTML = "";
  }

  updateGameScene(scene);

  let playerData = players.find((player) => player.userId == user.userId);
  playerData.score = playerData.points;

  drawPlayerTiles(userTiles);
  drawUserInfo(playerData, user);

  tilesState(turn, scene, continued);

  let marketLength = market.length;
  updateMarketNum(marketLength);

  const tableBlock = document.querySelector(".domino-game-page-table-block");
  const existingEnemyPlayers = tableBlock.querySelectorAll(
    ".domino-game-table__enemy-player"
  );

  if (existingEnemyPlayers) {
    existingEnemyPlayers.forEach((enemy) => {
      enemy.remove();
    });
  }

  const userId = +user.userId;

  const resultQueue = generateNewQueue(turnQueue, userId);
  // console.log("turnQueue:", turnQueue);
  // console.log("resultQueue:", resultQueue); // [1, 4, 5]

  const enemyPlayers = msg.players.filter((player) => player.userId != userId);
  const sortedPlayers = sortByTurnQueue(enemyPlayers, resultQueue);
  // 1 2 3
  // 2 1 3

  //swap first 2 elements in sortedPlayers
  if (sortedPlayers.length > 1) {
    const temp = sortedPlayers[0];
    sortedPlayers[0] = sortedPlayers[1];
    sortedPlayers[1] = temp;
  }

  let emenyPlayerNum = 1;
  sortedPlayers.forEach((player, i) => {
    if (!(player.userId == user.userId)) {
      tableBlock.innerHTML += `
      <div
        class="domino-game-table__enemy-player domino-enemy-player domino-enemy-player-${emenyPlayerNum}"
        userId="${+player.userId}"
        username="${player.username}"
      >
        <div class="domino-enemy-player__img">
          <img src="${
            player.avatar
              ? `http${API_URL_PART}${
                  IS_HOSTED_STATIC ? "/static/avatars" : "/"
                }/${player.avatar}`
              : "img/profile.png"
          }" alt="" /><span>${JSON.parse(player.tiles).length}</span>
        </div>
        <div class="domino-enemy-player__info">
          <h2 class="domino-enemy-player__name">${player.username}</h2>
          <span class="domino-enemy-player__score" style="font-weight: 500; font-size: 20px;">${
            player.score
          }</span><span class="domino-enemy-player__score style1" style="font-weight: 300; font-size: 15px; color: white;">/165</span>
        </div>
      </div>
      `;

      emenyPlayerNum++;
    }
  });

  const enemyScores = tableBlock.querySelectorAll(
    ".domino-enemy-player__score"
  );
  const userScore = document.querySelector(".domino-game-user__score");

  let seeTiles = false;
  if (
    (user.seeDominoClassic == true && gameMode == "CLASSIC") ||
    (user.seeDominoTelephone == true && gameMode == "TELEPHONE")
  ) {
    seeTiles = true;
  }

  if (seeTiles) {
    const enemyPlayers = tableBlock.querySelectorAll(".domino-enemy-player");

    enemyPlayers.forEach((enemy) => {
      enemy.addEventListener("click", (e) => {
        const enemyPlayer = e.currentTarget;
        const enemyPlayerId = +enemyPlayer.getAttribute("userId");
        const enemyPlayerName = enemyPlayer.getAttribute("username");
        const playersTiles = JSON.parse(window.playersTiles);
        const enemyPlayerTiles = playersTiles.find(
          (player) => player.userId == enemyPlayerId
        ).tiles;
        const enemyPlayerTilesArr = enemyPlayerTiles.map((tile) => {
          return { left: tile.left, right: tile.right };
        });

        impPopup.showEnemyTiles(
          enemyPlayerName,
          enemyPlayerTilesArr,
          enemyPlayerId
        );
      });
    });
  }

  if (gameMode.toUpperCase() == "CLASSIC") {
    enemyScores.forEach((enemyScore) => {
      enemyScore.remove();
    });
    if (userScore) {
      userScore.remove();
    }
  }

  setDominoTurn(turn, turnTime, players);

  // check if user has to take tiles from market
  window.ws.send(
    JSON.stringify({
      method: "checkMarket",
      roomId,
      tableId,
      playerMode,
      gameMode,
    })
  );
}

export function dropTableInfo() {
  // clear scene
  let tableBlock = document.querySelector(".domino-game-table__table");

  if (tableBlock) {
    tableBlock.innerHTML = "";
    tableBlock.style = "";
    // tableBlock.style.transform = `scale(1)`;
    // tableBlock.style.top = "0";
    // tableBlock.style.left = "0";
    // tableBlock.style.translate = `unset`;
  }
  localStorage.setItem("dominoGameScene", JSON.stringify([]));

  // clear user tiles
  let userTiles = document.querySelector(".domino-game__tiles");
  if (userTiles) {
    userTiles.innerHTML = "";
  }
  localStorage.setItem("userTiles", JSON.stringify([]));

  // clear market
  updateMarketNum(0);

  // remove all timers block

  // enemy-domino__tiler
  // user-avatar__countdown

  let myTimers = document.querySelectorAll(".user-avatar__countdown");
  myTimers.forEach((myTimer) => {
    if (myTimer) {
      myTimer.remove();
    }
  });

  let enemyTimers = document.querySelectorAll(".enemy-domino__timer");

  enemyTimers.forEach((timer) => {
    if (timer) {
      timer.remove();
    }
  });

  // clear turn
  window.currentTurn = null;
}

export const showSkippedEnemyTurn = (userId, status = "auto") => {
  let enemyBlock = document.querySelector(
    `.domino-game-table__enemy-player[userId="${userId}"]`
  );
  showEnemyAutoTurnWindow(enemyBlock, status);
  if (enemyBlock) {
    enemyBlock.classList.add("skipped-turn");

    setTimeout(() => {
      enemyBlock.classList.remove("skipped-turn");
    }, 2000);
  }
};

export function showEnemyAutoTurnWindow(enemyBlock, status) {
  const siteLanguage = window.siteLanguage;
  const existingAutoWindow = document.querySelector(".auto-window-enemy");
  if (existingAutoWindow) {
    existingAutoWindow.remove();
  }

  const autoWindow = document.createElement("div");
  autoWindow.classList.add("auto-window-enemy", "bg-red");
  if (status == "skipped") {
    autoWindow.innerHTML = siteLanguage.dominoGame.turnSkipped;
  } else {
    autoWindow.innerHTML = siteLanguage.dominoGame.autoTurn;
  }

  if (enemyBlock) {
    enemyBlock.appendChild(autoWindow);
  }

  setTimeout(() => {
    autoWindow.remove();
  }, 2000);
}

export function tablePlacement() {
  const table = document.querySelector(".domino-game-table__table");
  if (!table) {
    return;
  }
  const tableWidth = table.offsetWidth;
  const tableHeight = table.offsetHeight;

  const tileBlocks = document.querySelectorAll(
    ".domino-game-table__table-tiles-block"
  );
  if (!tileBlocks) {
    return;
  }

  const blockSizes = [];

  tileBlocks.forEach((block) => {
    blockSizes.push({
      id: +block.getAttribute("id"),
      width: block.offsetWidth,
      height: block.offsetHeight,
    });
  });

  const blockCoordinates = [
    {
      id: 1,
      x:
        tableWidth / 2 -
        blockSizes.find((block) => block.id == 3).width / 2 +
        blockSizes.find((block) => block.id == 3).height / 2 +
        10,
      y:
        tableHeight / 2 +
        blockSizes.find((block) => block.id == 2).width -
        blockSizes.find((block) => block.id == 3).height / 2,
    },
    {
      id: 2,
      x:
        tableWidth / 2 -
        blockSizes.find((block) => block.id == 3).width / 2 -
        blockSizes.find((block) => block.id == 2).width / 2 +
        blockSizes.find((block) => block.id == 3).height / 2 -
        10,
      y:
        tableHeight / 2 +
        blockSizes.find((block) => block.id == 2).width / 2 -
        10,
    },
    {
      id: 3,
      x: tableWidth / 2 - blockSizes.find((block) => block.id == 3).width / 2,
      y: tableHeight / 2 - blockSizes.find((block) => block.id == 3).height / 2,
    },
    {
      id: 4,
      x:
        tableWidth / 2 +
        blockSizes.find((block) => block.id == 3).width / 2 -
        blockSizes.find((block) => block.id == 4).width / 2 -
        blockSizes.find((block) => block.id == 3).height / 2 +
        10,
      y:
        tableHeight / 2 -
        blockSizes.find((block) => block.id == 4).width / 2 -
        blockSizes.find((block) => block.id == 3).height +
        10,
    },
    {
      id: 5,
      x: 0,
      y:
        tableHeight / 2 -
        blockSizes.find((block) => block.id == 4).width -
        blockSizes.find((block) => block.id == 3).height / 2,
    },
    {
      id: 6,
      x: 0,
      y: 0,
    },
    {
      id: 7,
      x: 100,
      y: 100,
    },
  ];

  const block2FirstTile = document.querySelector(
    ".domino-game-table__table-tiles-block[id='2'] .domino-game-table__tile:first-child"
  );
  if (block2FirstTile) {
    if (block2FirstTile.classList.contains("rotated")) {
      blockCoordinates.find((block) => block.id == 1).x += 20;
    }
  }

  const block3FirstTile = document.querySelector(
    ".domino-game-table__table-tiles-block[id='3'] .domino-game-table__tile:first-child"
  );
  if (block3FirstTile) {
    if (block3FirstTile.classList.contains("rotated")) {
      blockCoordinates.find((block) => block.id == 2).y += 20;
      blockCoordinates.find((block) => block.id == 1).y += 20;
    }
  }

  const block3LastTile = document.querySelector(
    ".domino-game-table__table-tiles-block[id='3'] .domino-game-table__tile:last-child"
  );

  if (block3LastTile) {
    if (block3LastTile.classList.contains("rotated")) {
      blockCoordinates.find((block) => block.id == 4).y -= 20;
      blockCoordinates.find((block) => block.id == 5).y -= 20;
    }
  }

  const block4LastTile = document.querySelector(
    ".domino-game-table__table-tiles-block[id='4'] .domino-game-table__tile:last-child"
  );

  blockCoordinates.find((block) => block.id == 5).x =
    blockCoordinates.find((block) => block.id == 3).x +
    blockSizes.find((block) => block.id == 3).width -
    blockSizes.find((block) => block.id == 4).height -
    blockSizes.find((block) => block.id == 5).width +
    15;

  // расчитываем координаты блоков
  if (block4LastTile) {
    if (block4LastTile.classList.contains("rotated")) {
      blockCoordinates.find((block) => block.id == 5).x -= 20;
    }
  }

  tileBlocks.forEach((block) => {
    block.style.top =
      blockCoordinates.find(
        (blockCord) => blockCord.id == +block.getAttribute("id")
      )?.y + "px";
    block.style.left =
      blockCoordinates.find(
        (blockCord) => blockCord.id == +block.getAttribute("id")
      )?.x + "px";
  });

  // window.removeEventListener("resize", tablePlacement);
  // window.addEventListener("resize", tablePlacement);
}

export function scaleDominoTable(scene) {
  let sceneLength = scene.length;
  let tableBlock = document.querySelector(".domino-game-table__table");
  let defaultScale = 1;

  if (!tableBlock) {
    return;
  }
  const screenWidth = window.screen.width;

  if (screenWidth >= 580) {
    let minScale = 0.6;

    let scaleForOneTile = defaultScale - minScale;

    scaleForOneTile = scaleForOneTile / 28;

    let currScale = defaultScale - scaleForOneTile * sceneLength;
    tableBlock.style.transform = `scale(${currScale}) translateY(5%)`;
  }
}

export function showEmoji(msg) {
  const { emojiId, userId } = msg;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user.userId == userId) {
    // const userBlock = document.querySelector(".domino-game-user");
    const infoBlock = document.querySelector(".domino-game__information");
    const emoji = document.createElement("div");
    emoji.classList.add("domino-game-user__emoji");
    emoji.innerHTML = `<img src="img/emojis/${emojiId}.png" width="64px" />`;
    infoBlock.appendChild(emoji);
    setTimeout(() => {
      emoji.remove();
    }, 3000);
  } else {
    const enemyBlock = document.querySelector(
      `.domino-game-table__enemy-player[userId="${userId}"]`
    );

    const emoji = document.createElement("div");
    emoji.classList.add("domino-enemy-player__emoji");
    emoji.innerHTML = `<img src="img/emojis/${emojiId}.png" width="64px" />`;
    enemyBlock.appendChild(emoji);
    setTimeout(() => {
      emoji.remove();
    }, 3000);
  }
}

export function showPhrase(msg) {
  const siteLanguage = window.siteLanguage;
  const { phraseId, userId } = msg;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user.userId == userId) {
    // remove previous phrase
    const existingPhrase = document.querySelector(".domino-game-user__phrase");
    if (existingPhrase) {
      existingPhrase.remove();
    }

    const infoBlock = document.querySelector(".domino-game__information");
    const phrase = document.createElement("div");
    phrase.classList.add("domino-game-user__phrase");
    phrase.innerHTML = siteLanguage.dominoPhrases[`phrase${phraseId}`];
    infoBlock.appendChild(phrase);
    setTimeout(() => {
      phrase.remove();
    }, 3000);
  } else {
    const enemyBlock = document.querySelector(
      `.domino-game-table__enemy-player[userId="${userId}"]`
    );

    const phrase = document.createElement("div");
    phrase.classList.add("domino-enemy-player__phrase");
    phrase.innerHTML = siteLanguage.dominoPhrases[`phrase${phraseId}`];
    enemyBlock.appendChild(phrase);
    setTimeout(() => {
      phrase.remove();
    }, 4000);
  }
}

export const updatePlayerScore = (userId, score, addedScore) => {
  const siteLanguage = window.siteLanguage;
  const user = JSON.parse(localStorage.getItem("user"));

  if (score == 0 || addedScore == 0) {
    return;
  }

  impAudio.playTelephonePoints();

  if (user.userId == userId) {
    const userScore = document.querySelector(".domino-game-user__score span");
    if (userScore) {
      userScore.innerHTML = score;
    }

    // make number in the center of the screen
    let table = document.querySelector(".domino-game-table");
    if (table) {
      const scoreNumber = document.createElement("div");
      scoreNumber.classList.add("score-number");
      scoreNumber.innerHTML = `+ ${addedScore} ${siteLanguage.popups.points}`;
      table.appendChild(scoreNumber);
      setTimeout(() => {
        scoreNumber.remove();
      }, 2000); //Xal yazanda xalin gosterilmesi Kamal
    }
  } else {
    // domino-game-table__enemy-player domino-enemy-player domino-enemy-player-3

    const enemyScore = document.querySelector(
      `.domino-game-table__enemy-player[userId="${+userId}"] span.domino-enemy-player__score`
    );
    if (enemyScore) {
      enemyScore.innerHTML = `${score}`;
      //enemyScore.innerHTML = `${score}/165`; //Kamal
    }
    const enemyBlock = document.querySelector(
      `.domino-game-table__enemy-player[userId="${+userId}"]`
    );
    if (enemyBlock) {
      const scoreNumber = document.createElement("div");
      scoreNumber.classList.add("enemy-score-number");
      scoreNumber.innerHTML = `+ ${addedScore} ${siteLanguage.popups.points}`;
      enemyBlock.appendChild(scoreNumber);
      setTimeout(() => {
        scoreNumber.remove();
      }, 2000); //Xal yazanda xalin gosterilmesi Kamal
    }
  }
};
