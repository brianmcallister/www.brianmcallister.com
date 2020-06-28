import classnames from 'classnames';
import HttpStatusCodes from 'http-status-codes';
import React from 'react';
import useSWR from 'swr';

import { SpotifyPayload } from '../pages/api/me';
import { LoadingSpinner } from './LoadingSpinner';

interface SmallResponse<T> {
  json?: T;
  ok: boolean;
  status: number;
  statusText: string;
}

const baseClass = 'now-playing';

const renderContent = (
  data?: SmallResponse<SpotifyPayload | null>,
): JSX.Element | null => {
  if (!data) {
    return null;
  }

  const { json, status } = data;

  if (!json || status === HttpStatusCodes.NO_CONTENT) {
    return <>Nothing right now...</>;
  }

  return (
    <>
      <img src={json.image} alt={json.album} className={`${baseClass}__img`} />
      <span>{`${json.artist}, `}</span>
      <span>{`${json.album}, `}</span>
      <span>{json.track}</span>
    </>
  );
};

const delay = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

const createEmptyResponse = () => ({
  status: HttpStatusCodes.NO_CONTENT,
  ok: true,
  statusText: HttpStatusCodes.getStatusText(HttpStatusCodes.NO_CONTENT),
});

export const NowPlaying = (): JSX.Element => {
  const { data } = useSWR<SmallResponse<SpotifyPayload>>('/api/me', {
    refreshInterval: 1000,
  });
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [finalData, setFinalData] = React.useState<typeof data>();
  const rendered = renderContent(finalData);
  const cls = classnames(baseClass, {
    [`${baseClass}--loaded`]: finalData,
    [`${baseClass}--song-playing`]:
      finalData?.ok && finalData.status !== HttpStatusCodes.NO_CONTENT,
  });

  React.useEffect(() => {
    if (isReady) {
      setFinalData(data);

      return;
    }

    delay(500)
      .then(() => {
        const ready = data != null;

        if (ready) {
          setFinalData(data);
        }

        return setIsReady(ready);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);

        setIsReady(true);
        setFinalData(createEmptyResponse());
      });
  }, [data]);

  return (
    <span className={cls}>
      <span className={`${baseClass}__loading`}>
        <LoadingSpinner />
        Loading...
      </span>

      <span className={`${baseClass}__rendered`}>{rendered}</span>
    </span>
  );
};
