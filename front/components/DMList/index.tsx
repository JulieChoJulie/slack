import { IUser, IUserWithOnline } from '@typings/db';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { CollapseButton } from '@components/DMList/styles';
import { NavLink } from 'react-router-dom';
import fetcher from '@utils/fetcher';
import useSocket from '@hooks/useSocket';

const DMList = () => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000,
  });
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const [socket] = useSocket(workspace);

  const [channelCollapse, setChannelCollapse] = useState(false);
  const [countList, setCountList] = useState<{ [key: string]: number }>({});
  const [onlineList, setOnlineList] = useState<number[]>([]);
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

  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });

    return () => {
      socket?.off('onlineList');
    };
  }, [socket]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            const count = countList[member.id] || 0;
            return (
              <NavLink
                key={member.id}
                to={`/workspace/${workspace}/dm/${member.id}`}
                onClick={() => resetCount(member.id)}
              >
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span className={count && count > 0 ? 'bold' : undefined}> {member.nickname}</span>
                {userData && member.id === userData?.id && <span>(me)</span>}
                {(count && count > 0 && <span className="count">{count}</span>) || null}
              </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;
