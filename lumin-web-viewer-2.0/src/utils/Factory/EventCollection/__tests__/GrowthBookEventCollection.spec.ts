import { GrowthBookEventCollection } from '../GrowthBookEventCollection';
import { AWS_EVENTS } from 'constants/awsEvents';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

jest.mock('../EventCollection', () => ({
  EventCollection: class {
    record = jest.fn();
  },
}));

describe('GrowthBookEventCollection', () => {
  let collection: GrowthBookEventCollection;

  beforeEach(() => {
    collection = new GrowthBookEventCollection();
    jest.clearAllMocks();
  });

  test('should record variation view event', () => {
    const experiment = { key: 'exp1' };
    const result = { key: 1, name: 'A', hashAttribute: '', hashValue: '' };

    collection.trackVariationView({ experiment, result } as any);

    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.GROWTHBOOK.VARIATION_VIEW,
      attributes: {
        experimentId: 'exp1',
        variationId: 1,
        variationName: 'A',
      },
    });
  });

  test('should include organizationId when hashAttribute = ORG_ID', () => {
    const experiment = { key: 'exp2' };
    const result = { 
      key: 2, 
      name: 'B', 
      hashAttribute: KEY_ATTRIBUTES_GROWTH_BOOK.ORG_ID,
      hashValue: 'org-123'
    };

    collection.trackVariationView({ experiment, result } as any);

    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.GROWTHBOOK.VARIATION_VIEW,
      attributes: {
        experimentId: 'exp2',
        variationId: 2,
        variationName: 'B',
        organizationId: 'org-123',
      },
    });
  });
});
