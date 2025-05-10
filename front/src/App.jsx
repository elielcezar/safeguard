import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import NewPass from './pages/NewPass';
import EditPass from './pages/EditPass';
import Clients from './pages/Clients';
import UserProfile from './pages/UserProfile';
import VerifyCode from './pages/VerifyCode';
import { Toaster } from './components/ui/toaster';
import EditClient from './pages/EditClient';

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
        <Route path="/clients" element={
          <PrivateRoute>
            <Clients />
          </PrivateRoute>
        } />
        <Route path="/client/edit/:id" element={
          <PrivateRoute>
            <EditClient />
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
