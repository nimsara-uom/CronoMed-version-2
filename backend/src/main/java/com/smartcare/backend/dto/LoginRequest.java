package com.smartcare.backend.dto;

import jakarta.validation.constraints.NotBlank;
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    private String role; // "Patient" or "Doctor"
    private Long doctorId;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}
