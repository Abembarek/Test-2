export function canEditDocument(user, doc) {
  return user?.uid && doc?.ownerId === user.uid;
}

export function canViewDocument(user, doc) {
  return (
    user?.uid &&
    (doc?.ownerId === user.uid || doc?.sharedWith?.includes(user.uid))
  );
}
