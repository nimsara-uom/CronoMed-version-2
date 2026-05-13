package com.smartcare.backend.config;

import com.smartcare.backend.model.Role;
import com.smartcare.backend.model.User;
import com.smartcare.backend.repository.UserRepository;
import com.smartcare.backend.repository.DoctorRepository;
import com.smartcare.backend.model.Doctor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, DoctorRepository doctorRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("doctor.anil.fernando").isEmpty()) {
                List<Doctor> doctors = doctorRepository.findAll();
                for (Doctor doctor : doctors) {
                    String username = doctor.getName().toLowerCase()
                            .replaceAll("[^a-z0-9]+", ".")
                            .replaceAll("^\\.+|\\.+$", "");
                    if (username.isBlank()) {
                        continue;
                    }
                    if (userRepository.findByUsername(username).isEmpty()) {
                        userRepository.save(createDoctor(username, "password123", passwordEncoder));
                    }
                }
            }
        };
    }

    private User createDoctor(String username, String rawPassword, PasswordEncoder encoder) {
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole(Role.DOCTOR);
        return u;
    }
}
