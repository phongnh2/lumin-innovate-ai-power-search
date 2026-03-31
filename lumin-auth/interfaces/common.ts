import { NextApiRequest } from 'next';
import React from 'react';

import { Identity } from '@/interfaces/ory';
import { User } from '@/proto/auth/common/User';

export type THookFormSubmitHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;

export type TIdentityRequest = NextApiRequest & { identity: Identity; sessionId: string; user: User | null };

export type Nullable<T> = T | null | undefined;
