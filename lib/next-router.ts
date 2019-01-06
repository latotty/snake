import Router from 'next/router';

export const pushURL = (
  query: Partial<{
    seed: string;
    walls: string;
    size: number;
    config: string;
  }>,
) => {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, ...query },
  });
};
