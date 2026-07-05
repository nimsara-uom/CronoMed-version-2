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

        // Fix: countByDoctorAndDate returns Long — cast correctly to avoid type mismatch
        Long currentCount = appointmentRepository.countByDoctorAndDate(doctor, date);
        Integer nextQueueNumber = currentCount.intValue() + 1;

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatientName(patientName);
        appointment.setQueueNumber(nextQueueNumber);
        appointment.setDate(date);
        appointment.setStatus(AppointmentStatus.PENDING);

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getQueueForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return appointmentRepository.findByDoctorAndDateOrderByQueueNumberAsc(doctor, targetDate);
    }

    public List<Appointment> getPatientHistory(String patientName) {
        return appointmentRepository.findByPatientNameOrderByDateDescQueueNumberAsc(patientName);
    }

    @Transactional
    public Appointment startAppointment(Long appointmentId) {
        Appointment targetAppointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = targetAppointment.getDoctor();

        // Fix: use ordered query; guard against re-starting the same patient
        Optional<Appointment> currentInProgress = appointmentRepository
                .findFirstByDoctorAndStatusOrderByQueueNumberAsc(doctor, AppointmentStatus.IN_PROGRESS);
        if (currentInProgress.isPresent() && !currentInProgress.get().getId().equals(appointmentId)) {
            Appointment current = currentInProgress.get();
            current.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(current);
        }

        targetAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(targetAppointment);
    }

    // Fix: explicit completeAppointment — allows finishing the last patient in the queue
    @Transactional
    public Appointment completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public synchronized Appointment callNextPatient(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Fix: use ordered query for deterministic auto-complete
        Optional<Appointment> currentInProgress = appointmentRepository
                .findFirstByDoctorAndStatusOrderByQueueNumberAsc(doctor, AppointmentStatus.IN_PROGRESS);
        currentInProgress.ifPresent(current -> {
            current.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(current);
        });

        Appointment next = appointmentRepository
                .findFirstByDoctorAndDateAndStatusOrderByQueueNumberAsc(doctor, LocalDate.now(), AppointmentStatus.PENDING)
                .orElseThrow(() -> new RuntimeException("No pending patients in queue"));

        next.setStatus(AppointmentStatus.IN_PROGRESS);
        return appointmentRepository.save(next);
    }
}