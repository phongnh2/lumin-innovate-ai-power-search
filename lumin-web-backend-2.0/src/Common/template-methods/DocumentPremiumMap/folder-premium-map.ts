import { ORIGINAL_FOLDER_PERMISSION_ROLE } from 'Common/constants/FolderConstants';
import { DocumentPremiumMap, IsUsingPremium } from 'Common/template-methods/DocumentPremiumMap/document-premium-map';
import { PremiumDocumentMap } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { DocumentTab } from 'graphql.schema';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { UserService } from 'User/user.service';

class FolderDocumentPremiumMap extends DocumentPremiumMap {
  private _folderId: string;

  constructor(
    private readonly _folderService: FolderService,
    private readonly _userService: UserService,
  ) {
    super();
  }

  protected personal(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  protected organization(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  protected starred(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  protected shared(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  atTab(_tab: DocumentTab): this {
    throw new Error('Method not implemented.');
  }

  atFolder(folderId: string): this {
    this._folderId = folderId;
    return this;
  }

  async get({ documents }: IsUsingPremium): Promise<PremiumDocumentMap> {
    if (!this._folderId) {
      throw new Error('Missing folderId');
    }
    const [folderPermission] = await this._folderService.getFolderPermissions({
      folderId: this._folderId, role: { $in: ORIGINAL_FOLDER_PERMISSION_ROLE },
    });

    const isPersonalFolder = folderPermission.role === FolderRoleEnum.OWNER;

    let isUsingPremium = false;
    if (isPersonalFolder) {
      const user = await this._userService.findUserById(folderPermission.refId);
      isUsingPremium = await this._userService.isAvailableUsePremiumFeature(user);
    } else {
      const resource = await this._folderService.getResourceByFolderPermission(folderPermission);
      isUsingPremium = resource?.payment?.type !== PaymentPlanEnums.FREE;
    }

    return documents.reduce((acc, document) => {
      acc[document._id] = isUsingPremium;
      return acc;
    }, {});
  }
}

export { FolderDocumentPremiumMap };
