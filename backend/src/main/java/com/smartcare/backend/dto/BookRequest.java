package com.smartcare.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * #1 — patientName removed: the server now derives it from the authenticated JWT principal.
 * Sending patientName in the request body is ignored and has no effect.
 */
public class BookRequest {
    @NotNull
    private Long doctorId;
    @NotNull
    private LocalDate date;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
