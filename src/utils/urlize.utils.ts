type ArrayPath = [string, ...string[]];
type Path = string | ArrayPath | Readonly<ArrayPath>;

const resolvePath = (path: Path) => {
  return Array.isArray(path) ? path[0] : path;
};

export const urlize = ({
  version,
  route,
}: {
  version: string;
  route: Path;
}) => {
  const resolvedRoute = resolvePath(route);
  return (path: Path) => {
    const resolvedPath = resolvePath(path);
    return `/${version}/${resolvedRoute}${resolvedPath}`;
  };
};
