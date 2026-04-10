import type { Metadata } from "next";

import { HelpPageContent } from "@/components/landing/help-page-content";
import { LandingHeader } from "@/components/landing/landing-header";

export const metadata: Metadata = {
  title: "Help & how it works",
  description:
    "How to use SecretGift: sign in, share your profile link, send and receive Thingyan splashes and gifts.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HelpPageContent />
    </div>
  );
}
