import membersFormater from '../membersFormater';

describe('membersFormater', () => {
  describe('does not have _id property', () => {
    it('should have bot userId and _id property', () => {
      const members = [{
        name: 'tien tranmac',
        userId: '123123',
      }];
      const result = membersFormater(members);
      expect(result._id).toEqual(result.userId);
    });
  });
  describe('does not have userId property', () => {
    it('should have bot userId and _id property', () => {
      const members = [{
        name: 'tien tranmac',
        _id: '123123',
      }];
      const result = membersFormater(members);
      expect(result.userId).toEqual(result._id);
    });
  });
});
