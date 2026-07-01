import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import api from '../api/client';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const toDoctorUsername = (doctorName) =>
    doctorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const response = await api.post('/auth/register', { username, password });
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          navigate('/patient');
        }
      } else {
        const doctor = doctors.find(d => d.id == doctorId);
        
        if (role === 'Doctor' && !doctor) {
          alert('Please wait for doctors to load or select a valid doctor.');
          return;
        }
        
        const requestUsername = role === 'Patient' ? username : toDoctorUsername(doctor?.name || '');
        const response = await api.post('/auth/login', {
          username: requestUsername,
          password
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          if (role === 'Patient') {
            localStorage.setItem('username', requestUsername);
            navigate('/patient');
          } else {
            localStorage.setItem('username', doctor?.name || '');
            localStorage.setItem('doctorId', doctorId);
            navigate('/doctor');
          }
        }
      }
    } catch (error) {
      console.error('Request failed', error);
      if (error.response && error.response.status === 409) {
        alert('Username already exists. Please choose another one.');
      } else {
        alert(isRegistering ? 'Registration failed.' : 'Login failed. Please check credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="ChronoMed Logo" className="h-32 -mt-4 -mb-4 object-contain scale-125" />
          <h1 className="text-3xl font-bold text-blue-800 tracking-tight">ChronoMed</h1>
          <p className="text-gray-500 mt-2">{isRegistering ? 'Create a Patient Account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isRegistering && (
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
          )}

          {isRegistering || role === 'Patient' ? (
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
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setRole('Patient'); // Reset to patient for registration
            }}
            className="text-brand-blue hover:text-blue-800 font-medium transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register as Patient'}
          </button>
        </div>
      </div>
    </div>
  );
}

