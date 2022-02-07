import express, { Express } from 'express';
import DotEnv from 'dotenv';
import path from 'path';
import * as http from 'http';
import * as socketio from 'socket.io';
import cors from 'cors';

import * as T from '../../shared/types';
import { handleConnection } from './client';
import { handleRoutes } from './rest/routes';

// access env vars
DotEnv.config({ path: path.resolve(process.cwd(), '.env') });

const port = process.env.SERVER_PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server<T.IClientToServerEvents, T.IServerToClientEvents, T.IInterServerEvents, T.IUser>(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
})

app.use(cors());
handleRoutes(app);
io.on('connection', handleConnection(io));
app.set('port', port);
httpServer.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port} 🚀`);
});