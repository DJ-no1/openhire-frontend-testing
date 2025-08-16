import { useEffect, useState, useRef, useCallback } from 'react';

type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useWebSocket(
  url: string,
  onMessage: (data: any) => void,
  onError: (error: string) => void
) {
  const [connectionStatus, setConnectionStatus] = useState<WSStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnectionStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempts.current = 0;
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        onError('Failed to parse message');
      }
    };

    ws.onerror = () => {
      setConnectionStatus('error');
      onError('WebSocket connection error');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectTimeout.current = window.setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, Math.pow(2, reconnectAttempts.current) * 1000);
      }
    };
  }, [url, onMessage, onError]);

  const sendMessage = useCallback((msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    wsRef.current?.close();
    setConnectionStatus('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      wsRef.current?.close();
    };
  }, []);

  return { connectionStatus, sendMessage, connect, disconnect };
}
