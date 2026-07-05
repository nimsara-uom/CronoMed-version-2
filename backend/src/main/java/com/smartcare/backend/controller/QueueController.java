package com.smartcare.backend.controller;

import com.smartcare.backend.dto.BookRequest;
import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.Doctor;
import com.smartcare.backend.repository.DoctorRepository;
import com.smartcare.backend.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    /**
     * #1 — Auth fix: ignore any patientName from the request body.
     * The authenticated username (from JWT via Principal) is used as the source of truth.
     */
    @PostMapping("/book")
    public Appointment bookAppointment(@Valid @RequestBody BookRequest request, Principal principal) {
        return queueService.bookAppointment(request.getDoctorId(), principal.getName(), request.getDate());
    }

    @GetMapping("/queue")
    public List<Appointment> getQueue(
            @RequestParam Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return queueService.getQueueForDoctor(doctorId, date);
    }

    /**
     * #1 — Auth fix: ignore any patientName query param.
     * History is always scoped to the authenticated user. Doctors can query anyone's history
     * via a separate admin endpoint if needed in the future.
     */
    @GetMapping("/history")
    public List<Appointment> getHistory(Principal principal) {
        return queueService.getPatientHistory(principal.getName());
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/start/{id}")
    public Appointment startAppointment(@PathVariable Long id) {
        return queueService.startAppointment(id);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/complete/{id}")
    public Appointment completeAppointment(@PathVariable Long id) {
        return queueService.completeAppointment(id);
    }

    /**
     * #8 — Accept an optional date param so doctors managing a future date's queue
     * can advance it correctly. Defaults to today if omitted.
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/next")
    public Appointment callNext(
            @RequestParam Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return queueService.callNextPatient(doctorId, date);
    }
}