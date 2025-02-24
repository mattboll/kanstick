"use client";
import { useModal } from "./ModalContext";

export default function ScrollContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isModalOpen } = useModal();

  return (
    <div
      className="flex-1 p-4 overflow-x-auto"
      onMouseDown={(e) => {
        if (isModalOpen) return;

        const ele = e.currentTarget;
        const startX = e.pageX + ele.scrollLeft;
        const onMouseMove = (e: MouseEvent) => {
          ele.scrollLeft = startX - e.pageX;
        };
        const onMouseUp = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }}
    >
      {children}
    </div>
  );
}
