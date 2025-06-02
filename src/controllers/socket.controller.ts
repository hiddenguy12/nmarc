/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from "zod";
import { authSessionValidation } from "../lib/schema/auth.schema";
import AuthSession from "../models/AuthSession";
import VideoProfile from "../models/VideoProfile";


class SocketComtroller {
    constructor () {

    }
  

    public async createVideoCall() {

    }

    public async requestVideoCall() {

    }
}

const socketController=new SocketComtroller();


export default socketController;