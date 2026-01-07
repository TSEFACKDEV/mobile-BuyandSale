import { io, Socket } from 'socket.io-client';
import { Notification } from '../store/notification/actions';
import pushNotificationService from './pushNotificationService';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private onNotificationCallback: ((notification: Notification) => void) | null = null;

  connect(userId: string, onNotification: (notification: Notification) => void): void {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;
    this.onNotificationCallback = onNotification;

    const serverUrl = 'http://192.168.1.28:3001';

    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;

      if (this.userId) {
        this.socket?.emit('join', this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', () => {
      this.handleReconnection();
    });

    this.socket.on('notification', (notificationData: Notification) => {
      if (this.onNotificationCallback) {
        this.onNotificationCallback(notificationData);
      }

      pushNotificationService.showNotification(
        notificationData.title,
        notificationData.message,
        { notificationId: notificationData.id, link: notificationData.link }
      );
    });

    this.socket.on('reconnect', () => {
      this.reconnectAttempts = 0;

      if (this.userId) {
        this.socket?.emit('join', this.userId);
      }
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;

    const delay = this.reconnectInterval * this.reconnectAttempts;

    setTimeout(() => {
      if (this.socket?.disconnected) {
        this.socket.connect();

        if (this.userId && this.socket?.connected) {
          this.socket.emit('join', this.userId);
        }
      }
    }, delay);
  }

  disconnect(): void {
    if (this.userId && this.socket?.connected) {
      this.socket.emit('leave', this.userId);
    }

    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
    this.onNotificationCallback = null;
    this.reconnectAttempts = 0;
  }
}

export default new SocketService();
