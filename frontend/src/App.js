import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { SocketProvider } from './contexts/SocketContext';
import { ParaSDKProvider } from './contexts/ParaContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAuction from './pages/CreateAuction';
import AuctionList from './pages/AuctionList';
import AuctionDetails from './pages/AuctionDetails';
import Dashboard from './pages/Dashboard';
import MeetingAccess from './pages/MeetingAccess';
import JoinMeeting from './pages/JoinMeeting';

import './App.css';

function App() {
  return (
    <ParaSDKProvider>
      <AuthProvider>
        <Web3Provider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create" element={<CreateAuction />} />
                    <Route path="/auctions" element={<AuctionList />} />
                    <Route path="/auction/:id" element={<AuctionDetails />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/meeting-access/:token" element={<MeetingAccess />} />
                    <Route path="/join-meeting/:token" element={<JoinMeeting />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </SocketProvider>
        </Web3Provider>
      </AuthProvider>
    </ParaSDKProvider>
  );
}

export default App;
