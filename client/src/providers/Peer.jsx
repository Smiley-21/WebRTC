import React, { useEffect, useMemo, useState, useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext)

export const PeerProvider = (props) => {

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302" // Google's public STUN server
            },
            {
                urls: "turn:your-turn-server.com:3478",
                username: "user",
                credential: "pass"
            }
        ]
    }), []);
    
    const [remoteStream, setRemoteStream] = useState()


    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;

    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;

    }

    const setRemoteAns = async (ans) => {
        await peer.setRemoteDescription(ans);
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, stream)

        }

    }

    const handleTrackEvent = useCallback((ev) => {
        const stream = ev.streams;
        setRemoteStream(stream[0]);

    }, [])

   


    useEffect(() => {

        peer.addEventListener('track', handleTrackEvent)
        

        return () => {
            peer.removeEventListener("track", handleTrackEvent);
            
        }

    }, [ handleTrackEvent, peer])



    return (<PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream }}>
        {props.children}
    </PeerContext.Provider>)
}
