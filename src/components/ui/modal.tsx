import React, { ReactNode } from "react";

export const Modal = ({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const ModalTrigger = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="text-blue-500 hover:underline">
    {children}
  </button>
);

export const ModalContent = ({ children }: { children: ReactNode }) => (
  <div className="mt-4">{children}</div>
);

export const ModalHeader = ({ children }: { children: ReactNode }) => (
  <h2 className="text-lg font-bold">{children}</h2>
);

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 flex justify-end">{children}</div>
);
