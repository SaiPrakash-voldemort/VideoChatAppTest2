import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex-col text-center gap-4 items-center justify-center font-mono">
      <h1 className="text-5xl m-2 p-5 bg-white rounded-xl text-purple-800 font-bold">
        Video Chat Application
      </h1>
      <div className=" max-h-96 bg-white rounded-2xl p-4 shadow-2xl flex-col items-center justify-center">
        <form className=" " onSubmit={handleSubmitForm}>
          <div className="flex justify-center items-center gap-1 m-3 p-1">
            <label
              className="text-xl text-purple-600 font-bold"
              htmlFor="email"
            >
              Email ID:
            </label>
            <input
              className="rounded-xl p-2 border-2 border-purple-500 text-purple-600 font-bold"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-center items-center gap-1 m-3 p-1">
            <label className="text-xl text-purple-600 font-bold" htmlFor="room">
              Room ID:
            </label>
            <input
              className="rounded-xl p-2 border-2 border-purple-500  text-purple-600 font-bold"
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <div>
            <button className="relative inline-flex items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all m-0 p-0 bg-white rounded hover:bg-white group  text-purple-600 font-bold">
              <span className="w-48 h-48 rounded rotate-[-40deg] bg-purple-600 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
              <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                Join
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
