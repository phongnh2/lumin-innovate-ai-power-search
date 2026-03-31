import moveField from '../moveField';

describe('moveField function', () => {
  const { getElementById } = document;

  beforeAll(() => {
    delete document.getElementById;
    document.getElementById = jest.fn(() => {
      return {
        focus: jest.fn()
      };
    });
  });

  afterAll(() => {
    document.getElementById = getElementById;
  });

  it('moveField should trigger focus', () => {
    const spy = jest.spyOn(document, 'getElementById');
    moveField({ keyCode: 13 }, 'test');
    expect(spy).toHaveBeenCalled();
  });
});
