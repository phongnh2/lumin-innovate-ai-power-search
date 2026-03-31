import { Model, Connection } from 'mongoose';

import { IMembership } from 'Team/interfaces/membership.interface';
import TeamSchema from 'Team/schemas/team.schema';

export default {
  provide: 'Team',
  useFactory: (connection: Connection, membershipModel: Model<IMembership>): Model<any> => {
    TeamSchema.post('deleteOne', async function (_, _team) {
      await membershipModel.deleteMany({ teamId: (this as any)._id });
    });
    return connection.model('Team', TeamSchema);
  },
  inject: ['DatabaseConnection', 'MembershipModel'],
};
