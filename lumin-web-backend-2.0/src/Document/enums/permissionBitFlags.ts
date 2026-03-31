/* eslint-disable no-multi-spaces */
/**
 * Permission bit flags for document access control
 * Each permission is represented as a bit in a bitmask
 */
export enum PermissionBitFlags {
  // Individual role bit flags
  SPECTATOR = 1, // 2^0 = 1
  VIEWER = 2,    // 2^1 = 2
  EDITOR = 4,    // 2^2 = 4
  SHARER = 8,    // 2^3 = 8
  OWNER = 16,    // 2^4 = 16

  // Combined permission sets
  ALL_PERMISSIONS = 31, // SPECTATOR | VIEWER | EDITOR | SHARER | OWNER = 31
}
