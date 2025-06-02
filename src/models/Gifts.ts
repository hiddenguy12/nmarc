/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { model, Schema } from 'mongoose';


interface IGift {
    name : string ;
    image : {
        url : string ;
        id : string;
    },
    coins : number
    createdAt : Date ,
    updatedAt : Date,
}

let schema = new Schema<IGift>({
    name : {
        type : String ,
        required : false 
    }, 
    image : {
        id : String ,
        url : String 
    },
    coins : Number ,
    
} , { timestamps : true });


const Gifts = model('Gift' , schema);

export default Gifts;