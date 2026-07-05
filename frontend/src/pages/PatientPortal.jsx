import { useState, useEffect, useRef } from 'react';
import { Activity, FileText, Calendar, Clock, Stethoscope, Search, User, X, Upload } from 'lucide-react';
import api from '../api/client';



export default function PatientPortal() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [specialization, setSpecialization] = useState('Any');
  const [liveQueue, setLiveQueue] = useState(null);
  const [showQueue, setShowQueue] = useState(false);

  // Fix: remember which doctor was booked so queue check works without re-selecting
  const [bookedDoctorId, setBookedDoctorId] = useState(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setPatientName(storedName);
    }

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
        patientName: patientName,
        date: date
      });
      alert(`Appointment Booked! Your Queue Number is ${res.data.queueNumber}`);
      // Fix: save bookedDoctorId so pollQueue works even after the dropdown resets
      setBookedDoctorId(selectedDoctor);
      setSelectedDoctor('');
    } catch (error) {
      console.error("Booking error", error);
      alert("Failed to book appointment");
    }
  };

  const pollQueue = async () => {
    // Fix: fall back to bookedDoctorId if nothing is currently selected
    const doctorIdToUse = selectedDoctor || bookedDoctorId;
    if (!doctorIdToUse) return alert("Please select a doctor from the booking form to see their live queue.");
    try {
      const res = await api.get('/queue', { params: { doctorId: doctorIdToUse, date: date || undefined } });
      setLiveQueue(res.data);
      setShowQueue(true);
    } catch (error) {
      console.error("Error fetching queue", error);
    }
  };


  
  // Auto-refresh the live queue every 5s while it's open
  useEffect(() => {
    if (!showQueue || !(selectedDoctor || bookedDoctorId)) return;
    const interval = setInterval(() => {
      pollQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, [showQueue, selectedDoctor, bookedDoctorId, date]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };


  
  const fetchHistory = async () => {
    if (!patientName) return;
    try {
      const res = await api.get('/history', { params: { patientName } });
      setHistory(res.data);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };
  

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };


  // page direct
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input for document upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        hidden
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />



      
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
                  {doctors
                    .filter(d => specialization === 'Any' || d.speciality === specialization)
                    .map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 border border-gray-200">
                <Stethoscope className="text-gray-400 mr-2" size={20} />
                <select
                  className="w-full bg-transparent py-4 outline-none text-gray-700"
                  value={specialization}
                  onChange={(e) => {
                    const newSpec = e.target.value;
                    setSpecialization(newSpec);
                    if (newSpec !== 'Any') {
                      const selectedDoc = doctors.find(d => d.id == selectedDoctor);
                      if (selectedDoc && selectedDoc.speciality !== newSpec) {
                        setSelectedDoctor('');
                      }
                    }
                  }}
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

              <input type="hidden" value={patientName} readOnly />

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

            <div
              onClick={() => fileInputRef.current.click()}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Upload Documents</h4>
              <p className="text-gray-500 mt-1">Securely share your medical records before visit.</p>
              {uploadedFiles.length > 0 && (
                <p className="text-xs text-purple-600 font-medium mt-2">{uploadedFiles.length} file(s) selected</p>
              )}
            </div>

            <div
              onClick={fetchHistory}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Appointment History</h4>
              <p className="text-gray-500 mt-1">View past visits and medical prescriptions.</p>
            </div>
          </div>
        </section>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <section className="mt-10 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload size={18} /> Selected Documents
              </h3>
              <button onClick={() => fileInputRef.current.click()} className="text-brand-blue text-sm font-medium hover:underline">
                + Add more
              </button>
            </div>
            <div className="p-6 space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm truncate">{file.name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                    <X size={18} />
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-3">
                Note: documents are currently stored locally in this session only — server-side upload isn't connected yet.
              </p>
            </div>
          </section>
        )}

        {/* Live Queue Display */}
        {showQueue && (
          <section className="mt-10 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Live Queue Tracking</h3>
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Auto-refreshing
                </span>
              </div>
              <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            {/* Fix: position summary card — shows where the patient is and estimated wait */}
            {(() => {
              const myEntry = liveQueue?.find(
                apt => apt.patientName.trim().toLowerCase() === patientName.trim().toLowerCase()
                  && apt.status !== 'COMPLETED'
              );
              if (!myEntry) return null;
              const aheadCount = liveQueue.filter(
                apt => apt.status === 'PENDING' && apt.queueNumber < myEntry.queueNumber
              ).length;
              const inProgressExists = liveQueue.some(apt => apt.status === 'IN_PROGRESS');
              const waitMinutes = (aheadCount + (inProgressExists ? 1 : 0)) * 10;
              return (
                <div className={`mx-6 mt-6 p-4 rounded-xl border-2 flex items-center justify-between gap-4 flex-wrap
                  ${myEntry.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-300' : 'bg-amber-50 border-amber-300'}`}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Your Status</p>
                    {myEntry.status === 'IN_PROGRESS' ? (
                      <p className="text-xl font-bold text-blue-700">🩺 You are with the doctor now!</p>
                    ) : (
                      <>
                        <p className="text-xl font-bold text-amber-800">
                          You are #{myEntry.queueNumber} — <span className="text-amber-600">{aheadCount} patient{aheadCount !== 1 ? 's' : ''} ahead of you</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">Estimated wait: ~{waitMinutes} min</p>
                      </>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">It's You ✓</span>
                </div>
              );
            })()}

            <div className="p-6">
              {liveQueue && liveQueue.length > 0 ? (
                <div className="space-y-4">
                  {liveQueue.map((apt) => {
                    // Fix: case-insensitive + trimmed name match
                    const isMe = apt.patientName.trim().toLowerCase() === patientName.trim().toLowerCase();
                    return (
                      <div key={apt.id} className={`flex items-center justify-between p-4 rounded-lg border
                        ${apt.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200' :
                          apt.status === 'COMPLETED' ? 'bg-gray-50 border-gray-200 opacity-60' :
                          isMe ? 'bg-amber-50 border-amber-200' : 'border-gray-100'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${apt.status === 'IN_PROGRESS' ? 'bg-brand-blue text-white shadow-md animate-pulse' :
                              isMe ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            #{apt.queueNumber}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{apt.patientName}</p>
                            <p className="text-sm text-gray-500">Status: {apt.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                        {isMe && apt.status !== 'COMPLETED' && (
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">It's You</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No patients currently in queue for this date.</p>
              )}
            </div>
          </section>
        )}

        {/* Appointment History Display */}
        {showHistory && (
          <section className="mt-10 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Appointment History</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">Dr. {apt.doctor?.name}</p>
                        <p className="text-sm text-gray-500">{apt.date} • Queue #{apt.queueNumber}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                        ${apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}`}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No past appointments found.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
