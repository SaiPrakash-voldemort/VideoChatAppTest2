import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";

function App() {
  return (
    <div
      className="App flex  justify-center  h-screen bg-purple-500
    00"
    >
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
      </Routes>
      <Routes>
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
