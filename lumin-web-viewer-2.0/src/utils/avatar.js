import { AXIOS_BASEURL } from 'constants/urls';

function getAvatar(avatarRemoteId) {
  return avatarRemoteId ? `${AXIOS_BASEURL}/user/getAvatar?remoteId=${avatarRemoteId}` : null;
}

function getTextAvatar(targetName) {
  if (!targetName) return null;
  const nameArray = targetName.split(' ');
  if (nameArray.length > 1) {
    const firstCharacter = nameArray[0].charAt(0);
    const lastCharacter = nameArray[nameArray.length - 1].charAt(0);
    return firstCharacter + lastCharacter;
  }
  return targetName.slice(0, 1);
}

function getAvatarFileSizeLimit(sizeLimit) {
  return Math.ceil(sizeLimit / 1000000) - 1;
}

export default {
  getAvatar,
  getTextAvatar,
  getAvatarFileSizeLimit,
};
