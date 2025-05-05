import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import NewPass from './pages/Pass/New';
import { Toaster } from './components/ui/toaster';

export default function App() {  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
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
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  )
}
