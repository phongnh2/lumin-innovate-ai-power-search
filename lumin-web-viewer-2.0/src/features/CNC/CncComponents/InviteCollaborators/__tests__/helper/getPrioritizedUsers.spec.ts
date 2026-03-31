import { mockUsersWithNullId } from 'features/CNC/CncComponents/__mocks__/mockUser';
import { IUserResult } from 'interfaces/user/user.interface';

import getPrioritizedUsers from "../../helper/getPrioritizedUsers";

describe("getPrioritizedUsers", () => {
  it("should prioritize users with non-null _id and sort users with null _id last", () => {

    const result = getPrioritizedUsers(mockUsersWithNullId);
    expect(result[result.length-1]._id).toBe(null);
  });

  it('should return only the DEFAULT_NUMBER_OF_SELECTED_USERS users', () => {
    const result = getPrioritizedUsers(mockUsersWithNullId);
    expect(result).toHaveLength(5);
  });

  it('should return an empty array when input array is empty', () => {
    const users: IUserResult[] = [];
    const result = getPrioritizedUsers(users);
    expect(result).toEqual([]);
  });
});
