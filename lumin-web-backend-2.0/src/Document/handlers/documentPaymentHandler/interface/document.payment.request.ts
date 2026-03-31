import * as moment from 'moment';

import { DocStackIntervalEnum } from 'Document/document.enum';
import { IOrganizationDocStack } from 'Organization/interfaces/organization.docStack.interface';

export interface IUpdateDocStackCommand {
  conditions: {
    orgId: IOrganizationDocStack['orgId'];
    documentIds: IOrganizationDocStack['documentId'][]
  };
  updatedObj: {
    expireAt: Date;
  }
}

class DocumentPaymentRequest {
  private documentIds: string[];

  private incrementTargetId: string;

  setDocumentIds(documentIds: string[]): DocumentPaymentRequest {
    this.documentIds = documentIds;
    return this;
  }

  setIncrementTargetId(targetId: string): DocumentPaymentRequest {
    this.incrementTargetId = targetId;
    return this;
  }

  build(params: { docStackStartDate: Date, interval: DocStackIntervalEnum }): IUpdateDocStackCommand {
    const { docStackStartDate, interval } = params;
    const currentDate = new Date();
    const numberOfMonths = moment(currentDate).diff(docStackStartDate, interval);
    const nextMonth = moment(docStackStartDate).add(numberOfMonths + 1, interval);
    return {
      conditions: { orgId: this.incrementTargetId, documentIds: this.documentIds },
      updatedObj: { expireAt: nextMonth.toDate() },
    };
  }
}

export default DocumentPaymentRequest;
