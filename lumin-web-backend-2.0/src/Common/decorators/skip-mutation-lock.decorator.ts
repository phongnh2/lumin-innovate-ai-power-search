import { SetMetadata } from '@nestjs/common';

export const SKIP_MUTATION_LOCK_KEY = 'skip-mutation-lock';

/**
 * Decorator to skip the global mutation lock for specific mutations.
 * Use this when a mutation should allow concurrent requests from the same user.
 */
export const SkipMutationLock = () => SetMetadata(SKIP_MUTATION_LOCK_KEY, true);
