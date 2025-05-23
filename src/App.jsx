import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./components/chat/Chat";
import Details from "./components/details/Details";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notfication/Notfication";
import useAuthStore from "./stores/authStore";
import useSocketStore from "./stores/socketStore";
import React, { useEffect } from "react";

const App = () => {
  const { isAuthenticated, login } = useAuthStore();
  const { initializeSocket } = useSocketStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      login(JSON.parse(storedUser));
      initializeSocket();
    }
  }, [login]);

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <>
                  <List />
                  <Chat />
                  <Details />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
        <Notification />
      </div>
    </Router>
  );
};

export default App;
