export async function connectGenralRoom() {
  const socket = new WebSocket(`ws://localhost:5001/`);
  socket.onopen = async () => {
    console.log("Подключение установлено");
    socket.send(
      JSON.stringify({
        id: 1,
        username: `${await window.username}`,
        method: "connection",
      })
    );
  };
  socket.onmessage = (event) => {
    let msg = JSON.parse(event.data);
    switch (msg.method) {
      case "connection":
        console.log(`Новое подключение к общему сокету`, msg);
        break;
      case "draw":
        // drawHandler(msg);
        break;
    }
  };
}
