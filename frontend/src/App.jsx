import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import PatientPortal from './pages/PatientPortal'
import DoctorDashboard from './pages/DoctorDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/patient" element={<PatientPortal />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  )
}

export default App
