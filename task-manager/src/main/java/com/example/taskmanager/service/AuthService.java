package com.example.taskmanager.service;

import com.example.taskmanager.dto.auth.*;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.enums.Role;
import com.example.taskmanager.exception.BadRequestException;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(
                request.email()
        )) {

            throw new BadRequestException(
                    "Email already registered"
            );
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(
                        passwordEncoder.encode(
                                request.password()
                        )
                )
                .role(Role.USER)
                .build();

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository
                .findByEmail(request.email())
                .orElseThrow();

        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build();

        String token =
                jwtService.generateToken(userDetails);

        return new LoginResponse(token);
    }
}