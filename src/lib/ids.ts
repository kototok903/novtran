import { customAlphabet } from "nanoid";

const createId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export function createProjectId() {
  return `p_${createId()}`;
}

export function createChunkId() {
  return `c_${createId()}`;
}
