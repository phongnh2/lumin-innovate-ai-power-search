import SharedMemberType from '../SharedMemberType';

describe('SharedMemberType', () => {
  it('should export REQUEST_ACCESS constant', () => {
    expect(SharedMemberType.REQUEST_ACCESS).toBe('request-access');
  });

  it('should export INVITED_LIST constant', () => {
    expect(SharedMemberType.INVITED_LIST).toBe('invited-list');
  });

  it('should export MEMBERS constant', () => {
    expect(SharedMemberType.MEMBERS).toBe('members');
  });

  it('should have exactly 3 properties', () => {
    expect(Object.keys(SharedMemberType)).toHaveLength(3);
  });

  it('should be an object with string values', () => {
    expect(typeof SharedMemberType.REQUEST_ACCESS).toBe('string');
    expect(typeof SharedMemberType.INVITED_LIST).toBe('string');
    expect(typeof SharedMemberType.MEMBERS).toBe('string');
  });
});

