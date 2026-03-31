import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

export function updateSignaturePosition({ defaultList, updateSignatureValue, toPosition }:
  { defaultList: any[], updateSignatureValue: string, toPosition: number }): any[] {
  const currentPosition = defaultList.findIndex((signature) => updateSignatureValue === signature);
  if (currentPosition === -1) {
    throw GraphErrorException.BadRequest('Signature not found', DefaultErrorCode.BAD_REQUEST);
  }

  const updateSignaturePositions = [...defaultList];
  updateSignaturePositions.splice(currentPosition, 1);
  updateSignaturePositions.splice(toPosition === 0 ? defaultList.length : -toPosition, 0, updateSignatureValue);

  return updateSignaturePositions;
}

export default {
  updateSignaturePosition,
};
