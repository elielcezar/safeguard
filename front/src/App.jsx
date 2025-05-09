import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import NewPass from './pages/Pass/New';
import EditPass from './pages/Pass/Edit';
import NewClient from './pages/Client/New';
import UserProfile from './pages/User/Profile';
import VerifyCode from './pages/VerifyCode';
import { Toaster } from './components/ui/toaster';

export default function App() {  
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/pass/new" element={
          <PrivateRoute>
            <NewPass />
          </PrivateRoute>
        } />
        <Route path="/pass/edit/:id" element={
          <PrivateRoute>
            <EditPass />
          </PrivateRoute>
        } />    
        <Route path="/clients/new" element={
          <PrivateRoute>
            <NewClient />
          </PrivateRoute>
        } />
        <Route path="/user/profile" element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } />
      </Routes>
      <Toaster />
    </>
  )
}
