import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Hero from './components/Hero'
import Login from './components/Login'
import AdminPage from './components/AdminPage'
import AdminLayout from './components/AdminLayout'
import RequireAuth from './components/RequireAuth'
import Events from './components/Events'
import Winners from './components/Winners'
import Arts from './components/Arts'
import Sports from './components/Sports'
import OverallChampionsPage from './components/OverallChampionsPage'
import OverallChampionPage from './components/OverallChampionPage'
import OverallRunnerUpPage from './components/OverallRunnerUpPage'
import LayatharangChampionsPage from './components/LayatharangChampionsPage'
import ChakravyuhChampionsPage from './components/ChakravyuhChampionsPage'
import './App.css'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/arts" element={<Arts />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/overall" element={<Navigate to="/overall-champion" replace />} />
            <Route path="/overall-all" element={<OverallChampionsPage />} />
            <Route path="/overall-champion" element={<OverallChampionPage />} />
            <Route path="/overall-runner-up" element={<OverallRunnerUpPage />} />
            <Route path="/layatharang" element={<LayatharangChampionsPage />} />
            <Route path="/chakravyuh" element={<ChakravyuhChampionsPage />} />

            <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
                <Route index element={<AdminPage />} />
                <Route path="events" element={<Events />} />
                <Route path="winners" element={<Winners />} />
            </Route>
        </Routes>
    )
}

export default App
