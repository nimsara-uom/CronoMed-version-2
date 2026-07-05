package com.smartcare.backend.model;

import jakarta.persistence.Entity;  //import classes from Jakarta Persistence (JPA)
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity //indicates that this class is a database entity
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  //tells JPA to generate the primary key value automatically
    private Long id;
    private String name;
    private String speciality;
    private Integer avgConsultationTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpeciality() { return speciality; }
    public void setSpeciality(String speciality) { this.speciality = speciality; }
    public Integer getAvgConsultationTime() { return avgConsultationTime; }
    public void setAvgConsultationTime(Integer avgConsultationTime) { this.avgConsultationTime = avgConsultationTime; }
}
