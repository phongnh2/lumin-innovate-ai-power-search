export default (members) =>
  members.map((member) => ({
    ...member,
    ...(member.userId && { _id: member.userId }),
    ...(member._id && { userId: member._id }),
  }));
