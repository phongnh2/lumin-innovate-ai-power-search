/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, GqlArgumentsHost } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import {
  capitalize, chunk, flatten, isNil, isObject,
} from 'lodash';
import * as moment from 'moment';
import { v4 as uuidV4 } from 'uuid';
import validator from 'validator';
import { CountryCodes } from 'validator/lib/isISO31661Alpha2';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { popularDomains, PopularEducationDomainSubStrings } from 'Common/constants/OrganizationConstants';

import { AdminRoleLevel, AdminRoleType } from 'Admin/admin.enum';
import { CountryCode } from 'Auth/countryCode.enum';
import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { IGqlResponse } from 'Auth/interfaces/IGqlResponse';
import { DocumentOwnerTypeEnum, DocumentRoleEnum } from 'Document/document.enum';
import { FolderRoleEnum, FolderTypeEnum } from 'Folder/folder.enum';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { PaymentCurrencyEnums } from 'Payment/payment.enum';
import { TemplateOwnerTypeEnum, TemplateRole } from 'Template/template.enum';
import { UserPasswordStrengthEnums } from 'User/user.enum';

export const ORG_ROLES_ORDER = {
  [OrganizationRoleEnums.MEMBER]: 1,
  [OrganizationRoleEnums.BILLING_MODERATOR]: 2,
  [OrganizationRoleEnums.ORGANIZATION_ADMIN]: 3,
};

const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'];

