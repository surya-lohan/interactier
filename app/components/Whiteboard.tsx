import dynamic from "next/dynamic"
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
    async () => ((await import("@excalidraw/excalidraw")).Excalidraw),
    {
        ssr: false
    }
);

export default function Whiteboard() {
    return (
        <div className="absolute inset-0">
            <Excalidraw />
        </div>
    )
}