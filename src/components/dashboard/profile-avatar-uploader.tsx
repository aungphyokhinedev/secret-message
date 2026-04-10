"use client";

import { useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { Input } from "@/components/ui/input";
import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";

type ProfileAvatarUploaderProps = {
  initialAvatarUrl: string | null;
};

const AVATAR_BUCKET = "avatars";

function extFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase().trim();
  return ext && ext.length <= 5 ? ext : "png";
}

export function ProfileAvatarUploader({ initialAvatarUrl }: ProfileAvatarUploaderProps) {
  const supabase = useSupabaseBrowser();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setPending(true);
    setStatus(null);
    setError(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Sign in again to upload your avatar.");
        return;
      }

      const ext = extFromName(file.name);
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setError(
          `Upload failed: ${uploadError.message}. Ensure storage bucket "${AVATAR_BUCKET}" exists and allows authenticated uploads.`,
        );
        return;
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl) {
        setError("Could not create avatar URL.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setAvatarUrl(publicUrl);
      setStatus("Avatar updated.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} size={52} className="h-13 w-13" />
        <div>
          <p className="text-sm font-medium text-white">Profile avatar</p>
          <p className="text-xs text-slate-400">Default icon is used when avatar is empty.</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => void onSelect(e.target.files?.[0] ?? null)}
          disabled={pending}
          className="h-auto border-white/15 bg-black/20 py-2 text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:font-semibold file:text-slate-950 hover:file:bg-cyan-300 disabled:opacity-60"
        />
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      {status ? <p className="mt-2 text-xs text-emerald-300">{status}</p> : null}
    </section>
  );
}
