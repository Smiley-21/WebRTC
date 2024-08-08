import React, { useEffect, useState , useCallback } from "react";
import { useSocket} from "../providers/Socket"
import { useNavigate } from "react-router-dom";

const HomePage=()=>{

    const {socket} =useSocket()
    const navigate=useNavigate()

    const [email,setEmail]=useState()
    const [roomId,setRoomId]=useState();

    useEffect(()=>{
        socket.on("joined-room", handleRoomJoined)
        return ()=>{
            socket.off("joined-room",handleRoomJoined);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[socket])

    const handleJoinRoom=useCallback(()=>{
        if(email && roomId)
        {
            socket.emit("join-room",{emailId:email,roomId});
        }
        else{
            alert("Please enter both email and room ID");
        }
        

    },[email, roomId, socket])

    const handleRoomJoined=useCallback(({roomId})=>{
        navigate(`/room/${roomId}`)
     },[navigate])

    
    return (
        <div className="homepage-container">
            <div className="wrapper">
                <input type="email"  value={email}  onChange={e=>setEmail(e.target.value)} name="" id="" placeholder="Enter you email here" />
                <input type="text" value={roomId} onChange={e=>setRoomId(e.target.value)} name="" id="" placeholder="Enter Room Code" />
                <button onClick={handleJoinRoom}>Enter Room</button>
            </div>
        </div>
    )
}

export default HomePage;