package com.smartcare.backend.service;

import com.smartcare.backend.exception.NotFoundException;
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
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Per-doctor locks: Doctor A's booking no longer blocks Doctor B's.
     * Uses ConcurrentHashMap so lock objects are created lazily and safely.
     */
    private final ConcurrentHashMap<Long, Object> doctorLocks = new ConcurrentHashMap<>();

    // #4 + #5: per-doctor lock + @Transactional safety net
    @Transactional
    public Appointment bookAppointment(Long doctorId, String patientName, LocalDate date) {
        // #4: lock per doctor, not per service instance
        synchronized (doctorLocks.computeIfAbsent(doctorId, k -> new Object())) {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new NotFoundException("Doctor not found: id=" + doctorId));

            Long currentCount = appointmentRepository.countByDoctorAndDate(doctor, date);
            Integer nextQueueNumber = currentCount.intValue() + 1;

            Appointment appointment = new Appointment();
            appointment.setDoctor(doctor);
            // #1: patientName is now the authenticated username, passed in by the controller
            appointment.setPatientName(patientName);
            appointment.setQueueNumber(nextQueueNumber);
            appointment.setDate(date);
            appointment.setStatus(AppointmentStatus.PENDING);

            return appointmentRepository.save(appointment);
        }
    }

    public List<Appointment> getQueueForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found: id=" + doctorId));
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return appointmentRepository.findByDoctorAndDateOrderByQueueNumberAsc(doctor, targetDate);
    }

    // #1: patientName is now the authenticated username, enforced at controller level
    public List<Appointment> getPatientHistory(String patientName) {
        return appointmentRepository.findByPatientNameOrderByDateDescQueueNumberAsc(patientName);
    }

    @Transactional
    public Appointment startAppointment(Long appointmentId) {
        Appointment targetAppointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found: id=" + appointmentId));

        Doctor doctor = targetAppointment.getDoctor();

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

    @Transactional
    public Appointment completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found: id=" + appointmentId));

        // #7: use IllegalStateException → mapped to 400 by GlobalExceptionHandler
        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    // #8: accept an optional date — defaults to today so existing callers are unaffected
    @Transactional
    public Appointment callNextPatient(Long doctorId, LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        // #4: lock per doctor
        synchronized (doctorLocks.computeIfAbsent(doctorId, k -> new Object())) {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new NotFoundException("Doctor not found: id=" + doctorId));

            Optional<Appointment> currentInProgress = appointmentRepository
                    .findFirstByDoctorAndStatusOrderByQueueNumberAsc(doctor, AppointmentStatus.IN_PROGRESS);
            currentInProgress.ifPresent(current -> {
                current.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepository.save(current);
            });

            // #8: use targetDate, not hardcoded LocalDate.now()
            Appointment next = appointmentRepository
                    .findFirstByDoctorAndDateAndStatusOrderByQueueNumberAsc(doctor, targetDate, AppointmentStatus.PENDING)
                    .orElseThrow(() -> new NotFoundException("No pending patients in queue for " + targetDate));

            next.setStatus(AppointmentStatus.IN_PROGRESS);
            return appointmentRepository.save(next);
        }
    }
}