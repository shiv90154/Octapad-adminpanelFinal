import crypto from "crypto";

// Activation codes look like AB3D-9KXQ-7M2P — no 0/O/1/I to avoid confusion
// when someone reads it aloud or types it in by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateActivationCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < 3; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) {
      group += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}
