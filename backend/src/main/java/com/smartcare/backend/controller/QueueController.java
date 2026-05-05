package com.smartcare.backend.controller;

import com.smartcare.backend.dto.BookRequest;
import com.smartcare.backend.dto.LoginRequest;
import com.smartcare.backend.dto.LoginResponse;
import com.smartcare.backend.model.Appointment;
import com.smartcare.backend.model.Doctor;
import com.smartcare.backend.repository.DoctorRepository;
import com.smartcare.backend.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        LoginResponse response = new LoginResponse();
        response.setSuccess(true);
        response.setRole(request.getRole());
        response.setUsername(request.getUsername());
        
        // Mock doctor login
        if ("Doctor".equalsIgnoreCase(request.getRole())) {
            response.setDoctorId(request.getDoctorId()); 
        }
        
        return response;
    }

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody BookRequest request) {
        return queueService.bookAppointment(request.getDoctorId(), request.getPatientName());
    }

    @GetMapping("/queue")
    public List<Appointment> getQueue(@RequestParam Long doctorId) {
        return queueService.getQueueForDoctor(doctorId);
    }

    @PutMapping("/start/{id}")
    public Appointment startAppointment(@PathVariable Long id) {
        return queueService.startAppointment(id);
    }
}
