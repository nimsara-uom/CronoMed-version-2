package com.smartcare.backend.controller;

import com.smartcare.backend.dto.BookRequest;
import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.Doctor;
import com.smartcare.backend.repository.DoctorRepository;
import com.smartcare.backend.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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
    public List<Appointment> getQueue(@RequestParam Long doctorId) {
        return queueService.getQueueForDoctor(doctorId);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/start/{id}")
    public Appointment startAppointment(@PathVariable Long id) {
        return queueService.startAppointment(id);
    }
}