export class Utils {
  public static parseAuthHeader(hdrValue) {
    if (typeof hdrValue !== 'string') {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const matches = CommonConstants.AUTH_HEADER_REGEX.exec(hdrValue);
    return matches && { scheme: matches[1], value: matches[2] };
  }

  public static getRpcRequest(context: ExecutionContext) {
    const ctx = context.switchToRpc();
    return ctx.getData();
  }

  public static getGqlRequest(context: ExecutionContext): IGqlRequest {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  public static getGqlResponse(context: ExecutionContext): IGqlResponse {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().res;
  }

  public static getGqlArgs(context: ExecutionContext) {
    const ctx = GqlArgumentsHost.create(context);
    return ctx.getArgs();
  }

  public static async isRequestFromMobile(contextRequest: IGqlRequest): Promise<boolean> {
    const headerCustomValue = contextRequest.headers[CommonConstants.MOBILE_REQUEST_HEADER];
    const userId = contextRequest.user?._id;
    if (!userId || !headerCustomValue) {
      return false;
    }
    const key = `${userId}:mobile`;
    return bcrypt.compare(key, headerCustomValue as string);
  }

  public static isWsRequestFromMobile(contextRequest: ExecutionContext) {
    const client = contextRequest.switchToWs().getClient();
    return Boolean(client.handshake.query[CommonConstants.MOBILE_REQUEST_HEADER]);
  }

  public static validateDocumentName(name: string): boolean {
    const trimmedName = name.trim();
    const nameWithoutExtension = name.substring(0, name.lastIndexOf('.'));
    return trimmedName.length > 0 && nameWithoutExtension.length <= 255;
  }

  public static validateEmail(email: string): boolean {
    return validator.isEmail(String(email).toLowerCase());
  }

  public static validatePassword(data: string): boolean {
    // Bypass since password strength is planned to be removed
    return true;
    const password = data.trim();
    const passwordStrength = this.calculatePasswordStrength(password);
    return [UserPasswordStrengthEnums.MEDIUM, UserPasswordStrengthEnums.STRONG].includes(passwordStrength);
  }

  /**
   * @deprecated
  */
  public static calculatePasswordStrength(password: string): UserPasswordStrengthEnums {
    const passwordTrimmed = password.trim();
    const lengthMatches = passwordTrimmed.length >= 8 && passwordTrimmed.length <= 255;
    if (!lengthMatches) {
      return UserPasswordStrengthEnums.WEAK;
    }
    const lowerCaseMatches = passwordTrimmed.match(/[a-z]/g);
    const upperCaseMatches = passwordTrimmed.match(/[A-Z]/g);
    const numberMatches = passwordTrimmed.match(/\d/g);
    const matchConditionArray = [lowerCaseMatches, upperCaseMatches, numberMatches];
    const countMatchCondition = matchConditionArray.filter(Boolean).length;
    switch (countMatchCondition) {
      case 2:
        return UserPasswordStrengthEnums.MEDIUM;
      case 3:
        return UserPasswordStrengthEnums.STRONG;
      default:
        return UserPasswordStrengthEnums.WEAK;
    }
  }

  public static validateAdminPassword(password: string): boolean {
    // eslint-disable-next-line prefer-regex-literals
    const pattern = new RegExp((/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)[^\n ]{8,}$/));
    return pattern.test(password);
  }

  public static validateNumberRange(data: number, min: number, max: number): boolean {
    return (data >= min && data <= max);
  }

  public static async hashPassword(password: string): Promise<string> {
    const pass256 = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    const hash = await bcrypt.hash(pass256, 10);
    return hash;
  }

  public static getFileNameWithoutExtension(fileName: string): string {
    return fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
  }

  public static getExtensionFile(fileName: string): string {
    return fileName.includes('.') ? fileName.split('.').pop() : '';
  }

  public static convertFileExtensionToPdf(fileName: string): string {
    return fileName.replace(/\.[^.]+$/, '.pdf');
  }

  public static removeMultiSpacing(fileName: string): string {
    const name = this.getFileNameWithoutExtension(fileName).trim();
    const extension = this.getExtensionFile(fileName);
    const newName = `${name}.${extension}`;
    return newName;
  }

  public static encryptData(data, key) {
    const cipher = crypto.createCipheriv(CommonConstants.ALGORITHM, Buffer.from(key), CommonConstants.CRYPTO_IV);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  public static decryptData(data, key) {
    const encryptedText = Buffer.from(data, 'hex');
    const decipher = crypto.createDecipheriv(CommonConstants.ALGORITHM, Buffer.from(key), CommonConstants.CRYPTO_IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  public static comparePassword(candidatePassword: string, password: string): Promise<boolean> {
    const candidatePasswordsha256 = crypto
      .createHash('sha256')
      .update(candidatePassword)
      .digest('hex');
    return bcrypt.compare(`${candidatePasswordsha256}`, password);
  }

  public static capitalizeAllWords(string: string): string {
    return string.split('-').map((word) => capitalize(word)).join(' ');
  }

  public static getUserShortName(username: string) : string {
    return username
      .split(' ')
      .filter((word) => word)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  public static isHigherRoleInOrg(firstRole: string, secondRole: string, acceptEqual: boolean = false): boolean {
    const firstOrder = ORG_ROLES_ORDER[firstRole];
    const secondOrder = ORG_ROLES_ORDER[secondRole];
    return firstOrder && secondOrder && (acceptEqual ? firstOrder >= secondOrder : firstOrder > secondOrder);
  }

  public static isHigherOrEqualRoleInOrg(firstRole: string, secondRole: string): boolean {
    return Utils.isHigherRoleInOrg(firstRole, secondRole, true);
  }

  public static calculateStringSizeInKB(str: string): number {
    return Buffer.byteLength(str, 'utf8') / 1024;
  }

  /**
   * @param firstRole
   * @param secondRole
   * @returns {number}
   * 1: if firstRole > secondRole
   * 0: if firstRole = secondRole
   * -1: if firstRole < secondRole
   */
  public static compareAdminRoles(firstRole: AdminRoleType, secondRole: AdminRoleType): number {
    const firstRoleLevel = AdminRoleLevel[firstRole];
    const secondRoleLevel = AdminRoleLevel[secondRole];
    let result = 0;
    if (firstRoleLevel > secondRoleLevel) result = 1;
    if (firstRoleLevel < secondRoleLevel) result = -1;
    return result;
  }

  // Format date string as pattern 'MM/DD/YYYY'
  public static formatDate(date: Date): string {
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  public static formatPrice(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  static async removeFile(filePath: string) : Promise<boolean> {
    const isExist = await Utils.isFileExisted(filePath);
    if (!isExist) {
      return true;
    }
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve(true);
      });
    });
  }

  static isFileExisted(filePath: string) : Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  static convertToLocalTime(originDate: Date | string, timeZoneOffset: number): moment.Moment {
    const date = new Date(originDate);
    const utcDate = moment.utc(date);
    const convertDate = moment(utcDate).utcOffset(
      0 - timeZoneOffset,
    );

    return convertDate;
  }

  static escapeRegExp(str: string): string {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  static transformToSearchRegex(searchKey: string): RegExp {
    const escapeRegExp = Utils.escapeRegExp(searchKey.toLowerCase().trim());
    return new RegExp(`${escapeRegExp}`);
  }

  static transformToOrgEmailDomainRegex(domain: string): RegExp {
    const escapeRegExp = Utils.escapeRegExp(domain.toLowerCase().trim());
    return new RegExp(`[@]${escapeRegExp}`);
  }

  static mapDocumentRoleToOwnerType(documentRole: DocumentRoleEnum): DocumentOwnerTypeEnum {
    const mapObject = {
      [DocumentRoleEnum.OWNER]: DocumentOwnerTypeEnum.PERSONAL,
      [DocumentRoleEnum.TEAM]: DocumentOwnerTypeEnum.TEAM,
      [DocumentRoleEnum.ORGANIZATION_TEAM]: DocumentOwnerTypeEnum.ORGANIZATION_TEAM,
      [DocumentRoleEnum.ORGANIZATION]: DocumentOwnerTypeEnum.ORGANIZATION,
    };
    return mapObject[documentRole];
  }

  static mapTemplateRoleOwnerType(templateRole: TemplateRole): TemplateOwnerTypeEnum {
    const mapObject = {
      [TemplateRole.OWNER]: TemplateOwnerTypeEnum.PERSONAL,
      [TemplateRole.ORGANIZATION_TEAM]: TemplateOwnerTypeEnum.ORGANIZATION_TEAM,
      [TemplateRole.ORGANIZATION]: TemplateOwnerTypeEnum.ORGANIZATION,
    };
    return mapObject[templateRole];
  }

  static isInternalOrgMember(email: string, organization: IOrganization): boolean {
    const emailDomain: string = Utils.getEmailDomain(email);
    const { associateDomains } = organization;
    return emailDomain === organization.domain || associateDomains.includes(emailDomain);
  }

  static getSizeUnit(originSize: number) : string {
    let index = 0;
    let size = originSize;
    while (size > 1024 && index < SIZE_UNITS.length - 1) {
      size /= 1024;
      index++;
    }
    return `${Number(size).toFixed(1)} ${SIZE_UNITS[index]}`;
  }

  static getEmailUsername(email: string): string {
    return email.split('@')[0];
  }

  static getEmailDomain(email: string): string {
    return email.split('@')[1];
  }

  static seperateArray(array: any[], numElements: number): any {
    const numSegments = Math.ceil(array.length / numElements);
    const seperatedArray = [];
    for (let i = 0; i < numSegments; i++) {
      const segment = array.slice(i * numElements, numElements * (i + 1));
      seperatedArray.push(segment);
    }
    return seperatedArray;
  }

  static mapFolderPermissionToType(folderRole: FolderRoleEnum): FolderTypeEnum {
    const mapObject = {
      [FolderRoleEnum.OWNER]: FolderTypeEnum.PERSONAL,
      [FolderRoleEnum.ORGANIZATION_TEAM]: FolderTypeEnum.ORGANIZATION_TEAM,
      [FolderRoleEnum.ORGANIZATION]: FolderTypeEnum.ORGANIZATION,
    };
    return mapObject[folderRole];
  }

  static camelToSnakeCase(camelString: string): string {
    return camelString.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
  }

  static toSnakeCaseKeys(obj): Record<string, any> {
    return obj && Object.keys(obj).reduce((accumulator, key) => {
      accumulator[this.camelToSnakeCase(key)] = obj[key];
      return accumulator;
    }, {}) || {};
  }

  static convertCurrencySymbol(currency: PaymentCurrencyEnums): string {
    const currencyConvert = {
      [PaymentCurrencyEnums.CAD]: '$',
      [PaymentCurrencyEnums.NZD]: '$',
      [PaymentCurrencyEnums.USD]: '$',
      [PaymentCurrencyEnums.EUR]: '€',
    };
    return currencyConvert[currency?.toUpperCase()] || '$';
  }

  static validateEmailByDomains(email: string, domainList: string[]): boolean {
    const [, domain] = email.split('@');
    return domainList.includes(domain);
  }

  static createKeyedMap<T>(array: T[], keyStrategy: (v: T) => string | number): Record<string | number, T | undefined> {
    return array.reduce((map, item) => {
      map[keyStrategy(item)] = item;
      return map;
    }, {});
  }

  static iso8601 = (time: Date): string => time.toISOString().replace(/\.\d{3}Z$/, 'Z');

  static escapeUri = (uri: string): string => encodeURIComponent(uri).replace(/[!'()*]/g, Utils.hexEncode);

  static hexEncode = (c: string): string => `%${c.charCodeAt(0).toString(16).toUpperCase()}`;

  static convertToMs(hrtime: [number, number]): string {
    const ms = hrtime[0] * 1e3 + hrtime[1] * 1e-6;
    return ms.toFixed(3);
  }

  static getIpRequest(request: any): string {
    return request.headers[CommonConstants.X_FORWARDED_FOR_HEADER]
    || request.headers[CommonConstants.CF_CONNECTING_IP]
    || request.headers[CommonConstants.TRUE_CLIENT_IP]
    || CommonConstants.DEFAULT_IP_ADDRESS;
  }

  static getHashedIpRequest(request: any): string {
    const ipAddress = this.getIpRequest(request);
    return crypto.createHash('sha256')
      .update(ipAddress)
      .digest('hex');
  }

  static getTrackingContext(request: any): { anonymousUserId?: string; userAgent?: string } {
    return {
      anonymousUserId: request?.anonymousUserId || request.cookies?.[CommonConstants.ANONYMOUS_USER_ID_COOKIE],
      userAgent: request?.headers?.['user-agent'],
    };
  }

  static hashConstraintKey(key: string): string {
    return crypto.createHash('shake256', { outputLength: 5 })
      .update(key)
      .digest('hex');
  }

  static convertToPreviewUpcomingInvoiceParams(params: Record<string, any>): Record<string, any> {
    delete params.payment_behavior;
    const { subscription, customer } = params;
    const convertedParams = Object.keys(params).reduce((previewParams, key) => {
      if (['subscription', 'customer'].includes(key)) {
        return previewParams;
      }
      previewParams[`subscription_${key}`] = params[key];
      return previewParams;
    }, {});
    return {
      ...(subscription && { subscription }),
      ...(customer && !subscription && { customer }),
      ...convertedParams,
    };
  }

  static truncateOjectKeyAndValue(obj: Record<string, string>, maxKeyLength: number, maxValueLength: number): Record<string, string> {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const _key = key.length > maxKeyLength ? key.slice(0, maxKeyLength) : key;
      const _value = value.length > maxValueLength ? value.slice(0, maxValueLength) : value;
      acc[_key] = _value;
      return acc;
    }, {});
  }

  static recursiveFlattenObject(obj: Record<string, unknown>, prefix = '', seperator = '_'): Record<string, any> {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}${seperator}` : '';
      const value = obj[k];
      if (isNil(value)) {
        return acc;
      }
      const _key = `${pre}${k}`;
      if (Array.isArray(value)) {
        acc[_key] = JSON.stringify(value);
        return acc;
      }
      if (isObject(value)) {
        Object.assign(acc, this.recursiveFlattenObject(value as Record<string, unknown>, _key, seperator));
        return acc;
      }
      acc[_key] = String(value);
      return acc;
    }, {} as Record<string, string>);
  }

  static ConvertArrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
    const buffer = Buffer.alloc(arrayBuffer.byteLength);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  static getGeoLocationFromRequestHeaders(request: IGqlRequest): { countryCode: CountryCode; city: string; region: string } {
    const code = request.headers[CommonConstants.CF_IPCOUNTRY];
    const city = request.headers[CommonConstants.CF_IPCITY];
    const region = request.headers[CommonConstants.CF_REGION];
    if (code && CountryCodes.has(code)) {
      return { countryCode: code, city, region };
    }
    return { countryCode: undefined, city: undefined, region: undefined };
  }

  static appendMetadataToArgs(ctx: ExecutionContext, metadata: Record<string, any>): void {
    const args = ctx.getArgs();
    const metadataIndex = args.findIndex((arg) => arg?.metadata);
    if (metadataIndex !== -1) {
      args[metadataIndex] = Object.assign(args[metadataIndex], { metadata });
    } else {
      args.push({ metadata });
    }
  }

  // For mongodb text search
  static getSearchString(searchString: string) {
    // Longest substring with exact one delimiter
    let longestSubstring = '';
    searchString.split(/([^a-zA-Z0-9]+)/g).forEach((item, index, arr) => {
      if (!item.match(/[^a-zA-Z0-9]+/)) {
        return;
      }
      const subStr = arr[index - 1] + arr[index] + arr[index + 1];
      if (subStr.length > longestSubstring.length) {
        longestSubstring = subStr;
      }
    });
    return longestSubstring || searchString;
  }

  static verifyDomain(value: string): boolean {
    const domain: string = value.includes('@') ? this.getEmailDomain(value) : value;
    return popularDomains[domain];
  }

  static generateOrgNameByEmail(email: string): string {
    const domain = this.getEmailDomain(email);
    const username = this.getEmailUsername(email);
    const isPopularDomain = this.verifyDomain(email);

    if (isPopularDomain) {
      return capitalize(username);
    }
    return capitalize(domain.split('.')[0]);
  }

  static getSameUnpopularDomainEmails(checkEmail: string, emails: string[]): string[] {
    return emails.filter((email) => checkEmail === this.getEmailDomain(email) && !this.verifyDomain(email));
  }

  static checkSameUnpopularDomainEmail(x: string, y: string): boolean {
    return this.getEmailDomain(x) === this.getEmailDomain(y) && !this.verifyDomain(y);
  }

  static async executeQueryInChunk<T>(ids: string[], excuteQuery: (ids: string[]) => Promise<T | T[]>): Promise<T[]> {
    const splitIds = chunk(ids, CommonConstants.MAX_LIMIT_PER_IN_OPERATOR);
    const results = await Promise.all(splitIds.map(excuteQuery));
    return flatten(results);
  }

  static isBusinessDomain(email: string): boolean {
    const domain = this.getEmailDomain(email);
    const splitDomain = domain.split('.');
    const isEducationDomain = PopularEducationDomainSubStrings.some((subString) => splitDomain.includes(subString));
    return !this.verifyDomain(domain) && !isEducationDomain;
  }

  static async measureExecutionTime<T>(
    { fn } :
    { fn: () => T | Promise<T> },
  ): Promise<{ result: T; executionTimeMs: number }> {
    const executionId = uuidV4();
    const startMark = `${executionId}_start`;
    const endMark = `${executionId}_end`;
    const measureName = `${executionId}_execution_time`;

    performance.mark(startMark);

    let result: T;
    let executionTimeMs: number;

    try {
      // execute the function (handles both sync and async functions)
      result = await Promise.resolve(fn());
    } finally {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measurement = performance.getEntriesByName(measureName)[0];
      executionTimeMs = measurement.duration;

      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    }

    return { result, executionTimeMs };
  }

  /**
   * Breaks non-Lumin URLs by inserting zero-width spaces to prevent email clients from auto-linking.
   * URLs from luminpdf.com (including subdomains) are preserved as clickable links.
   */
  static breakNonLuminUrls(text: string): string {
    const urlRegex = /(https?:\/\/[^\s<]+)/gi;
    return text.replace(urlRegex, (url) => {
      const isLuminDomain = /^https?:\/\/([-\w]+\.)?luminpdf\.com(\/|$)/i.test(url);
      if (isLuminDomain) {
        return url;
      }
      return url.replace(/(https?:\/\/|\.)/gi, '$1\u200B');
    });
  }
}
