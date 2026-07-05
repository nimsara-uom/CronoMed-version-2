package com.smartcare.backend.repository;

import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.AppointmentStatus;
import com.smartcare.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Fix: return Long (not Integer) to match JPA's count() return type
    Long countByDoctorAndDate(Doctor doctor, LocalDate date);
    List<Appointment> findByDoctorOrderByQueueNumberAsc(Doctor doctor);
    List<Appointment> findByDoctorAndDateOrderByQueueNumberAsc(Doctor doctor, LocalDate date);
    // Fix: add OrderByQueueNumberAsc for deterministic ordering
    Optional<Appointment> findFirstByDoctorAndStatusOrderByQueueNumberAsc(Doctor doctor, AppointmentStatus status);
    Optional<Appointment> findFirstByDoctorAndDateAndStatusOrderByQueueNumberAsc(Doctor doctor, LocalDate date, AppointmentStatus status);
    List<Appointment> findByPatientNameOrderByDateDescQueueNumberAsc(String patientName);
}