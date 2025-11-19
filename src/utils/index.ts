const pageMap: Record<string, string> = {
  Feed: "/",
  AddSleep: "/add",
  Profile: "/profile",
};

export const createPageUrl = (pageName: keyof typeof pageMap | string) => {
  return pageMap[pageName as keyof typeof pageMap] ?? "/";
};
