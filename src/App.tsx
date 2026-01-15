import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import LoadingFallback from './components/LoadingFallback'
import RoutePrefetcher from './components/RoutePrefetcher'
import { ROUTES } from './config/routes.config'
import { FilterProvider } from './context/FilterContext'

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'))
const Catch = lazy(() => import('./pages/Catch'))
const Revenue = lazy(() => import('./pages/Revenue'))
const Market = lazy(() => import('./pages/Market'))
const Composition = lazy(() => import('./pages/Composition'))
const Nutrients = lazy(() => import('./pages/Nutrients'))
const Tracks = lazy(() => import('./pages/Tracks'))
const About = lazy(() => import('./pages/About'))
const DataTestPage = lazy(() => import('./pages/DataTestPage'))

export default function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <RoutePrefetcher />
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to={ROUTES.HOME} replace />} />
            <Route
              path="home"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="catch"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Catch />
                </Suspense>
              }
            />
            <Route
              path="revenue"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Revenue />
                </Suspense>
              }
            />
            <Route
              path="market"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Market />
                </Suspense>
              }
            />
            <Route
              path="composition"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Composition />
                </Suspense>
              }
            />
            <Route
              path="nutrients"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Nutrients />
                </Suspense>
              }
            />
            <Route
              path="tracks"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Tracks />
                </Suspense>
              }
            />
            <Route
              path="about"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <About />
                </Suspense>
              }
            />
            <Route
              path="data-test"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <DataTestPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </FilterProvider>
  )
}

