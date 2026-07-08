package com.smartcare.backend.controller;

import com.smartcare.backend.dto.DoctorOverviewResponse;
import com.smartcare.backend.exception.NotFoundException;
import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.AppointmentStatus;
import com.smartcare.backend.model.Doctor;
import com.smartcare.backend.repository.DoctorRepository;
import com.smartcare.backend.repository.AppointmentRepository;
import com.smartcare.backend.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private QueueService queueService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * Returns a live snapshot of every doctor's queue:
     * - waiting = PENDING count for TODAY
     * - currentPatient = any IN_PROGRESS appointment across ALL dates
     *   (a doctor may still be with a patient booked on a previous day)
     * - elapsedSeconds = seconds since startedAt
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/overview")
    public List<DoctorOverviewResponse> getOverview() {
        List<Doctor> doctors = doctorRepository.findAll();
        LocalDate today = LocalDate.now();

        return doctors.stream().map(doctor -> {
            // PENDING count: only today's queue
            List<Appointment> todayQueue = queueService.getQueueForDoctor(doctor.getId(), today);
            int waiting = (int) todayQueue.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                    .count();

            // IN_PROGRESS: across ALL dates — a doctor may still be consulting
            // a patient whose appointment was booked on a previous day
            Appointment inProgress = appointmentRepository
                    .findFirstByDoctorAndStatusOrderByQueueNumberAsc(doctor, AppointmentStatus.IN_PROGRESS)
                    .orElse(null);

            String currentPatientName = inProgress != null ? inProgress.getPatientName() : null;
            Integer currentQueueNumber = inProgress != null ? inProgress.getQueueNumber() : null;

            Long elapsedSeconds = null;
            if (inProgress != null && inProgress.getStartedAt() != null) {
                elapsedSeconds = Duration.between(inProgress.getStartedAt(), LocalDateTime.now()).getSeconds();
            }

            return new DoctorOverviewResponse(
                    doctor.getId(),
                    doctor.getName(),
                    doctor.getSpeciality(),
                    doctor.getAvgConsultationTime(),
                    waiting,
                    currentPatientName,
                    currentQueueNumber,
                    elapsedSeconds
            );
        }).collect(Collectors.toList());
    }

    /**
     * Allows the admin to update the average consultation time estimate for any doctor.
     * Body: { "avgConsultationTime": 15 }
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/doctors/{id}/avg-time")
    public Doctor updateAvgTime(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doctor not found: id=" + id));
        Integer newTime = body.get("avgConsultationTime");
        if (newTime == null || newTime < 1) {
            throw new IllegalArgumentException("avgConsultationTime must be a positive integer");
        }
        doctor.setAvgConsultationTime(newTime);
        return doctorRepository.save(doctor);
    }
}
