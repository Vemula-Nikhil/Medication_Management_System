import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import PatientDashboard from './components/PatientDashboard'
import CaretakerDashboard from './components/CaretakerDashboard'
import './App.css';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signin" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/patient_dashboard" element={<PatientDashboard/>} />
      <Route path="/caretaker_dashboard" element={<CaretakerDashboard/>} />
    </Routes>
  </BrowserRouter>
  
)

export default App;
