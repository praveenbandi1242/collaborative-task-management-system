package com.example.taskmanager.security;

import com.example.taskmanager.entity.Project;
import com.example.taskmanager.repository.ProjectMemberRepository;
import com.example.taskmanager.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.messaging.support.ChannelInterceptor;

@Component
@RequiredArgsConstructor
public class WebSocketSubscriptionInterceptor
        implements ChannelInterceptor {

    private final ProjectRepository projectRepository;

    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        StompCommand command =
                accessor.getCommand();

        /*
         * Only protect SUBSCRIBE requests.
         */
        if (!StompCommand.SUBSCRIBE.equals(command)) {
            return message;
        }

        System.out.println(
                "========== WEBSOCKET SUBSCRIBE VALIDATION =========="
        );

        /*
         * Get the Principal attached during CONNECT.
         *
         * IMPORTANT:
         * getUser() returns Principal, not Authentication.
         */
        java.security.Principal principal =
                accessor.getUser();

        System.out.println(
                "WebSocket subscription principal: "
                        + principal
        );

        if (principal == null) {

            System.out.println(
                    "WebSocket subscription rejected: "
                            + "no principal"
            );

            throw new IllegalArgumentException(
                    "Unauthenticated WebSocket subscription"
            );
        }

        /*
         * Make sure it is actually authenticated.
         */
        if (principal instanceof Authentication authentication) {

            if (!authentication.isAuthenticated()) {

                throw new IllegalArgumentException(
                        "Unauthenticated WebSocket subscription"
                );
            }

        } else {

            throw new IllegalArgumentException(
                    "Invalid WebSocket authentication"
            );
        }

        /*
         * Extract destination.
         *
         * Expected:
         *
         * /topic/projects/1
         */
        String destination =
                accessor.getDestination();

        System.out.println(
                "WebSocket subscription destination: "
                        + destination
        );

        if (!StringUtils.hasText(destination)) {

            throw new IllegalArgumentException(
                    "WebSocket subscription destination is missing"
            );
        }

        /*
         * Only secure project destinations.
         */
        String prefix =
                "/topic/projects/";

        if (!destination.startsWith(prefix)) {

            System.out.println(
                    "Non-project WebSocket destination. "
                            + "Subscription allowed."
            );

            return message;
        }

        /*
         * Extract project ID.
         */
        String projectIdText =
                destination.substring(
                        prefix.length()
                );

        Long projectId;

        try {

            projectId =
                    Long.parseLong(projectIdText);

        } catch (NumberFormatException ex) {

            System.out.println(
                    "Invalid project ID: "
                            + projectIdText
            );

            throw new IllegalArgumentException(
                    "Invalid project ID"
            );
        }

        /*
         * Get authenticated username.
         */
        String email =
                principal.getName();

        System.out.println(
                "WebSocket subscription user: "
                        + email
        );

        /*
         * Find project.
         */
        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() -> {

                            System.out.println(
                                    "Project not found: "
                                            + projectId
                            );

                            return new IllegalArgumentException(
                                    "Project not found"
                            );
                        });

        /*
         * OWNER ACCESS
         */
        if (project.getOwner() != null &&
                project.getOwner().getEmail() != null &&
                project.getOwner()
                        .getEmail()
                        .equalsIgnoreCase(email)) {

            System.out.println(
                    "WebSocket subscription ALLOWED: "
                            + "project owner"
            );

            System.out.println(
                    "=================================================="
            );

            return message;
        }

        /*
         * MEMBER ACCESS
         */
        System.out.println(
                "Checking project membership..."
        );

        boolean isMember =
                projectMemberRepository
                        .findByProjectIdAndUserEmail(
                                projectId,
                                email
                        )
                        .isPresent();

        System.out.println(
                "Project membership result: "
                        + isMember
        );

        if (!isMember) {

            System.out.println(
                    "WebSocket subscription REJECTED: "
                            + "user is not a project member"
            );

            throw new IllegalArgumentException(
                    "You are not a member of this project"
            );
        }

        System.out.println(
                "WebSocket subscription ALLOWED: "
                        + email
                        + " -> "
                        + destination
        );

        System.out.println(
                "=================================================="
        );

        return message;
    }
}