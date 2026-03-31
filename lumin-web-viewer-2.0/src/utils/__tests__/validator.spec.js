import validator from '../validator';
import { featureStoragePolicy } from 'features/FeatureConfigs';
import { TOOLS_NAME } from '../../constants/toolsName';
import { FEATURE_USED_ONCE_FROM_FLP_FOR_LOGIN_USER } from '../../constants/lumin-common';

describe('validator', () => {
  describe('getValidMergeFileSize', () => {
    it('should return 0 if document is not provided', () => {
      expect(validator.getValidMergeFileSize(null)).toBe(0);
    });
    it('should return file size', () => {
      expect(validator.getValidMergeFileSize({ premiumToolsInfo: { maximumMergeSize: 10 } })).toBe(10 * 1024 * 1024);
    });
  });

  describe('isEmail', () => {
    it('should return true if email is valid', () => {
      expect(validator.isEmail('test@gmail.com')).toBe(true);
    });
  });

  describe('validateEmailByDomains', () => {
    it('should return true if email is valid', () => {
      expect(validator.validateEmailByDomains('test@gmail.com', ['gmail.com'])).toBe(true);
    });
  });

  describe('isEmailInWhiteList', () => {
    it('should return true if email is in white list', () => {
      expect(validator.isEmailInWhiteList('test@gmail.com', ['gmail.com'])).toBe(false);
    });
  });

  describe('validateEmailLength', () => {
    it('should return true', () => {
      expect(validator.validateEmailLength('nhuttm+001@dgroup.co')).toBe(true);
    });
  });

  describe('validateNameLength', () => {
    it('should return true', () => {
      expect(validator.validateNameLength('Tran Minh Nhut')).toBe(true);
    });
  });

  describe('validateOrgAndTeamNameLength', () => {
    it('should return true if org and team name is valid', () => {
      expect(validator.validateOrgAndTeamNameLength('Tran Minh Nhut')).toBe(true);
    });
  });

  describe('validatePasswordLength', () => {
    it('should return true if password is valid', () => {
      expect(validator.validatePasswordLength('12345678')).toBe('');
    });

    it('should return error message if password is not valid', () => {
      expect(validator.validatePasswordLength('1234567')).toBeUndefined();
    });

    it('should return error message if password is too long', () => {
      expect(validator.validatePasswordLength('yeyeyeyeyeyeyeyeyeyeyeyeyeyeyyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyyeyeyeyeye')).toBeUndefined();
    });
  });

  describe('validateNameUrl', () => {
    it('should return true if name url is valid', () => {
      expect(validator.validateNameUrl('KoPhaiVu')).toBe(true);
    });
  });

  describe('validateNameHtml', () => {
    it('should return true if html is valid', () => {
      expect(validator.validateNameHtml('<div>KoPhaiVu</div>')).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should return true if input is number', () => {
      expect(validator.validateNumber(10)).toBe(true);
    });
  });

  describe('validateInputPages', () => {
    it('should return true if input is number', () => {
      expect(validator.validateInputPages(10)).toBe(true);
    });
  });

  describe('validatePremiumPersonal', () => {
    it('should return true if user is premium personal', () => {
      expect(validator.validatePremiumPersonal({ payment: { type: 'PREMIUM' } })).toBe(true);
    });
  });

  describe('validatePremiumOrganization', () => {
    it('should return true if organization is premium', () => {
      expect(validator.validatePremiumOrganization({ payment: { type: 'PREMIUM' } })).toBe(true);
    });
  });

  describe('validatePremiumUser', () => {
    it('should return true if user plan different free plan', () => {
      expect(
        validator.validatePremiumUser({ payment: { type: 'PREMIUM' } })
      ).toBe(true);
    });

    it('should return false if user is free plan and all organizations are free plan', () => {
      const orgs = [{ organization: { payment: { type: 'FREE' } } }];
      const currentUser = { payment: { type: 'FREE' } };
      expect(
        validator.validatePremiumUser(currentUser, orgs)
      ).toBe(false);
    });
  });

  describe('validateFirstTimeUsedFeature', () => {
    it('should not provide parameter', () => {
      expect(validator.validateFirstTimeUsedFeature()).toBe(false);
    });
  });

  describe('validateFirstTimeUsedFeatureGuestMode', () => {
    it('should not provide parameter', () => {
      expect(validator.validateFirstTimeUsedFeatureGuestMode()).toBe(false);
    });
  });

  describe('validateFeature', () => {
    it('should return "Signin Required"', () => {
      const validate = validator.validateFeature({
        currentUser: null,
        toolName: TOOLS_NAME.FREEHAND,
      });
      expect(validate).toBe('Sign In Required');
    });

    it('should return "Premium Feature"', () => {
      const validate = validator.validateFeature({
        currentUser: {
          payment: {
            type: 'FREE',
          },
        },
        currentDocument: {
          roleOfDocument: 'EDITOR',
          premiumToolsInfo:{
            formBuilder: false,
          },
        },
        toolName: 'FormBuilder',
      });
      expect(validate).toBe('Premium Feature');
    });

    it('should return "Permission Required"', () => {
      const validate = validator.validateFeature({
        currentUser: {
          payment: {
            type: 'FREE',
          },
        },
        toolName: TOOLS_NAME.FREEHAND,
        currentDocument: {
          roleOfDocument: 'VIEWER',
          documentStatus: {
            isPremium: true,
          },
        },
        toolName: 'MergePage',
      });
      expect(validate).toBe('Permission Required');
    });

    it('should return empty string', () => {
      const validate = validator.validateFeature({
        currentUser: {
          payment: {
            type: 'PREMIUM',
          },
        },
        currentDocument: {
          roleOfDocument: 'EDITOR',
          documentStatus: {
            isPremium: true,
          },
          premiumToolsInfo:{
            formBuilder: true,
          },
      },
      toolName: 'FormBuilder'
      });
      expect(validate).toBe('');
    });

    it('toolName not provided', () => {
      const validate = validator.validateFeature({
        currentUser: {},
        currentDocument: null,
      });
      expect(validate).toBe('Sign In Required');
    });

    it('should return empty string when tool is allowed in TEMP_EDIT_MODE_ALLOWED_TOOLS', () => {
      const validate = validator.validateFeature({
        currentUser: { payment: { type: 'FREE' } },
        currentDocument: {
          temporaryEdit: true,
        },
        toolName: 'shapeTools',
      });
      expect(validate).toBe('');
    });

    it('should return "Premium Feature" when currentMergeSize exceeds max merge size', () => {
      const toolName = TOOLS_NAME.MERGE_PAGE;
      const currentDocument = {
        roleOfDocument: 'EDITOR',
        premiumToolsInfo: {
          maximumMergeSize: 5,
        },
      };
      const currentMergeSize = 6 * 1024 * 1024;
      const validate = validator.validateFeature({
        currentUser: { payment: { type: 'FREE' } },
        currentDocument,
        toolName,
        currentMergeSize,
      });
    
      expect(validate).toBe('Premium Feature');
    });

    it('should return "Unsupported File Type" when feature is not enabled for mimeType', () => {
      const featureName = 'someFeature';
      const mimeType = 'application/pdf';
  
      jest.spyOn(featureStoragePolicy, 'isFeatureEnabledForMimeType').mockReturnValue(false);
  
      const validate = validator.validateFeature({
        currentUser: { payment: { type: 'PREMIUM' } },
        currentDocument: { mimeType },
        toolName: TOOLS_NAME.FREEHAND,
        featureName,
      });
  
      expect(validate).toBe('Unsupported File Type');  
    });
    
    it('should return "Premium Feature" when sync tool is not enabled', () => {
      const toolName = 'SyncOneDrive';
      const currentDocument = {
        roleOfDocument: 'EDITOR',
        premiumToolsInfo: {
          externalSync: {
            dropboxSync: false,
          },
        },
      };
    
      const validate = validator.validateFeature({
        currentUser: { payment: { type: 'FREE' } },
        currentDocument,
        toolName,
      });
    
      expect(validate).toBe('Premium Feature');
    });
    
    it('should return "Premium Feature" when document summarization is not enabled', () => {
      const toolName = TOOLS_NAME.DOCUMENT_SUMMARIZATION;
      const currentDocument = {
        roleOfDocument: 'EDITOR',
        premiumToolsInfo: {
          documentSummarization: {
            enabled: false,
          },
        },
      };
      const validate = validator.validateFeature({
        currentUser: { payment: { type: 'FREE' } },
        currentDocument,
        toolName,
      });
    
      expect(validate).toBe('Premium Feature');
    });
  });

  describe('validateCardholderName', () => {
    it('should return error message if cardholder name is not valid', () => {
      expect(validator.validateCardholderName('')).toBeUndefined();
    });

    it('should return error message if cardholder name is too long', () => {
      expect(validator.validateCardholderName('a'.repeat(27))).toBeUndefined();
    });

    it('should return error message if cardholder name contains invalid characters', () => {
      expect(validator.validateCardholderName('a@b')).toBeUndefined();
    });

    it('should return empty string if cardholder name is valid', () => {
      expect(validator.validateCardholderName('a b')).toBe('');
    });
  });

  describe('validateTeamName', () => {
    it('should return empty string if team name is valid', () => {
      expect(validator.validateTeamName('a b')).toBe('');
    });

    it('should return error message if teamName length is invalid', () => {
      expect(validator.validateTeamName()).toBe(undefined);
    });

    it('should return error message if team name too long', () => {
      expect(validator.validateTeamName('kophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivu.com')).toBe(undefined);
    });

    it('should return error message if team name url', () => {
      expect(validator.validateTeamName('https://www.google.com')).toBe(undefined);
    });

    it('should return error message if team name html', () => {
      expect(validator.validateTeamName('<div>kophaivu</div>')).toBe(undefined);
    });
  });

  describe('validateOrgName', () => {
    it('should return error message if org name is not valid', () => {
      expect(validator.validateOrgName('')).toBe(undefined);
    });
    it('should return error message if org name is too long', () => {
      expect(validator.validateOrgName('kophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivu.com')).toBe(undefined);
    });
    it('should return error message if org name url', () => {
      expect(validator.validateOrgName('https://www.google.com')).toBe(undefined);
    });
    it('should return error message if org name html', () => {
      expect(validator.validateOrgName('<div>kophaivu</div>')).toBe(undefined);
    });
    it('should return empty string if org name is valid', () => {
      expect(validator.validateOrgName('kophaivu')).toBe('');
    });
  });

  describe('validateDocumentName', () => {
    it('should return error message if document name is not valid', () => {
      expect(validator.validateDocumentName('')).not.toBeUndefined();
    });
    it('should return error message if document name is too long', () => {
      expect(validator.validateDocumentName('kophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivukophaivu')).not.toBeUndefined();
    });
    it('should return empty string if document name is valid', () => {
      expect(validator.validateDocumentName('kophaivu')).not.toBeUndefined();
    });
  });

  describe('isSlashEnding', () => {
    it('should return true if document name is valid', () => {
      expect(validator.isSlashEnding('kophaivu/')).toBe(true);
    });
    it('should return false if document name is not valid', () => {
      expect(validator.isSlashEnding('')).toBe(false);
    });
  });

  describe('findDuplicatedContinueSlashCharacter', () => {
    it('should return true if document name is valid', () => {
      expect(validator.findDuplicatedContinueSlashCharacter('kophaivu//')).toBe(true);
    });
  });

  describe('hasNumberAfterDot', () => {
    it('should return true if document name is valid', () => {
      expect(validator.hasNumberAfterDot('kophaivu.1')).toBe(true);
    });
    it('should return false if document name is not valid', () => {
      expect(validator.hasNumberAfterDot('kophaivu')).toBe(false);
    });
  });

  describe('validateEmailWithValidAtCharacter', () => {
    it('validateEmailWithValidAtCharacter < 65 char before @', () => {
      expect(validator.validateEmailWithValidAtCharacter('tuannha@gmail.com')).toBe(true);
    });
    it('validateEmailWithValidAtCharacter > 64 char before @', () => {
      expect(validator.validateEmailWithValidAtCharacter('tuannhatuannhatuannhatuannshasssssssssssstssasnssssssssssssssssha@gmail.com')).toBe(false);
    });
  });

  describe('validateDomainEducation', () => {
    it('valid domain', () => {
      expect(validator.validateDomainEducation('tientranmac@cc.va.us')).toBe(true);
    });
  });

  describe('validateWhitelistUrl', () => {
    it('should return false if url is not valid', () => {
      expect(validator.validateWhitelistUrl('https://www.google.com/test')).toBe(false);
    });
  });
});
