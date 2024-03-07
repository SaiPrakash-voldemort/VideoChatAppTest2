import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="flex flex-col items-center flex-wrap h-900  bg-white m-4 w-10/12 rounded-lg shadow-2xl">
      <div>
        <h1 className="text-5xl m-2 p-2 font-mono font-bold text-purple-600">
          Room Page
        </h1>
      </div>
      <div>
        {" "}
        <h4 className="text-4xl m-2 p-2 font-mono font-medium text-purple-600">
          {remoteSocketId ? "Connected" : "No one in room"}
        </h4>
      </div>
      <div className="flex justify-between  w-72 ">
        {myStream && (
          <button
            className="relative inline-flex items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all m-0 p-0 bg-white rounded hover:bg-white group  text-purple-600 font-bold shadow-2xl"
            onClick={sendStreams}
          >
            <span className="w-48 h-48 rounded rotate-[-40deg] bg-purple-600 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
            <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
              Send Stream
            </span>
          </button>
        )}
        {remoteSocketId && (
          <button
            className="relative inline-flex items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all m-0 p-0 bg-white rounded hover:bg-white group  text-purple-600 font-bold shadow-2xl"
            onClick={handleCallUser}
          >
            <span className="w-48 h-48 rounded rotate-[-40deg] bg-purple-600 absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
            <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
              Call
            </span>
          </button>
        )}
      </div>
      <div className="flex gap-6 m-5">
        {myStream && (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl m-2 p-2 font-mono font-bold underline text-purple-600">
              My Stream
            </h1>
            <ReactPlayer
              className="shadow-2xl"
              playing
              muted
              height="300px"
              width="400px"
              url={myStream}
              controls
            />
          </div>
        )}
        {remoteStream && (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl m-2 p-2 font-mono font-bold underline text-purple-600">
              Remote Stream
            </h1>
            <ReactPlayer
              className="shadow-2xl"
              playing
              muted
              height="300px"
              width="400px"
              url={remoteStream}
              controls
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
