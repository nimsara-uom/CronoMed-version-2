import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, Lock, Eye, EyeOff, Users, Activity } from 'lucide-react';
import api from '../api/client';
import heroMedical from '../assets/hero-medical.jpg';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdValid, setPwdValid] = useState(true);
  const [pwdMessage, setPwdMessage] = useState('');
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
        // client-side password validation
        const check = validatePassword(password);
        if (!check.valid) {
          setPwdValid(false);
          setPwdMessage(check.message);
          return;
        }
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

  const validatePassword = (password) => {
    if (!password) return { valid: false, message: 'Password must not be empty' };
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
    let hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
    for (const c of password) {
      if (c >= 'A' && c <= 'Z') hasUpper = true;
      else if (c >= 'a' && c <= 'z') hasLower = true;
      else if (c >= '0' && c <= '9') hasDigit = true;
      else hasSpecial = true;
    }
    if (!hasUpper) return { valid: false, message: 'Add at least one uppercase letter' };
    if (!hasLower) return { valid: false, message: 'Add at least one lowercase letter' };
    if (!hasDigit) return { valid: false, message: 'Add at least one digit' };
    if (!hasSpecial) return { valid: false, message: 'Add at least one special character' };
    const lower = password.toLowerCase();
    if (/(password|123456|qwerty)/.test(lower)) return { valid: false, message: 'Password is too common' };
    return { valid: true, message: '' };
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(4, 47, 46, 0.55), rgba(5, 150, 105, 0.35)), url(${heroMedical})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Activity className="absolute top-16 left-16 text-white/20 w-24 h-24 hidden md:block" />
      <Stethoscope className="absolute bottom-16 right-16 text-white/20 w-28 h-28 hidden md:block" />

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-up border border-white/50">

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-brand-blue flex items-center justify-center logo-pulse mb-3">
            <Stethoscope className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 tracking-tight">ChronoMed</h1>
          <p className="text-emerald-600 text-sm mt-1 flex items-center gap-1">
            <Activity size={14} /> Your Health, Our Priority
          </p>
        </div>

        <div className="flex mb-6 bg-emerald-50 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isRegistering ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setRole('Patient'); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isRegistering ? 'bg-white text-emerald-700 shadow' : 'text-emerald-500'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue px-4">
                <Users className="text-emerald-500 mr-2" size={18} />
                <select
                  className="w-full bg-transparent py-3 outline-none text-gray-700"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
            </div>
          )}

          {isRegistering || role === 'Patient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue px-4">
                <User className="text-emerald-500 mr-2" size={18} />
                <input
                  type="text"
                  required
                  className="w-full bg-transparent py-3 outline-none"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue px-4">
                <Stethoscope className="text-emerald-500 mr-2" size={18} />
                <select
                  className="w-full bg-transparent py-3 outline-none"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-blue px-4">
              <Lock className="text-emerald-500 mr-2" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-transparent py-3 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isRegistering) {
                    const res = validatePassword(e.target.value);
                    setPwdValid(res.valid);
                    setPwdMessage(res.message);
                  } else {
                    setPwdValid(true);
                    setPwdMessage('');
                  }
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-emerald-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering && !pwdValid}
            className="w-full bg-gradient-to-r from-emerald-500 to-brand-blue text-white py-3 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-emerald-800 transition-all shadow-md hover:shadow-xl active:scale-[0.98]"
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
          {isRegistering && !pwdValid && (
            <p className="text-sm text-red-600 mt-2">{pwdMessage}</p>
          )}
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">SECURE • PRIVATE • RELIABLE</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}