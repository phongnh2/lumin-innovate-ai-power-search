import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import { IUser } from 'User/interfaces/user.interface';

import {
  DomainRulesConfig,
  DomainRulesConfigSchema,
  RuleSet,
} from './domain-rules.schema';

@Injectable()
export class CustomRuleLoader {
  private config: DomainRulesConfig;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    this.config = this.loadYamlConfig();
  }

  private loadYamlConfig(): DomainRulesConfig {
    const env = this.environmentService.getByKey(EnvConstants.ENV) || 'development';

    const configDir = path.resolve(process.cwd(), 'src', 'CustomRules', 'config');

    const basePath = path.join(configDir, 'base.yaml');
    const envPath = path.join(configDir, `${env}.yaml`);

    const baseConfig = this.loadYamlFile(basePath);
    const envConfig = this.loadYamlFile(envPath);

    this.loggerService.info({
      context: 'CustomRuleLoader',
      message: 'Loading domain rules config',
      extraInfo: {
        env, baseConfig, envConfig, configDir, basePath, envPath,
      },
    });

    return {
      defaults: baseConfig.defaults,
      policies: baseConfig.policies,
      tenants: envConfig.tenants,
    };
  }

  private loadYamlFile(filePath: string): DomainRulesConfig {
    if (!fs.existsSync(filePath)) {
      return { defaults: undefined, policies: {}, tenants: {} };
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawConfig = yaml.load(fileContent) as any;

    return DomainRulesConfigSchema.parse(rawConfig);
  }

  private deepMergeRuleSet(
    base: RuleSet | undefined,
    override: RuleSet | undefined,
  ): RuleSet | undefined {
    if (!base && !override) return undefined;
    if (!base) return override;
    if (!override) return base;

    return {
      organization: {
        ...base.organization,
        ...override.organization,
      },
      files: {
        ...base.files,
        ...override.files,
      },
      collaboration: {
        ...base.collaboration,
        ...override.collaboration,
      },
      external: {
        ...base.external,
        ...override.external,
      },
      ui: {
        ...base.ui,
        ...override.ui,
      },
      user: {
        ...base.user,
        ...override.user,
      },
    };
  }

  getRulesForDomain(domain: string): RuleSet {
    const tenant = this.config.tenants?.[domain] || {};
    const policy = tenant.policy ? this.config.policies?.[tenant.policy] || {} : {};

    let merged = this.deepMergeRuleSet(this.config.defaults, policy);
    merged = this.deepMergeRuleSet(merged, tenant);

    return merged;
  }

  getRulesForUser(user: IUser): RuleSet {
    const userDomain = Utils.getEmailDomain(user.email);
    return this.getRulesForDomain(userDomain);
  }

  getOrgIdsFromDomain(domains: string[]): string[] {
    return domains.map((domain) => {
      const rules = this.getRulesForDomain(domain);
      return rules?.organization?.domainOrgId;
    }).filter(Boolean);
  }

  getConfiguredDomains(): string[] {
    return Object.keys(this.config.tenants || {});
  }

  getAllowToChangeEmailDomains(): string[] {
    const domains: string[] = [];
    Object.entries(this.config.tenants || {}).forEach(([domain]) => {
      const rules = this.getRulesForDomain(domain);
      if (rules?.user?.allowChangeEmail) {
        domains.push(domain);
      }
    });
    return domains;
  }

  getAllTenantConfigurations(): Record<string, RuleSet> {
    const allConfigurations: Record<string, RuleSet> = {};
    const configuredDomains = this.getConfiguredDomains();

    configuredDomains.forEach((domain) => {
      allConfigurations[domain] = this.getRulesForDomain(domain);
    });

    return allConfigurations;
  }

  get restrictedDomains(): string[] {
    return this.getConfiguredDomains();
  }
}
