"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const env_1 = require("./config/env");
const connectDB_1 = require("./config/connectDB");
const auth_1 = __importDefault(require("./main_routes/auth"));
const search_1 = __importDefault(require("./main_routes/search"));
const assets_1 = __importDefault(require("./main_routes/assets"));
const profile_1 = __importDefault(require("./main_routes/profile"));
const data_1 = __importDefault(require("./main_routes/data"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = require("./config/cors");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const admin_1 = __importDefault(require("./main_routes/admin"));
const Membership_1 = __importDefault(require("./main_routes/Membership"));
const coinManagement_1 = __importDefault(require("./main_routes/coinManagement"));
const connectionRequest_1 = __importDefault(require("./main_routes/connectionRequest"));
const user_actions_1 = __importDefault(require("./main_routes/user_actions"));
const expenses_1 = __importDefault(require("./main_routes/expenses"));
const randomVideoCall_socket_1 = require("./sockets/randomVideoCall.socket");
const notification_socket_1 = require("./sockets/notification.socket");
const chat_messaging_socket_1 = __importDefault(require("./sockets/chat.messaging.socket"));
const friends_1 = require("./main_routes/friends");
const app = (0, express_1.default)();
const port = Number(env_1.PORT ?? 4000);
const server = (0, node_http_1.createServer)(app).listen(port);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['POST', 'GET', 'DELETE', 'PUT']
    }
});
randomVideoCall_socket_1.randomVideoCallSocketService.getInstance(io.of('/random-video-call'));
// configOnlineStatusSocket(io.of('/socket/online-status-management'))
const NotificationService = notification_socket_1.NotificationSocketService.getInstance(io.of('/socket/notifications'));
(0, chat_messaging_socket_1.default)(io.of('/socket/chat-messaging'));
async function main() {
    await (0, connectDB_1.connectDB)();
    // environment
    app.use(async function (req, res, next) {
        req.notifications = NotificationService;
        next();
    });
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_1.json)());
    app.use(express_1.default.static('public'));
    app.use(cors_1.cors);
    app.set('view engine', 'ejs');
    env_1.NODE_ENV === 'developement' && app.use((0, morgan_1.default)('dev'));
    app.set('trust proxy', 'loopback');
    // routes
    app.use('/api/auth', auth_1.default);
    app.use('/api/search', search_1.default);
    app.use('/api/assets', assets_1.default);
    app.use('/api/profile', profile_1.default);
    app.use('/api/data', data_1.default);
    app.use('/api/admin', admin_1.default);
    app.use('/api/friend-request', connectionRequest_1.default);
    app.use('/api/membership', Membership_1.default);
    app.use('/api/coins', coinManagement_1.default);
    app.use('/api/user-actions', user_actions_1.default);
    app.use('/api/expenses', expenses_1.default);
    app.use('/api', friends_1.friendRoutes);
    app.get('/', async function (req, res) {
        res.send('Hello World!');
    });
    console.log(`Server is Fire at http://localhost:${port}`);
}
main();
