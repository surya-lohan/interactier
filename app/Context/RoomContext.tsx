import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { SocketIOProvider } from "y-socket.io"
import * as Y from "yjs"
import { usercolors } from "../components/Whiteboard"
import * as random from 'lib0/random'

interface RoomContexType {
    yDoc: Y.Doc | null
    provider: SocketIOProvider | null
}

const roomContext = createContext<RoomContexType>({
    yDoc: null,
    provider: null
})

export const useRoom = () => useContext(roomContext);

export default function RoomContext({ roomId, children }: { roomId: string, children: React.ReactNode }) {

    const [yDoc, setYDoc] = useState<Y.Doc | null>(null)
    const [provider, setProvider] = useState<SocketIOProvider | null>(null);

    useEffect(() => {
        const doc = new Y.Doc();

        const socketProvider = new SocketIOProvider(
            `${location.protocol}//localhost:1234`,
            roomId,
            doc,
            { autoConnect: true }
        )

        const userColor = usercolors[random.uint32() % usercolors.length];
        socketProvider.awareness.setLocalStateField("user", {
            name: "Candidate_" + Math.floor(Math.random() * 100),
            color: userColor.color,
            colorLight: userColor.light,
        })

        setYDoc(doc);
        setProvider(socketProvider);

        return () => {
            socketProvider.disconnect();
            doc.destroy();
        }

    }, [roomId])
    return (
        <roomContext.Provider value={{ yDoc, provider }}>
            {children}
        </roomContext.Provider>
    )
}