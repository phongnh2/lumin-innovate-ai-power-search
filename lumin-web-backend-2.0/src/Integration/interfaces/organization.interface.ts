export type OrganizationBasicInfoResponseProto = {
  id: string;
  name: string;
  owner: string;
  user_role: string;
  total_members: number;
  total_spaces: number;
  created_at: number;
};

export type OrganizationMemberProto = {
  id: string;
  email: string;
  name: string;
  role: string;
  joined_at: number;
  last_active_at: number;
}

export type OrganizationMembersResponseProto = {
  total_count: number;
  limit: number;
  page: number;
  total_members: number;
  members: OrganizationMemberProto[];
}
