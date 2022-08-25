import { Error } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import {
  RightMenu,
  Header,
  ProfileImg,
  ProfileModal,
  LogOutButton,
  WorkspaceWrapper,
  Workspaces,
  WorkspaceButton,
  Channels,
  Chats,
  WorkspaceName,
  MenuScroll,
} from './styles';
import axios from 'axios';
import gravatar from 'gravatar';
import React, { FC, useCallback, useState } from 'react';
import useSWR from 'swr';
import { Route, Routes, Navigate, Outlet, Link } from 'react-router-dom';
import DirectMessage from '@pages/DirectMessage';

const Workspace = () => {
  const { data, error, mutate } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000,
  });
  const [logOutError, setLogOutError] = useState(false);
  const onLogout = useCallback(() => {
    setLogOutError(false);
    axios
      .post('/api/users/logout', null, { withCredentials: true })
      .then(() => {
        mutate(false, { revalidate: false });
      })
      .catch((err) => {
        console.log(err);
        setLogOutError(true);
      });
  }, [mutate]);

  if (!data) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span>
            <ProfileImg
              src={gravatar.url(data.email, { s: '28px', d: 'retro' })}
              alt={data.email}
            />
          </span>
        </RightMenu>
      </Header>

      <button onClick={onLogout}>Log out</button>
      {logOutError && <Error>Failed to </Error>}
      <WorkspaceWrapper>
        <Workspaces>test</Workspaces>
        <Channels>
          <WorkspaceName>DM</WorkspaceName>
          <MenuScroll>menu</MenuScroll>
          <Link to="/workspace/dm">DM</Link>
          <Link to="/workspace/channel">Channel</Link>
        </Channels>
        <Chats>
          <Outlet />
        </Chats>
      </WorkspaceWrapper>
    </div>
  );
};

export default Workspace;
