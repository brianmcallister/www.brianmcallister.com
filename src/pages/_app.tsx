import { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import Head from 'next/head';
import React from 'react';

import './styles.scss';

export default ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="author" content="Brian Wm. McAllister" />
        <meta name="description" content="Director of Engineering • NYC" />
        <meta
          name="google-site-verification"
          content="CR8UUEI82mGFVLbERofBMzq2Jy6Dm101c--jqzLnU7w"
        />
        <meta name="theme-color" content="#1d2122" />

        <link
          href="https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>Brian Wm. McAllister</title>
      </Head>

      <SWRConfig
        value={{
          fetcher: async (input, init?) => {
            const req = await fetch(input, init);
            const json = req.status === 200 ? await req.json() : null;

            return {
              json,
              status: req.status,
              statusText: req.statusText,
            };
          },
        }}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
};
