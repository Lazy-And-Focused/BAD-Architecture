type Path = string | string[] | readonly string[];

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
