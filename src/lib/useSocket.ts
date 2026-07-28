"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface InventoryUpdateData {
  itemId: string;
  company: string;
  quantity: number;
  name?: string;
}

interface CartActivityData {
  company: string;
  totals: Record<string, number>; // { itemId: totalQtyInCarts }
}

// Shared singleton socket for the entire app
let sharedSocket: Socket | null = null;
let socketRefCount = 0;

function getSharedSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    sharedSocket.on("connect", () => {
      console.log("[Socket.io] Connected:", sharedSocket?.id);
    });
    sharedSocket.on("disconnect", (reason) => {
      console.log("[Socket.io] Disconnected:", reason);
    });
  }
  socketRefCount++;
  return sharedSocket;
}

function releaseSharedSocket() {
  socketRefCount--;
  if (socketRefCount <= 0 && sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
    socketRefCount = 0;
  }
}

/**
 * Custom hook that connects to the Socket.io server and listens for
 * inventory update events.
 */
export function useInventorySocket(
  onInventoryUpdate: (data: InventoryUpdateData) => void,
  companySlug?: string
) {
  const callbackRef = useRef(onInventoryUpdate);

  useEffect(() => {
    callbackRef.current = onInventoryUpdate;
  }, [onInventoryUpdate]);

  useEffect(() => {
    const socket = getSharedSocket();

    if (companySlug) {
      socket.emit("join:company", companySlug);
    }

    const handler = (data: InventoryUpdateData) => {
      console.log("[Socket.io] Inventory updated:", data);
      callbackRef.current(data);
    };

    socket.on("inventory:updated", handler);

    return () => {
      socket.off("inventory:updated", handler);
      releaseSharedSocket();
    };
  }, [companySlug]);
}

/**
 * Emit the current cart state to the server so admin sees live cart activity.
 * Call this whenever the cart changes.
 */
export function emitCartUpdate(
  company: string,
  items: { itemId: string; quantity: number }[]
) {
  const socket = getSharedSocket();
  socket.emit("cart:update", { company, items });
  // Don't release here — the socket is shared and managed by hooks
}

/**
 * Listen for cart activity events (used by admin pages, but available
 * for any page that wants to show live cart totals).
 */
export function useCartActivity(
  onCartActivity: (data: CartActivityData) => void,
  companySlug?: string
) {
  const callbackRef = useRef(onCartActivity);

  useEffect(() => {
    callbackRef.current = onCartActivity;
  }, [onCartActivity]);

  useEffect(() => {
    const socket = getSharedSocket();

    if (companySlug) {
      socket.emit("join:company", companySlug);
    }

    const handler = (data: CartActivityData) => {
      console.log("[Socket.io] Cart activity:", data);
      callbackRef.current(data);
    };

    socket.on("cart:activity", handler);

    return () => {
      socket.off("cart:activity", handler);
      releaseSharedSocket();
    };
  }, [companySlug]);
}
