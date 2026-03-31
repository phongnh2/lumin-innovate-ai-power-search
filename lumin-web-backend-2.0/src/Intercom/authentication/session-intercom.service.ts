import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';

import {
  INTERCOM_REDIS_TOKEN_PREFIX, INTERCOM_REDIS_TOKEN_TTL, INTERCOM_REDIS_TOKEN_USED_KEY,
} from 'Intercom/constants';
import { RequestIntercomTokenDto } from 'Intercom/dtos/request-intercom-token.dto';
import { RedisService } from 'Microservices/redis/redis.service';

@Injectable()
export class SessionIntercomService {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  generateEphemeralToken(dto: RequestIntercomTokenDto): { token: string, level: number } {
    const { ipAddress } = dto;

    const level = Math.floor(Math.random() * 3) + 2;
    const token = randomUUID();

    const value = this.generateValueIntercomHset(token, false, level);
    this.redisService.setIntercomSessionKey(INTERCOM_REDIS_TOKEN_PREFIX, {
      [ipAddress]: value,
    }, INTERCOM_REDIS_TOKEN_TTL);

    return { token, level };
  }

  async validateEphemeralToken(token: string, ipAddress: string, solution: number): Promise<boolean> {
    const hset = await this.redisService.getAllHsetData(INTERCOM_REDIS_TOKEN_PREFIX);

    const ipValue = hset.find((v) => v.key === ipAddress)?.value as string;
    const {
      token: hToken, used, level,
    } = this.extractTokenStatus(ipValue);

    if (token !== hToken || used) {
      return false;
    }

    const hash = createHash('sha256').update(`${token}:${solution}`).digest('hex');
    const isPow = hash.startsWith('0'.repeat(level));

    if (!isPow) {
      return false;
    }

    const newValue = this.generateValueIntercomHset(token, true, level);
    this.redisService.setHsetData(INTERCOM_REDIS_TOKEN_PREFIX, ipAddress, newValue);

    return true;
  }

  private extractTokenStatus(value: string): { token: string; used: boolean; level: number } {
    const parts = value.split(':');
    const map = Object.fromEntries(parts.map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), v.trim()];
    }));
    return {
      token: map[INTERCOM_REDIS_TOKEN_PREFIX],
      used: map[INTERCOM_REDIS_TOKEN_USED_KEY] === 'true',
      level: parseInt(map.level, 10),
    };
  }

  private generateValueIntercomHset(token: string, used: boolean, level: number): string {
    return [
      `${INTERCOM_REDIS_TOKEN_PREFIX}=${token}`,
      `${INTERCOM_REDIS_TOKEN_USED_KEY}=${used}`,
      `level=${level}`,
    ].join(':');
  }
}
