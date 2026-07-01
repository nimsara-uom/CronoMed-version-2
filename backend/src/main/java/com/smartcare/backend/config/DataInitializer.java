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
            // Seed doctor accounts from the doctor table
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
                        userRepository.save(createUser(username, "password123", Role.DOCTOR, passwordEncoder));
                    }
                }
            }

            // Seed patient accounts
            String[][] patients = {
                {"kenul",    "kenul_1234"},
                {"nimsara",  "nimsara_1234"},
                {"chamitha", "chamitha_1234"},
                {"risandu",  "risandu_1234"},
                {"kethmika", "kethmika_1234"}
            };
            for (String[] patient : patients) {
                if (userRepository.findByUsername(patient[0]).isEmpty()) {
                    userRepository.save(createUser(patient[0], patient[1], Role.PATIENT, passwordEncoder));
                    System.out.println("Seeded patient: " + patient[0]);
                }
            }
        };
    }

    private User createUser(String username, String rawPassword, Role role, PasswordEncoder encoder) {
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole(role);
        return u;
    }
}
