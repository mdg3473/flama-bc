import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

export type VoiceParticipant = {
  id: string;
  muted: boolean;
  sharing: boolean;
  deafened: boolean;
};

type SignalPayload = {
  from: string;
  to: string | null;
  kind: "hello" | "offer" | "answer" | "ice" | "bye";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

/**
 * Simple WebRTC mesh voice + screen-share room signalled over Realtime broadcast.
 * Good for small rooms (up to ~8 people), which fits a youth-group channel.
 */
export const useVoiceRoom = (roomId: string | null, userId: string | undefined) => {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const localRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const stateRef = useRef({ muted: false, sharing: false, deafened: false });

  const send = useCallback((payload: SignalPayload) => {
    chanRef.current?.send({ type: "broadcast", event: "signal", payload });
  }, []);

  const syncPresence = useCallback(() => {
    if (!chanRef.current || !userId) return;
    chanRef.current.track({ id: userId, ...stateRef.current });
  }, [userId]);

  const attachTracks = useCallback((pc: RTCPeerConnection) => {
    localRef.current?.getTracks().forEach((t) => pc.addTrack(t, localRef.current!));
    screenRef.current?.getTracks().forEach((t) => pc.addTrack(t, screenRef.current!));
  }, []);

  const getPeer = useCallback(
    (peerId: string) => {
      let pc = peersRef.current[peerId];
      if (pc) return pc;
      pc = new RTCPeerConnection(RTC_CONFIG);
      peersRef.current[peerId] = pc;
      attachTracks(pc);
      pc.onicecandidate = (e) => {
        if (e.candidate && userId) {
          send({ from: userId, to: peerId, kind: "ice", candidate: e.candidate.toJSON() });
        }
      };
      pc.ontrack = (e) => {
        const stream = e.streams[0] ?? new MediaStream([e.track]);
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          pc.close();
          delete peersRef.current[peerId];
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[peerId];
            return next;
          });
        }
      };
      return pc;
    },
    [attachTracks, send, userId],
  );

  const offerTo = useCallback(
    async (peerId: string) => {
      if (!userId) return;
      const pc = getPeer(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send({ from: userId, to: peerId, kind: "offer", sdp: offer });
    },
    [getPeer, send, userId],
  );

  const renegotiateAll = useCallback(async () => {
    for (const peerId of Object.keys(peersRef.current)) {
      const pc = peersRef.current[peerId];
      pc.close();
      delete peersRef.current[peerId];
      await offerTo(peerId);
    }
  }, [offerTo]);

  // Join / leave the room
  useEffect(() => {
    if (!roomId || !userId) return;
    let cancelled = false;
    setConnecting(true);
    setError(null);

    const start = async () => {
      try {
        localRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });
      } catch {
        setError("Não consegui acessar seu microfone. Libere a permissão no navegador.");
      }
      if (cancelled) {
        localRef.current?.getTracks().forEach((t) => t.stop());
        return;
      }

      const channel = supabase.channel(`voice:${roomId}`, {
        config: { presence: { key: userId }, broadcast: { self: false } },
      });
      chanRef.current = channel;

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState() as Record<string, Array<VoiceParticipant>>;
          const list = Object.values(state)
            .map((entries) => entries[0])
            .filter(Boolean)
            .map((p) => ({ id: p.id, muted: !!p.muted, sharing: !!p.sharing, deafened: !!p.deafened }));
          setParticipants(list);
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          const pc = peersRef.current[key];
          if (pc) {
            pc.close();
            delete peersRef.current[key];
          }
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        })
        .on("broadcast", { event: "signal" }, async ({ payload }) => {
          const msg = payload as SignalPayload;
          if (!msg || msg.from === userId) return;
          if (msg.to && msg.to !== userId) return;
          try {
            if (msg.kind === "hello") {
              await offerTo(msg.from);
            } else if (msg.kind === "offer" && msg.sdp) {
              const existing = peersRef.current[msg.from];
              if (existing) {
                existing.close();
                delete peersRef.current[msg.from];
              }
              const pc = getPeer(msg.from);
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              send({ from: userId, to: msg.from, kind: "answer", sdp: answer });
            } else if (msg.kind === "answer" && msg.sdp) {
              const pc = peersRef.current[msg.from];
              if (pc && pc.signalingState === "have-local-offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              }
            } else if (msg.kind === "ice" && msg.candidate) {
              const pc = peersRef.current[msg.from];
              if (pc) await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
          } catch {
            /* ignore transient negotiation errors */
          }
        })
        .subscribe(async (status) => {
          if (status !== "SUBSCRIBED") return;
          stateRef.current = { muted: false, sharing: false, deafened: false };
          await channel.track({ id: userId, ...stateRef.current });
          send({ from: userId, to: null, kind: "hello" });
          setConnecting(false);
        });
    };

    start();

    return () => {
      cancelled = true;
      setConnecting(false);
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      localRef.current?.getTracks().forEach((t) => t.stop());
      localRef.current = null;
      screenRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current = null;
      if (chanRef.current) supabase.removeChannel(chanRef.current);
      chanRef.current = null;
      setRemoteStreams({});
      setParticipants([]);
      setSharing(false);
      setMuted(false);
      setDeafened(false);
    };
  }, [roomId, userId, getPeer, offerTo, send]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
      stateRef.current = { ...stateRef.current, muted: next };
      syncPresence();
      return next;
    });
  }, [syncPresence]);

  const toggleDeafen = useCallback(() => {
    setDeafened((d) => {
      const next = !d;
      stateRef.current = { ...stateRef.current, deafened: next };
      syncPresence();
      return next;
    });
  }, [syncPresence]);

  const stopShare = useCallback(async () => {
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null;
    stateRef.current = { ...stateRef.current, sharing: false };
    setSharing(false);
    syncPresence();
    await renegotiateAll();
  }, [renegotiateAll, syncPresence]);

  const startShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => { void stopShare(); });
      stateRef.current = { ...stateRef.current, sharing: true };
      setSharing(true);
      syncPresence();
      await renegotiateAll();
    } catch {
      /* user cancelled */
    }
  }, [renegotiateAll, stopShare, syncPresence]);

  const toggleShare = useCallback(() => {
    if (sharing) void stopShare();
    else void startShare();
  }, [sharing, startShare, stopShare]);

  return {
    participants,
    remoteStreams,
    muted,
    deafened,
    sharing,
    connecting,
    error,
    toggleMute,
    toggleDeafen,
    toggleShare,
    localStream: localRef,
  };
};