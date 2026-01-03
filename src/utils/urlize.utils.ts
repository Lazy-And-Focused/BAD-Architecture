export const urlize = ({
  version,
  route,
}: {
  version: string;
  route: string;
}) => {
  return (path: string) => `/${version}/${route}${path}`;
};
