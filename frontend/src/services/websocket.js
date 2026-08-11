import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/ws";

export const createProjectWebSocket = (
    projectId,
    onMessage,
    onStatusChange
) => {

    const token =
        localStorage.getItem("token");

    if (!token) {

        console.error(
            "WebSocket: JWT token not found"
        );

        onStatusChange?.("offline");

        return null;
    }

    console.log(
        "WebSocket: creating client for project",
        projectId
    );

    const client = new Client({

        brokerURL: WS_URL,

        connectHeaders: {
            Authorization: `Bearer ${token}`
        },

        reconnectDelay: 5000,

        debug: (message) => {

            console.log(
                "[STOMP]",
                message
            );
        },

        onConnect: () => {

            console.log(
                "WebSocket CONNECTED"
            );

            onStatusChange?.("connected");

            const destination =
                `/topic/projects/${projectId}`;

            console.log(
                "WebSocket subscribing to:",
                destination
            );

            client.subscribe(
                destination,
                (message) => {

                    console.log(
                        "WebSocket message received:",
                        message.body
                    );

                    try {

                        const event =
                            JSON.parse(
                                message.body
                            );

                        onMessage?.(event);

                    } catch (error) {

                        console.error(
                            "Invalid WebSocket message:",
                            error
                        );
                    }
                }
            );

            console.log(
                "WebSocket subscription successful:",
                destination
            );
        },

        onStompError: (frame) => {

            console.error(
                "STOMP broker error:",
                frame.headers["message"]
            );

            console.error(
                "STOMP error body:",
                frame.body
            );

            onStatusChange?.("offline");
        },

        onWebSocketOpen: () => {

            console.log(
                "WebSocket transport OPEN"
            );
        },

        onWebSocketClose: (event) => {

            console.log(
                "WebSocket transport CLOSED:",
                event
            );

            onStatusChange?.("offline");
        },

        onWebSocketError: (error) => {

            console.error(
                "WebSocket transport error:",
                error
            );

            onStatusChange?.("offline");
        }
    });

    onStatusChange?.("connecting");

    client.activate();

    return client;
};