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

    @PostMapping("/book")
    public Appointment bookAppointment(@Valid @RequestBody BookRequest request) {
        return queueService.bookAppointment(request.getDoctorId(), request.getPatientName(), request.getDate());
    }

    @GetMapping("/queue")
    public List<Appointment> getQueue(
            @RequestParam Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return queueService.getQueueForDoctor(doctorId, date);
    }

    @GetMapping("/history")
    public List<Appointment> getHistory(@RequestParam String patientName) {
        return queueService.getPatientHistory(patientName);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/start/{id}")
    public Appointment startAppointment(@PathVariable Long id) {
        return queueService.startAppointment(id);
    }

    // Fix: explicit complete endpoint so the last patient can be finished
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/complete/{id}")
    public Appointment completeAppointment(@PathVariable Long id) {
        return queueService.completeAppointment(id);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/next")
    public Appointment callNext(@RequestParam Long doctorId) {
        return queueService.callNextPatient(doctorId);
    }
}