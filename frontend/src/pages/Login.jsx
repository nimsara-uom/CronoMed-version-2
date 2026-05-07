import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/doctors');
        setDoctors(res.data);
        if (res.data.length > 0) {
          setDoctorId(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching doctors", error);
      }
    };
    fetchDoctors();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        username: role === 'Patient' ? username : doctors.find(d => d.id == doctorId)?.name,
        password,
        role,
        doctorId: role === 'Doctor' ? doctorId : null
      });

      if (response.data.success) {
        if (role === 'Patient') {
          localStorage.setItem('username', username);
          navigate('/patient');
        } else {
          localStorage.setItem('username', doctors.find(d => d.id == doctorId)?.name);
          localStorage.setItem('doctorId', response.data.doctorId);
          navigate('/doctor');
        }
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please make sure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="ChronoMed Logo" className="h-32 -mt-4 -mb-4 object-contain scale-125" />
          <h1 className="text-3xl font-bold text-blue-800 tracking-tight">ChronoMed</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          {role === 'Patient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all bg-white"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

