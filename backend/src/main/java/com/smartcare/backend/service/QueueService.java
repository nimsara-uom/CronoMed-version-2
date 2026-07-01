package com.smartcare.backend.service;

import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.AppointmentStatus;
import com.smartcare.backend.model.Doctor;
import com.smartcare.backend.repository.AppointmentRepository;
import com.smartcare.backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public synchronized Appointment bookAppointment(Long doctorId, String patientName, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Integer currentCount = appointmentRepository.countByDoctorAndDate(doctor, date);
        Integer nextQueueNumber = currentCount + 1;

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatientName(patientName);
        appointment.setQueueNumber(nextQueueNumber);
        appointment.setDate(date);
        appointment.setStatus(AppointmentStatus.PENDING);

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getQueueForDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepository.findByDoctorAndDateOrderByQueueNumberAsc(doctor, LocalDate.now());
    }

    @Transactional
    public Appointment startAppointment(Long appointmentId) {
        Appointment targetAppointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = targetAppointment.getDoctor();

        // Complete any currently in-progress appointment for this doctor
        Optional<Appointment> currentInProgress = appointmentRepository.findFirstByDoctorAndStatus(doctor, AppointmentStatus.IN_PROGRESS);
        if (currentInProgress.isPresent()) {
            Appointment current = currentInProgress.get();
            current.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(current);
        }

        // Set target to in-progress
        targetAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(targetAppointment);
    }
}
