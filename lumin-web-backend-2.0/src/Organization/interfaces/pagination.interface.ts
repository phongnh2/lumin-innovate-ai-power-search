interface PageInfo {
    hasNextPage?: boolean,
    offset: number,
    limit: number
}

interface OrganizationMember {
    role: string,
    lastActivity: Date,
    joinDate: Date,
    user: Record<string, unknown>,
}

interface OrganizationMemberEdge {
  node: OrganizationMember,
  cursor?: string,
}

export {
  PageInfo,
  OrganizationMember,
  OrganizationMemberEdge,
};
