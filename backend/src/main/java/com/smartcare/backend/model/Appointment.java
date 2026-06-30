package com.smartcare.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;



@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer queueNumber;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;



    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    
    private String patientName;


    
    private LocalDate date;



    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getQueueNumber() { return queueNumber; }
    public void setQueueNumber(Integer queueNumber) { this.queueNumber = queueNumber; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
