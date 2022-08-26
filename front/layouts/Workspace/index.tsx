import { Button, Error, Input, Label } from '@pages/SignUp/styles';
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
  AddButton,
} from './styles';
import axios from 'axios';
import gravatar from 'gravatar';
import React, { useCallback, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Navigate, Outlet, Link } from 'react-router-dom';
import Menu from '@components/Menu';
import { IUser } from '@typings/db';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Workspace = () => {
  const { mutate } = useSWRConfig();
  const { data: userData, error } = useSWR<IUser | false>('/api/users', fetcher);
  const [logOutError, setLogOutError] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [newWorkspace, onChangeNewWorkpace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
  const [showCreateWorkspaceModal, setCreateWorkspaceModal] = useState(false);

  toast.configure();

  const onLogout = useCallback(() => {
    setLogOutError(false);
    axios
      .post('/api/users/logout', null, { withCredentials: true })
      .then(() => {
        mutate('/api/users', false, { revalidate: false });
      })
      .catch((err) => {
        console.log(err);
        setLogOutError(true);
      });
  }, [mutate]);

  const onClickUserProfile = useCallback(() => {
    setShowUserProfile((prev) => !prev);
  }, []);

  const onClickCreateWorkSpace = useCallback(() => {
    setCreateWorkspaceModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setCreateWorkspaceModal(false);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;
      axios
        .post(
          '/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          { withCredentials: true },
        )
        .then((data) => {
          mutate('/api/workspaces', data);
          setCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((err) => {
          console.dir(err);
          console.log(err.response.data);

          toast.error(err.response?.data, { position: 'bottom-center' });
        });
    },
    [newUrl, newWorkspace],
  );

  const onCloseUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserProfile(false);
  }, []);

  if (!userData) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.email} />
            {showUserProfile && (
              <Menu style={{ right: 0, top: 38 }} show={showUserProfile} onCloseModal={onCloseUserProfile}>
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.email, {
                      s: '28px',
                      d: 'retro',
                    })}
                    alt={userData.email}
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>Log out</LogOutButton>
                {logOutError && <Error>Failed to </Error>}
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to="`/workspace/${}/channel/general">
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkSpace}>+</AddButton>
        </Workspaces>
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
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspaace-label">
            <span>Workspace name</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkpace} />
          </Label>
          <Label id="workspace-url-label">
            <span>Workspace url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
            <Button type="submit">Create</Button>
          </Label>
        </form>
      </Modal>
    </div>
  );
};

export default Workspace;
