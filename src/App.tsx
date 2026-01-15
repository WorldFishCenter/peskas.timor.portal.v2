import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import Home from './pages/Home'
import Catch from './pages/Catch'
import Revenue from './pages/Revenue'
import Market from './pages/Market'
import Composition from './pages/Composition'
import Nutrients from './pages/Nutrients'
import Tracks from './pages/Tracks'
import About from './pages/About'
import DataTestPage from './pages/DataTestPage'
import { ROUTES } from './config/routes.config'
import { FilterProvider } from './context/FilterContext'

export default function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path="home" element={<Home />} />
            <Route path="catch" element={<Catch />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="market" element={<Market />} />
            <Route path="composition" element={<Composition />} />
            <Route path="nutrients" element={<Nutrients />} />
            <Route path="tracks" element={<Tracks />} />
            <Route path="about" element={<About />} />
            <Route path="data-test" element={<DataTestPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  )
}

