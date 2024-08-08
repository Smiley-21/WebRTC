const express=require("express")
const bodyParser=require("body-parser")
const {Server}=require("socket.io")


const io=new Server(
    {
        cors:true,
    }
);



const app=express()

// middleware of  app
app.use(bodyParser.json())

const emailToSocketMapping=new Map();
const socketToEmailMapping=new Map();

//middleware of socket server
io.on("connection",(socket)=>{
    console.log("New Connection", socket.id)
  
    socket.on("join-room",(data)=>{
        const {emailId,roomId}=data;
        console.log("User",emailId,"Joined Room",roomId);

        emailToSocketMapping.set(emailId,socket.id);
        socketToEmailMapping.set(socket.id,emailId);
        socket.join(roomId);
        socket.emit("joined-room",{roomId});
        socket.broadcast.to(roomId).emit("user-joined",{emailId})
    });

    socket.on("call-user",(data)=>{
        const {emailId,offer}=data;
        const socketIdofNewJoined=emailToSocketMapping.get(emailId);
        const callfromEmail=socketToEmailMapping.get(socket.id);
        console.log("Call Sent from User ", socketIdofNewJoined,callfromEmail)
        console.log("Emailtocsocket", emailToSocketMapping);
        if(socketIdofNewJoined)
        {
            // console.log("Sending incoming-call to:", socketIdofNewJoined, { from: callfromEmail, offer });

            socket.to(socketIdofNewJoined).emit("incoming-call",{from:callfromEmail,offer})
        }else{
            console.log("User of new joining is not found in room",emailId);
        }

    })

    socket.on("call-accepted",(data)=>{
        const {emailId,ans}=data;
        const socketId=emailToSocketMapping.get(emailId);
        
        if(socketId)
        {

            socket.to(socketId).emit("call-accepted",{ans})
        }else{
            console.error("Call is not accepted at caller");
        }
    })

    socket.on("disconnect",()=>{
        console.log("Disconnected",socket.id)
        
        const emailId=socketToEmailMapping.get(socket.id);
        if(emailId)
        {
            emailToSocketMapping.delete(emailId);
        }
        socketToEmailMapping.delete(socket.id);
        console.log(`Removed mapping for ${socket.id} with emailId:${emailId} socket: ${socket.id}` )
    })
    
})




const PORT= 8000 || process.env.PORT
app.listen(PORT,(req,res)=>{
    console.log(`Http  Server is running at ${PORT}`);
})

io.listen(8001);