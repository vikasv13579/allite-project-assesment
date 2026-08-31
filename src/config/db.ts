import mongoose from 'mongoose'
import 'dotenv/config'
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
export const connectDatabase = async () : Promise<void> =>{
     const uri = process.env.MONGODB_URI || 'mongodb+srv://vikasvcontact_db_user:IwBrcbuUWDnfiFWI@cluster0.ynynnba.mongodb.net'
     try {
        await mongoose.connect(uri)
        console.log('Database Connected Successfully')
     } catch (error) {
        console.error("Database connection error", error)
     }
}