import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MicOff, MonitorUp, ScreenShare } from "lucide-react";

type Profile = { id: string; full_name: string; avatar_url: string | null };

const RemoteMedia = ({
  stream,
  deafened,
  profile,
  muted,
  sharing,
}: {
  stream: MediaStream;
  deafened: boolean;
  profile?: Profile;
  muted?: boolean;
  sharing?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasVideo = stream.getVideoTracks().length > 0;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = deafened;
      void audioRef.current.play().catch(() => undefined);
    }
  }, [stream, deafened]);

  const initials = (profile?.full_name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative aspect-video rounded-2xl bg-[hsl(var(--dc-rail))] overflow-hidden flex items-center justify-center">
      <audio ref={audioRef} autoPlay />
      {hasVideo ? (
        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-contain" />
      ) : (
        <Avatar className="h-20 w-20">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name} />}
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
        {muted && <MicOff size={12} className="text-destructive" />}
        {sharing && <ScreenShare size={12} />}
        <span className="truncate max-w-[10rem]">{profile?.full_name ?? "Membro"}</span>
      </div>
    </div>
  );
};

export const VoiceStage = ({
  remoteStreams,
  participants,
  profiles,
  deafened,
  selfId,
  selfSharing,
  selfStream,
}: {
  remoteStreams: Record<string, MediaStream>;
  participants: { id: string; muted: boolean; sharing: boolean }[];
  profiles: Record<string, Profile>;
  deafened: boolean;
  selfId: string;
  selfSharing: boolean;
  selfStream: MediaStream | null;
}) => {
  const selfVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (selfVideo.current) selfVideo.current.srcObject = selfStream;
  }, [selfStream]);

  const others = participants.filter((p) => p.id !== selfId);

  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
      {selfSharing && (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-[hsl(var(--dc-rail))]">
          <video ref={selfVideo} autoPlay muted playsInline className="h-full w-full object-contain" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
            <MonitorUp size={12} /> Sua tela
          </div>
        </div>
      )}
      {others.map((p) => {
        const stream = remoteStreams[p.id];
        if (!stream) {
          const prof = profiles[p.id];
          const initials = (prof?.full_name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
          return (
            <div
              key={p.id}
              className="relative aspect-video rounded-2xl bg-[hsl(var(--dc-rail))] flex items-center justify-center"
            >
              <Avatar className="h-20 w-20 animate-pulse">
                {prof?.avatar_url && <AvatarImage src={prof.avatar_url} alt={prof.full_name} />}
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                conectando…
              </span>
            </div>
          );
        }
        return (
          <RemoteMedia
            key={p.id}
            stream={stream}
            deafened={deafened}
            profile={profiles[p.id]}
            muted={p.muted}
            sharing={p.sharing}
          />
        );
      })}
    </div>
  );
};