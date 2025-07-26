import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp?: string;
}

export interface UseWebSocketOptions {
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    onMessage?: (message: WebSocketMessage) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);

    const {
        onOpen,
        onClose,
        onError,
        onMessage,
        reconnectAttempts = 3,
        reconnectInterval = 3000
    } = options;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionState('connecting');

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                setConnectionState('connected');
                reconnectAttemptsRef.current = 0;
                onOpen?.();
            };

            ws.onclose = () => {
                setIsConnected(false);
                setConnectionState('disconnected');
                onClose?.();

                // Attempt to reconnect
                if (reconnectAttemptsRef.current < reconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                setConnectionState('error');
                onError?.(error);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);
                    onMessage?.(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            setConnectionState('error');
            console.error('WebSocket connection error:', error);
        }
    }, [url, onOpen, onClose, onError, onMessage, reconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setConnectionState('disconnected');
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    const sendRawMessage = useCallback((type: string, data: any) => {
        return sendMessage({ type, data });
    }, [sendMessage]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        connectionState,
        lastMessage,
        connect,
        disconnect,
        sendMessage,
        sendRawMessage
    };
}
