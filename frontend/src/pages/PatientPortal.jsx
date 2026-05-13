import { useState, useEffect } from 'react';
import { Activity, FileText, Calendar, Clock, Stethoscope, Search, User } from 'lucide-react';
import api from '../api/client';

export default function PatientPortal() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [specialization, setSpecialization] = useState('Any');
  const [liveQueue, setLiveQueue] = useState(null);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    // Auto-fill username from local storage
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setPatientName(storedName);
    }

    // Fetch doctors
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (error) {
        console.error("Error fetching doctors", error);
      }
    };
    fetchDoctors();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !patientName) return alert("Please select a doctor and ensure patient name is filled");
    
    try {
      const res = await api.post('/book', {
        doctorId: selectedDoctor,
        patientName: patientName
      });
      alert(`Appointment Booked! Your Queue Number is ${res.data.queueNumber}`);
      setSelectedDoctor('');
    } catch (error) {
      console.error("Booking error", error);
      alert("Failed to book appointment");
    }
  };

  const pollQueue = async () => {
    if (!selectedDoctor) return alert("Please select a doctor from the booking form to see their live queue.");
    try {
      const res = await api.get('/queue', { params: { doctorId: selectedDoctor } });
      setLiveQueue(res.data);
      setShowQueue(true);
    } catch (error) {
      console.error("Error fetching queue", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ChronoMed Logo" className="h-10" />
            <span className="text-2xl font-bold text-blue-800 tracking-tight">ChronoMed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue font-bold">
              {patientName ? patientName.charAt(0).toUpperCase() : <User />}
            </div>
            <span className="font-medium text-gray-700 hidden sm:block">{patientName}</span>
            <button 
              onClick={handleLogout} 
              className="ml-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Booking Section */}
        <section className="bg-brand-blue rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Book Your Appointment</h2>
            <p className="text-blue-100 mb-8 text-lg">Fast, easy, and secure access to the best healthcare professionals.</p>
            
            <form onSubmit={handleBook} className="bg-white rounded-xl p-3 shadow-lg flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 border border-gray-200">
                <Search className="text-gray-400 mr-2" size={20} />
                <select 
                  className="w-full bg-transparent py-4 outline-none text-gray-700"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">Search Doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 border border-gray-200">
                <Stethoscope className="text-gray-400 mr-2" size={20} />
                <select 
                  className="w-full bg-transparent py-4 outline-none text-gray-700"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="Any">Any Speciality</option>
                  {[...new Set(doctors.map(d => d.speciality))].filter(Boolean).map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 border border-gray-200">
                <Calendar className="text-gray-400 mr-2" size={20} />
                <input 
                  type="date" 
                  className="w-full bg-transparent py-4 outline-none text-gray-700"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* Hidden Patient Name Field just to demonstrate auto-fill logic sending */}
              <input type="hidden" value={patientName} />

              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-md text-lg">
                Book Now
              </button>
            </form>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={pollQueue}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">My Live Queue Status</h4>
              <p className="text-gray-500 mt-1">Check your current position and estimated wait time.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Upload Documents</h4>
              <p className="text-gray-500 mt-1">Securely share your medical records before visit.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Appointment History</h4>
              <p className="text-gray-500 mt-1">View past visits and medical prescriptions.</p>
            </div>
          </div>
        </section>

        {/* Live Queue Display */}
        {showQueue && (
          <section className="mt-10 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Live Queue Tracking</h3>
              <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              {liveQueue && liveQueue.length > 0 ? (
                <div className="space-y-4">
                  {liveQueue.map((apt) => (
                    <div key={apt.id} className={`flex items-center justify-between p-4 rounded-lg border ${apt.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200' : apt.status === 'COMPLETED' ? 'bg-gray-50 border-gray-200 opacity-60' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${apt.status === 'IN_PROGRESS' ? 'bg-brand-blue text-white shadow-md animate-pulse' : 'bg-gray-200 text-gray-700'}`}>
                          #{apt.queueNumber}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{apt.patientName}</p>
                          <p className="text-sm text-gray-500">Status: {apt.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {apt.patientName === patientName && apt.status !== 'COMPLETED' && (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">It's You</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No patients currently in queue.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
