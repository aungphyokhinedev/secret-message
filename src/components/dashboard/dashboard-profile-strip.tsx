"use client";

import { useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

const AVATAR_BUCKET = "avatars";

type DashboardProfileStripProps = {
  currentUsername: string;
  currentAvatarUrl: string | null;
};

function extFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase().trim();
  return ext && ext.length <= 5 ? ext : "png";
}

/** Avatar + @username + email — sits outside the main dashboard card. */
export function DashboardProfileStrip({ currentUsername, currentAvatarUrl }: DashboardProfileStripProps) {
  const supabase = useSupabaseBrowser();
  const { t } = useUiLanguage();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function onSelectAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be 5MB or smaller.");
      return;
    }

    setAvatarPending(true);
    setAvatarError(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setAvatarError("Sign in again to upload your avatar.");
        return;
      }

      const ext = extFromName(file.name);
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setAvatarError(
          `Upload failed: ${uploadError.message}. Ensure storage bucket "${AVATAR_BUCKET}" exists and allows authenticated uploads.`,
        );
        return;
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl) {
        setAvatarError("Could not create avatar URL.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (profileError) {
        setAvatarError(profileError.message);
        return;
      }

      setAvatarUrl(publicUrl);
    } finally {
      setAvatarPending(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <div className="flex min-h-10 items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={avatarPending}
            onClick={() => avatarInputRef.current?.click()}
            className="h-8 w-8 rounded-full p-0 hover:bg-transparent hover:opacity-90 disabled:opacity-60"
            aria-label={t("Upload avatar", "Avatar တင်ရန်")}
            title={t("Click avatar to upload photo", "Avatar ကိုနှိပ်ပြီး ဓာတ်ပုံတင်ရန်")}
          >
            <Avatar src={avatarUrl} size={32} className="h-8 w-8" />
          </Button>
          <Input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onSelectAvatar(e.target.files?.[0] ?? null)}
            disabled={avatarPending}
          />
          <span className="max-w-[min(200px,50vw)] truncate text-sm font-medium text-foreground">
            @{currentUsername}
          </span>
        </div>
      </div>
      {avatarError ? <p className="mt-1 text-sm text-destructive">{avatarError}</p> : null}
    </div>
  );
}
