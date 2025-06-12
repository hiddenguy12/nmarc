/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import express, { Request, Response, json as ExpressJsonMidleware, urlencoded, RequestHandler, NextFunction } from 'express';
import { NODE_ENV, PORT } from './config/env';
import { connectDB } from './config/connectDB';
import authRouter from './main_routes/auth';
import searchRouter from './main_routes/search';
import assetsRouter from './main_routes/assets';
import profileRouter from './main_routes/profile';
import dataRouter from './main_routes/data';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { cors } from './config/cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io'
import adminRouter from './main_routes/admin';
import path from 'node:path';
import membershipRouter from './main_routes/Membership';
import coinManagementRouter from './main_routes/coinManagement';
import connectionRequestRouter from './main_routes/connectionRequest'
import userActionsRouter from './main_routes/user_actions';
import expensesRouter from './main_routes/expenses';
import { User } from './models/user';
import { randomVideoCallSocketService } from './sockets/randomVideoCall.socket';
import { NotificationSocketService } from './sockets/notification.socket';
import configureChatMessagingSocket from './sockets/chat.messaging.socket';
import { error, log } from 'node:console';
import generateMatrimonyId from './lib/core/mid-geneator';
import { randomIntFromArray } from './lib/core/randomInt';
import { friendRoutes } from './main_routes/friends';


const app: express.Application = express();
const port: number = Number(PORT ?? 4000)
const server = createServer(app).listen(port);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['POST', 'GET', 'DELETE', 'PUT']
    }
});

randomVideoCallSocketService.getInstance(io.of('/random-video-call'));
// configOnlineStatusSocket(io.of('/socket/online-status-management'))
const NotificationService = NotificationSocketService.getInstance(io.of('/socket/notifications'));
configureChatMessagingSocket(io.of('/socket/chat-messaging'));




async function main() {

    await connectDB();
    // environment
    app.use(async function (req: Request, res: Response, next: NextFunction) {
        req.notifications = NotificationService;
        next()
    });
    app.use(cookieParser());
    app.use(ExpressJsonMidleware());
    app.use(express.static('public'));
    app.use(cors)
    app.set('view engine', 'ejs')
    NODE_ENV === 'developement' && app.use(morgan('dev'));
    app.set('trust proxy', 'loopback');
    // routes
    app.use('/api/auth', authRouter);
    app.use('/api/search', searchRouter);
    app.use('/api/assets', assetsRouter);
    app.use('/api/profile', profileRouter);
    app.use('/api/data', dataRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/friend-request', connectionRequestRouter);
    app.use('/api/membership', membershipRouter);
    app.use('/api/coins', coinManagementRouter);
    app.use('/api/user-actions', userActionsRouter);
    app.use('/api/expenses', expensesRouter);
    app.use('/api', friendRoutes)

    app.get('*', async function (req, res) {
        return res.sendFile(path.join(__dirname, '../public/index.html'));
    })

    console.log(`Server is Fire at http://localhost:${port}`)
}
main();