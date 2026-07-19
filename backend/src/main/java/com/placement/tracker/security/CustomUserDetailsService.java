package com.placement.tracker.security;

import com.placement.tracker.entity.Admin;
import com.placement.tracker.entity.Student;
import com.placement.tracker.repository.AdminRepository;
import com.placement.tracker.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try student first
        var student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            Student s = student.get();
            return new User(s.getEmail(), s.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));
        }

        // Try admin
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            Admin a = admin.get();
            return new User(a.getEmail(), a.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
