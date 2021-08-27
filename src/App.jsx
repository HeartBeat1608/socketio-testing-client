import "./App.css";
import Connection from "./components/connection.jsx";
import Listen from "./components/listen.jsx";
import Emitter from "./components/emitter.jsx";
import Ack from "./components/ack.jsx";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Container, Row, Col, Modal, Tabs, Tab } from "react-bootstrap";
import { MdCloudDone, MdCloudOff } from "react-icons/md";
import { SOCK_EVENTS } from "./events.js";

function App() {
  const [socket, setSocket] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const isReadyRef = useRef();
  isReadyRef.current = isReady;

  const [connData, setConnData] = useState({
    connected: false,
    loading: false,
    socketId: "",
    server: "http://localhost:5000",
    config:
      '{"path": "/socket.io", "forceNew": true, "reconnectionAttempts": 3, "timeout": 2000, "extraHeaders": {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub3RpZmljYXRpb25fcHJlZmVyZW5jZXMiOnsiZW1haWwiOmZhbHNlLCJzbXMiOmZhbHNlLCJhbGFybSI6ZmFsc2UsImNhbGwiOmZhbHNlLCJhbGV4YSI6ZmFsc2V9LCJ2ZXJpZmllZCI6ZmFsc2UsImxhc3RfYWN0aXZlIjoiQXVndXN0IDI3LCAyMDIxIGF0IDEwOjM4OjE3IEFNIEdNVCs1OjMwIiwiYWN0aXZlX3NvY2tldCI6IjJjSVBhd1paQ205NFd4TXNBQUFBIiwib25saW5lIjp0cnVlLCJpc19wcm9mZXNzaW9uYWwiOmZhbHNlLCJhdmF0YXIiOiIiLCJtZW1iZXJzIjpbXSwiX2lkIjoiNjEyNGRjZDlhOTZmMDEzYTA0MjZkMDNkIiwiZW1haWwiOiJ0ZXN0bWFpbDJAeW9wbWFpbC5jb20iLCJwaG9uZV9udW1iZXIiOiIxMjMtNDU2Ny0zNDIiLCJuYW1lIjoidGVzdG1haWx1c2VyIiwiaWF0IjoxNjMwMDQwODk3LCJleHAiOjE2MzI2MzI4OTd9.Km-nBAhRlITeU5AKnK3WVKSIRrj0DnU7ZzEC2xeHncQ"}}',
    errors: [],
  });
  const [eventsToListenFor] = useState([
    SOCK_EVENTS.message,
    SOCK_EVENTS.respond_chat_page,
    SOCK_EVENTS.respond_professional_available,
    SOCK_EVENTS.respond_professional_select,
    SOCK_EVENTS.std_chat_state,
    SOCK_EVENTS.std_error,
  ]);

  const [listenTo, setListenTo] = useState([]);
  const [emitTo, setEmitTo] = useState([
    SOCK_EVENTS.request_chat,
    SOCK_EVENTS.request_chat_page,
    SOCK_EVENTS.request_professional_available,
    SOCK_EVENTS.request_professional_select,
    SOCK_EVENTS.message,
  ]);

  // Storage
  const [emitHistory, setEmitHistory] = useState([]);
  const [listenHistory, setListenHistory] = useState([]);
  const [ackHistory, setAckHistory] = useState([]);

  const createConnection = (url, config) => {
    try {
      setConnData(() => {
        return {
          connected: false,
          loading: true,
          socketId: "connecting..",
          server: url,
          config: config,
          errors: [],
        };
      });
      setSocket(() =>
        io(url, {
          ...JSON.parse(config),
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (socket === null) {
      return;
    }
    socket.on("connect", () => {
      if (isReadyRef.current === true) {
        return;
      }

      setConnData(() => {
        return {
          connected: true,
          loading: false,
          server: connData.url,
          socketId: socket.id,
          config: connData.config,
          errors: [],
        };
      });
      addListener(eventsToListenFor);
      setIsReady(() => true);
    });
  }, [connData, socket]);

  useEffect(() => {}, [listenTo]);

  function addListener(channels) {
    try {
      channels.forEach((channel) => {
        const channelsToAdd = [];
        if (!listenTo.includes(channel)) {
          channelsToAdd.push(channel);

          socket.on(channel, (response) => {
            // console.log("data received", channel, response);
            const d = new Date();
            const data = {
              key: d.toLocaleString(),
              date: d,
              channel: channel,
              data:
                typeof response === "string"
                  ? response
                  : JSON.stringify(response, null, 2),
              dataType: typeof response === "string" ? "string" : "json",
            };
            setListenHistory((i) => [data, ...i]);
          });
        }
        setListenTo((items) => [...channelsToAdd, ...items]);
      });
    } catch (err) {
      console.error(err);
    }
  }

  const addEmitTo = (channel) => {
    setEmitTo((items) => [channel, ...items]);
  };

  const emitData = (emitChannel, dataToEmit) => {
    try {
      socket.emit(emitChannel, dataToEmit, (ack) => {
        const date = new Date();
        const store = {
          key: date.toUTCString(),
          channel: emitChannel,
          date: date,
          data: ack,
          type: typeof ack === "string" ? "string" : "json",
        };
        setAckHistory((items) => [store, ...items]);
      });
      const date = new Date();
      const store = {
        key: date.toUTCString(),
        channel: emitChannel,
        date: date,
        data: dataToEmit,
        type: typeof dataToEmit === "string" ? "string" : "json",
      };
      setEmitHistory((items) => [store, ...items]);
    } catch (err) {
      console.error(err);
    }
  };

  // const histryStackChannelsFilter = (item, channels) => {
  //   return !channels.includes(item.channel);
  // }

  function clearHistory(stack, channels) {
    switch (stack) {
      case "emit":
        setEmitHistory(() => []);
        break;
      case "listen":
        setListenHistory((items) =>
          items.filter((i) => !channels.includes(i.channel))
        );
        break;
      case "ack":
        setAckHistory(() => []);
        break;
      default:
        break;
    }
  }

  // useEffect(() => {
  //   function setHash() {
  //     const hashObj = {
  //       server: connData.server,
  //       listen: listenTo,
  //       emit: emitTo,
  //       config: connData.config,
  //     };
  //     window.location.hash = window.btoa(JSON.stringify(hashObj));
  //   }

  //   function getHash() {
  //     return window.location.hash === ""
  //       ? false

  //       : JSON.parse(window.atob(window.location.hash.split("#")[1]));
  //   }

  //   if (connData.connected) {
  //     setHash();
  //   } else {
  //     const d = getHash();

  //     if (d !== false && appConfig === 0) {
  //       // Has hash value on load
  //       setAppConfig(() => 1);
  //       if (d.listen.length > 0) {
  //         setEventsToListenFor(() => d.listen);
  //       }
  //       setEmitTo(() => d.emit);
  //       setConnData(() => {
  //         return {
  //           connected: false,
  //           loading: false,
  //           server: d.server,
  //           config: d.config,
  //           errors: [],
  //         };
  //       });
  //     }
  //   }
  // }, [
  //   connData.connected,
  //   connData.server,
  //   connData.config,
  //   listenTo,
  //   emitTo,
  //   appConfig,
  // ]);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col className="text-right">
            <span className="small">
              ID: <b>{connData.socketId}</b> Server: <b>{connData.server}</b>
            </span>
            {connData.connected ? (
              <MdCloudDone className="text-success ml-3 h3" />
            ) : (
              <MdCloudOff className="text-danger mx-2 h3" />
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            <Tabs defaultActiveKey="emit" className="mb-4 nav-fillx">
              <Tab eventKey="emit" title="Emit">
                <Emitter
                  emitToChannels={emitTo}
                  addEmitTo={addEmitTo}
                  emitData={emitData}
                  emitHistory={emitHistory}
                  clearHistory={clearHistory}
                  stack="emit"
                />
              </Tab>

              <Tab eventKey="listen" title="Listen">
                <Listen
                  listeners={listenTo}
                  addListener={addListener}
                  listenHistory={listenHistory}
                  clearHistory={clearHistory}
                  stack="listen"
                />
              </Tab>

              <Tab eventKey="ack" title="Ack">
                <Ack
                  ackHistory={ackHistory}
                  stack="ack"
                  clearHistory={clearHistory}
                />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>

      <Modal show={!connData.connected} backdrop="static" centered size="lg">
        <Modal.Header>
          <Modal.Title>Configure connection</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Connection
            eventsToListenFor={eventsToListenFor}
            emitTo={emitTo}
            connData={connData}
            createConnection={createConnection}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
