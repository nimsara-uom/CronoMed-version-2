package com.smartcare.backend.dto;

import lombok.Data;

public class BookRequest {
    private Long doctorId;
    private String patientName;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
}
