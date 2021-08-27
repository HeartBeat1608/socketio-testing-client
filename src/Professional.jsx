import React, { useEffect, useState, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { SOCK_EVENTS } from "./events.js";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import ChatMessages from "./components/ChatMessages";

import "./App.css";

const Professional = () => {
  const socketInstance = useRef(null);
  const config = useMemo(
    () => ({
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnection: true,
      upgrade: true,
      forceNew: true,
      path: "/socket.io",
      timeout: 2000,
    }),
    []
  );

  const userid = "me";

  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RpZmljYXRpb25fcHJlZmVyZW5jZXMiOnsiZW1haWwiOmZhbHNlLCJzbXMiOmZhbHNlLCJhbGFybSI6ZmFsc2UsImNhbGwiOmZhbHNlLCJhbGV4YSI6ZmFsc2V9LCJ2ZXJpZmllZCI6dHJ1ZSwibGFzdF9hY3RpdmUiOiJBdWd1c3QgMjIsIDIwMjEgYXQgMToxNzo0NyBQTSBHTVQrNTozMCIsImFjdGl2ZV9zb2NrZXQiOiJBaHBsZEJuV2JJTE5ueHNCQUFBQSIsIm9ubGluZSI6dHJ1ZSwiaXNfcHJvZmVzc2lvbmFsIjp0cnVlLCJhdmF0YXIiOiIiLCJtZW1iZXJzIjpbXSwiX2lkIjoiNjEyMjAxNGQ0YWQ5MzMyMzYwZThmNmJjIiwicGhvbmVfbnVtYmVyIjoiOTM1NDUzNTczNCIsIm5hbWUiOiJEb29mIiwicHJvZmVzc2lvbmFsX2luZm8iOiI2MTIyMDE4MjRhZDkzMzIzNjBlOGY2YzMiLCJpYXQiOjE2MzAwMzc4MjksImV4cCI6MTYzMjYyOTgyOX0.OZe041nL1zcoFj9bi3vhWgr12Bg3QYnpyT7Y2n1xybg"
  );
  const [chatRequests, setChatRequests] = useState([]);
  const [showChatRequest, setShowChatRequest] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [connData, setConnData] = useState({
    connected: false,
    busy: false,
    socketid: "",
    connected_peer: "None",
  });

  useEffect(() => {
    socketInstance.current = io("http://localhost:5000", {
      ...config,
      extraHeaders: { token },
    });

    attachEvents();

    return () => {
      socketInstance.current.disconnect();
    };
  }, [token, config]);

  useEffect(() => {
    if (!showChatRequest && chatRequests.length > 0 && !connData.busy) {
      setShowChatRequest(chatRequests.shift());
      setChatRequests((cr) => cr.slice(1));
    }
  }, [showChatRequest, chatRequests]);

  const attachEvents = () => {
    if (!(socketInstance && socketInstance.current)) return null;

    socketInstance.current.on("connect", () => {
      setConnData((c) => ({
        ...c,
        connected: true,
        socketid: socketInstance.current.id,
      }));
    });

    socketInstance.current.on("error", (err) => {
      console.error(err);
    });

    socketInstance.current.on("disconnect", (err) => {
      setConnData((c) => ({ ...c, connected: false }));
      console.error(err);
    });

    socketInstance.current.on(SOCK_EVENTS.request_chat, (user_info) => {
      setChatRequests((r) => [...r, user_info]);
    });

    socketInstance.current.on(SOCK_EVENTS.message, (data) =>
      setChatHistory((h) => [...h, data])
    );
  };

  const connectSocket = () => {
    try {
      socketInstance.current.connect();
    } catch (err) {
      console.error(err);
    }
  };

  const socketEmit = (event, ...data) => {
    try {
      socketInstance.current.emit(event, ...data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Container>
        <Row>
          <Col>
            <h3>Professional Emulator</h3>
          </Col>
          <Col>
            {connData.connected ? (
              <div
                style={{
                  float: "right",
                  color: "greenyellow",
                }}
              >
                Connected
              </div>
            ) : (
              <div
                style={{
                  float: "right",
                  color: "orangered",
                }}
              >
                Disconnected
              </div>
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <textarea
              name="token"
              // cols="30"
              style={{
                width: "100%",
                outline: "none",
                borderRadius: 4,
                padding: 6,
              }}
              placeholder={"place your JWT token here"}
              rows={4}
              onChange={(e) => setToken(e.target.value.trim())}
              value={token}
            ></textarea>
          </Col>
        </Row>
        <Row>
          <Col>
            <center>
              <Button
                size="sm"
                type="submit"
                block
                onClick={connectSocket}
                disabled={!token.trim().length || connData.connected}
              >
                Connect Socket
              </Button>
            </center>
          </Col>
        </Row>
        <Row>
          <Col>
            <div style={{ padding: 16, margin: "1rem 0" }}>
              <center>
                Talking to <b>{connData.connected_peer}</b>
              </center>
              <ChatMessages chats={chatHistory} userid={userid} />
              <input
                type="text"
                style={{ width: "90%" }}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button
                size="sm"
                type="submit"
                style={{ width: "auto", height: "auto", marginLeft: 8 }}
                onClick={() =>
                  socketEmit(SOCK_EVENTS.message, {
                    sender: connData.socketid,
                    message: newMessage,
                  })
                }
                disabled={!connData.connected}
              >
                Send
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={!!showChatRequest} backdrop="static" centered size="lg">
        <Modal.Header>
          <Modal.Title>Somone Requesting Chat</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <Col>Username</Col>
            <Col>{showChatRequest ? showChatRequest.username : "null"}</Col>
          </Row>
          <Row>
            <Col>Socket ID</Col>
            <Col>{showChatRequest ? showChatRequest.socket_id : "null"}</Col>
          </Row>
          <Row>
            <Col>Room ID</Col>
            <Col>{showChatRequest ? showChatRequest.room_id : "null"}</Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            size="sm"
            type="submit"
            variant="danger"
            onClick={() => {
              socketEmit(SOCK_EVENTS.respond_chat_na, null);
              setShowChatRequest(null);
            }}
          >
            I'm Busy
          </Button>
          <Button
            size="sm"
            type="submit"
            variant="success"
            onClick={() => {
              socketEmit(SOCK_EVENTS.respond_chat_ok, {
                socket_id: connData.socketid,
                remote_socket_id: showChatRequest.socket_id,
                room_id: showChatRequest.room_id,
              });
              setConnData((p) => ({ ...p, busy: true }));
              setShowChatRequest(null);
            }}
          >
            I'm Available
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Professional;
