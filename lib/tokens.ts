import { customAlphabet, nanoid } from "nanoid";

/** Without 0/O and 1/I, so a code can be read back without ambiguity. */
export const VERIFICATION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const verificationCode = customAlphabet(VERIFICATION_CODE_ALPHABET, 5);

/** Long random token for links (/s/, /c/, /r/) and anonymous ids. */
export function generateToken(): string {
  return nanoid(24);
}

/** Short code for the reverse-OTP login message (e.g. "K7F2Q"). */
export function generateVerificationCode(): string {
  return verificationCode();
}
