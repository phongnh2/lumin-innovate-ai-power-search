import { TEAM_ROLES } from 'constants/teamConstant';

export class TeamUtilities {
  constructor({ team = {} }) {
    this.team = team;
  }

  getRole() {
    return this.team.roleOfUser;
  }

  isAdmin() {
    return this.getRole() === TEAM_ROLES.ADMIN;
  }

  isManager() {
    return this.isAdmin();
  }
}
