import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import Home from './pages/Home'
import Catch from './pages/Catch'
import Revenue from './pages/Revenue'
import Market from './pages/Market'
import Composition from './pages/Composition'
import Nutrients from './pages/Nutrients'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}> 
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="catch" element={<Catch />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="market" element={<Market />} />
          <Route path="composition" element={<Composition />} />
          <Route path="nutrients" element={<Nutrients />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

