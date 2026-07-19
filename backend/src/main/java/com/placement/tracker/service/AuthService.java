package com.placement.tracker.service;

import com.placement.tracker.dto.*;
import com.placement.tracker.entity.*;
import com.placement.tracker.repository.*;
import com.placement.tracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse registerStudent(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Student student = Student.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .college(request.getCollege())
                .branch(request.getBranch())
                .cgpa(request.getCgpa())
                .role("STUDENT")
                .build();

        studentRepository.save(student);

        String token = jwtUtil.generateToken(student.getEmail(), student.getRole(), student.getId());
        return new AuthResponse(token, student.getRole(), student.getId(), student.getEmail(), student.getFullName());
    }

    public AuthResponse loginStudent(LoginRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(student.getEmail(), student.getRole(), student.getId());
        return new AuthResponse(token, student.getRole(), student.getId(), student.getEmail(), student.getFullName());
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole(), admin.getId());
        return new AuthResponse(token, admin.getRole(), admin.getId(), admin.getEmail(), admin.getFullName());
    }

    public void initAdmin() {
        if (!adminRepository.existsByEmail("admin@placement.com")) {
            Admin admin = Admin.builder()
                    .email("admin@placement.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Admin")
                    .role("ADMIN")
                    .build();
            adminRepository.save(admin);
        }
    }
}
