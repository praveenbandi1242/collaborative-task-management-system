package com.example.taskmanager.util;

import com.example.taskmanager.entity.User;
import com.example.taskmanager.exception.UnauthorizedException;
import com.example.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new UnauthorizedException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Authenticated user not found"
                        )
                );
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}