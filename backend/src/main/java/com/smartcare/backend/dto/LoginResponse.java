package com.smartcare.backend.dto;

import lombok.Data;

public class LoginResponse {
    private boolean success;
    private String role;
    private Long doctorId; // Mocked for doctor login
    private String username;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
