import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const RoomPage = () => {

    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);



  
    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log("New User joined room", emailId)
        const offer = await createOffer();
        socket.emit("call-user", { emailId: emailId, offer });
        setRemoteEmailId(emailId);

    },[createOffer, socket])

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer } = data;
        console.log("Incoming call from ", from, offer)
        try {
            // await peer.setRemoteDescription(new RTCSessionDescription(offer));

            const ans = await createAnswer(offer);

            socket.emit("call-accepted", { emailId: from, ans })
            console.log("call Accepted and sent further");
            setRemoteEmailId(from);
        } catch (err) {
            console.log("Error in handling Incoming Call", err);
        }
    }, [createAnswer, socket]);



    const handleCallAccepted = useCallback(async (data) => {

        const { ans } = data;
        console.log("Call got Accepted", ans)
        await setRemoteAns(ans)


    }, [setRemoteAns])


    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        setMyStream(stream)
    }, [])


    const handleNegotiation = useCallback(() => {

        console.log("Oopss !!! Negotiation Needed");
        const localOffer = peer.localDescription;
        socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });

    }, [peer.localDescription, remoteEmailId, socket])





    useEffect(() => {
        socket.on("user-joined", handleNewUserJoined);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);

        return () => {
            socket.off("user-joined", handleNewUserJoined);
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
        }



    }, [handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket])



    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream])


    useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegotiation)

        return () => {
            peer.removeEventListener("nogotiationeeded", handleNegotiation);
        }
    }, [handleNegotiation, peer])



    return (
        <div className="room-page-cotainer">
            <h1>Room Page for stream sharing</h1>
            <h2>You are connected to {remoteEmailId}</h2>
            <button onClick={(e) => sendStream(myStream)}>Send My Video</button>
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing />

        </div>
    )
}

export default RoomPage;