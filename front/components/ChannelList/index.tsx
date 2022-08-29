import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import React from 'react';

const ChannelList = () => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000,
  });
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);
  const [channelCollapse, setChannelCollapse] = useState(false);
  const [countList, setCountList] = useState<{ [key: string]: number }>({});

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  const resetCount = useCallback((id) => {
    setCountList((obj) => {
      return {
        ...obj,
        [id]: undefined,
      };
    });
  }, []);

  return (
    <>
      <div>
        {!channelCollapse &&
          channelData?.map((channel) => {
            const count = countList[channel.id] || 0;

            return (
              <NavLink
                key={channel.name}
                to={`/workspace/${workspace}/channel/${channel.name}`}
                onClick={() => resetCount(`c-${channel.id}`)}
              >
                <span className={count !== undefined && count > 0 ? 'bold' : undefined}>#{channel.name}</span>
                {count !== undefined && count > 0 && <span className="count">{count}</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default ChannelList;
