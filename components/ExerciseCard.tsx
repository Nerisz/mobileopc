import { ResizeMode, Video } from "expo-av";
import React, { useRef } from "react";
import { Image, Text, View } from "react-native";

type Props = {
  title: string;
  muscle: string;
  series: number;
  reps: number;
  restSec: number;
  mediaUrl?: string;
  thumbUrl?: string;
};

export function ExerciseCard({
  title,
  muscle,
  series,
  reps,
  restSec,
  mediaUrl,
  thumbUrl,
}: Props) {
  const isGif = mediaUrl?.toLowerCase().endsWith(".gif");
  const videoRef = useRef<Video>(null);

  return (
    <View
      style={{
        backgroundColor: "#1f1f1f",
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: "#bdbdbd", marginBottom: 12 }}>{muscle}</Text>

      {!!mediaUrl &&
        (isGif ? (
          <Image
            source={{ uri: mediaUrl }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: mediaUrl }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              marginBottom: 12,
            }}
            resizeMode={ResizeMode.COVER}
            usePoster={!!thumbUrl}
            posterSource={thumbUrl ? { uri: thumbUrl } : undefined}
            shouldPlay
            isMuted
            isLooping
          />
        ))}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pill text={`${series} séries`} />
        <Pill text={`${reps} reps`} />
        <Pill text={`${restSec}s descanso`} />
      </View>
    </View>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "#2a2a2a",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: "#ddd" }}>{text}</Text>
    </View>
  );
}
