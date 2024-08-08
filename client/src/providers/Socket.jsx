import React, { useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null);

export const useSocket = () => {
    return React.useContext(SocketContext);
}

export const SocketProvider = (props) => {

    const socket = useMemo(() => {
        console.log("Creating socket connection....")
        const socketInstance = io("http://localhost:8001", { transports: ["websocket"] });
        return socketInstance;
    }, []);





    return (
        <SocketContext.Provider value={{ socket }}>
            {props.children}
        </SocketContext.Provider>
    )

}