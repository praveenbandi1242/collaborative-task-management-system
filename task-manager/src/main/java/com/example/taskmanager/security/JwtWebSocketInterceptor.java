package com.example.taskmanager.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtWebSocketInterceptor
        implements ChannelInterceptor {

    private final JwtService jwtService;

    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        StompCommand command =
                accessor.getCommand();

        /*
         * ============================================================
         * CONNECT
         * ============================================================
         */
        if (StompCommand.CONNECT.equals(command)) {

            System.out.println(
                    "WebSocket CONNECT received"
            );

            String authorization =
                    accessor.getFirstNativeHeader(
                            "Authorization"
                    );

            if (authorization == null ||
                    !authorization.startsWith("Bearer ")) {

                throw new IllegalArgumentException(
                        "Missing WebSocket Authorization header"
                );
            }

            String token =
                    authorization.substring(7);

            try {

                String username =
                        jwtService.extractUsername(token);

                System.out.println(
                        "WebSocket JWT user: "
                                + username
                );

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                if (!jwtService.isTokenValid(
                        token,
                        userDetails
                )) {

                    throw new IllegalArgumentException(
                            "Invalid JWT"
                    );
                }

                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                /*
                 * THIS is the important part.
                 *
                 * Attach Authentication as the STOMP Principal.
                 */
                accessor.setUser(authentication);

                /*
                 * Tell Spring that the modified accessor
                 * should be retained.
                 */
                accessor.setLeaveMutable(true);

                System.out.println(
                        "WebSocket JWT authentication successful: "
                                + username
                );

                System.out.println(
                        "Principal attached to CONNECT: "
                                + accessor.getUser()
                );

            } catch (Exception ex) {

                System.out.println(
                        "WebSocket JWT authentication failed: "
                                + ex.getMessage()
                );

                throw new IllegalArgumentException(
                        "Invalid WebSocket JWT",
                        ex
                );
            }
        }

        /*
         * ============================================================
         * SUBSCRIBE / OTHER STOMP MESSAGES
         * ============================================================
         *
         * DO NOT authenticate again here.
         *
         * Spring should carry the Principal attached during CONNECT.
         */
        else {

            System.out.println(
                    "WebSocket "
                            + command
                            + " Principal: "
                            + accessor.getUser()
            );
        }

        return message;
    }
}