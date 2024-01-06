import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input } from "antd";
import Pubnub from "pubnub";
import "./style.css";

const myID = `${Date.now()}`;

const pubnub = new Pubnub({
  publishKey: "pub-c-35cbfd57-5495-4d39-bd41-9170700a32c1",
  subscribeKey: "sub-c-3ccb4966-6288-493a-9cca-d438cda20c07",
  secretKey: "sec-c-MGM2NjkyZjMtMjVhYy00NGQ4LTkwODQtMDRjN2E4Y2M1MjQ2",
  userId: myID,
});

const ChatPage: React.FC = () => {
  const { roomCode } = useParams();

  const [typedMessage, setTypedMessage] = useState<string>("");
  const [messages, setMessages] = useState<Pubnub.MessageEvent[]>([]);

  const messageContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomCode) {
      console.log(`Subscribe to ${roomCode}`);
      pubnub.subscribe({
        channels: [roomCode],
      });

      return () => {
        console.log(`Unsubscribe from ${roomCode}`);
        pubnub.unsubscribe({
          channels: [roomCode],
        });
      };
    }
  }, [roomCode]);

  useEffect(() => {
    if (messages && messageContainer.current) {
      messageContainer.current.scrollTop =
        messageContainer.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (roomCode) {
      const listner = {
        message: (messageEvent: Pubnub.MessageEvent) => {
          console.log(`New message rec`, messageEvent);
          setMessages((prevMessages) => [...prevMessages, messageEvent]);
        },
      };
      pubnub.addListener(listner);
      return () => {
        pubnub.removeListener(listner);
      };
    }
  }, [roomCode]);

  const handleSendMessage = useCallback(() => {
    if (typedMessage && roomCode) {
      pubnub.publish({
        channel: roomCode,
        message: typedMessage,
      });
      setTypedMessage("");
    }
  }, [roomCode, typedMessage]);

  return (
    <div>
      <h1>Chat App {roomCode}</h1>
      <div ref={messageContainer} className="messages">
        {messages.map((message) => (
          <div
            className={message.publisher === myID ? "my-message" : ""}
            key={message.timetoken}
          >
            {message.message}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <Input
          value={typedMessage}
          onPressEnter={handleSendMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <Button
          onClick={handleSendMessage}
          disabled={typedMessage === ""}
          type="primary"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
