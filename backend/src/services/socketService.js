const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { role, id, hospitalId } = socket.user;

    if (role === 'provider' && hospitalId) {
      socket.join(`hospital:${hospitalId}`);
    }
    if (role === 'super_admin') {
      socket.join('super_admin');
    }
    if (role === 'patient') {
      socket.join(`patient:${id}`);
    }

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  return io;
}

function notifyHospital(hospitalId, event, data) {
  if (io) io.to(`hospital:${hospitalId}`).emit(event, data);
}

function notifySuperAdmin(event, data) {
  if (io) io.to('super_admin').emit(event, data);
}

function notifyPatient(patientId, event, data) {
  if (io) io.to(`patient:${patientId}`).emit(event, data);
}

module.exports = { init, getIO, notifyHospital, notifySuperAdmin, notifyPatient };
