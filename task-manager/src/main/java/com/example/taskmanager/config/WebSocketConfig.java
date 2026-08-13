package com.example.taskmanager.config;

import com.example.taskmanager.security.JwtWebSocketInterceptor;
import com.example.taskmanager.security.WebSocketSubscriptionInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final JwtWebSocketInterceptor
            jwtWebSocketInterceptor;

    private final WebSocketSubscriptionInterceptor
            webSocketSubscriptionInterceptor;

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        registry.enableSimpleBroker(
                "/topic"
        );

        registry.setApplicationDestinationPrefixes(
                "/app"
        );
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "https://collaborative-task-manager-h8jt.onrender.com"
                );
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {

        registration.interceptors(
                jwtWebSocketInterceptor
        );
    }
}