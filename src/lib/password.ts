import { compare, hash } from "bcryptjs";

// Number of bcrypt salt rounds. 10 is the commonly recommended default --
// enough security for a teaching project without slowing down every login.
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return compare(plain, hashed);
}
