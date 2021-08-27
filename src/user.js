import { io } from "socket.io-client";
import { SOCK_EVENTS } from "./events";

const token = "";
const config = {
  reconnectionAttempts: 3,
  reconnection: true,
  upgrade: true,
  forceNew: true,
  path: "/socket.io",
  timeout: 2000,
};

const URL = "http://localhost:5000";

const socket = io(URL, {
  ...config,
  extraHeaders: { token },
});

socket.on("connect", () => {
  console.log("Socket Connected [{1}]".replace("{1}", socket.id));
});

socket.on("disconnect", () => {
  console.log("Socket Disconnected [{1}]".replace("{1}", socket.id));
});

const TOPIC_ID = "6121f5b365c7493ed8440e7c";

socket.emit(SOCK_EVENTS.request_professional_available, { topic_id: TOPIC_ID });
socket.on(SOCK_EVENTS.respond_professional_available, (profs) => {
  console.log(profs);
  if (profs.length > 0) {
    const p = profs[0];
    socket.emit(SOCK_EVENTS.request_professional_select, {
      prof_id: p.professional_info.user,
      topic_id: TOPIC_ID,
    });
  }
});

socket.on(SOCK_EVENTS.respond_professional_select, (data) => {
  console.log(data);
});
