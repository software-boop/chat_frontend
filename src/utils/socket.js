import { io } from 'socket.io-client';
import { SERVER_URL } from './config';

const socket = io(SERVER_URL || window.location.origin, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
