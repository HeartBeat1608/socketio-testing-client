import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const leftMessageStyles = {
  background: "#ffffff",
  color: "#272b30",
  padding: "0.5rem",
  borderRadius: "0 8px 8px 8px",
};
const rightMessageStyles = {
  background: "#30363d",
  color: "white",
  padding: "0.5rem",
  borderRadius: "8px 8px 0 8px",
};

const TextMessage = ({ message, sender, userid }) => {
  return (
    <div
      style={{
        marginLeft: sender === userid ? "auto" : "0",
        ...(sender === userid ? rightMessageStyles : leftMessageStyles),
      }}
    >
      <small style={{ fontWeight: 700 }}>{sender.toUpperCase()}</small>
      <div>{message}</div>
    </div>
  );
};

const ChatMessagesDefaults = { chats: [], userid: "" };
const ChatMessages = ({ chats, userid } = ChatMessagesDefaults) => {
  return (
    <Container>
      <Row>
        <Col
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "2rem 1rem",
            height: "60vh",
          }}
        >
          {chats.length > 0 ? (
            chats.map((c, idx) => (
              <TextMessage key={idx} {...c} userid={userid} />
            ))
          ) : (
            <div style={{ margin: "0 auto" }}>
              Your messages will appear here as they are transceived
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatMessages;
