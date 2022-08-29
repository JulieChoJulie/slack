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
  WorkspaceModal,
} from './styles';
import axios from 'axios';
import gravatar from 'gravatar';
import React, { useCallback, useEffect, useState, VFC } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Navigate, Outlet, Link, useParams } from 'react-router-dom';
import Menu from '@components/Menu';
import { IUser, IChannel } from '@typings/db';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/inviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';

// const errorHandling = {
//   onError: (error) => {
//     if (error.status === 404) {
//       toast.error(error.data, { position: 'bottom-center' });
//     }
//   },
//   onErrorRetry: (error) => {
//     if (error.status === 404) return;
//   },
// };

const Workspace: VFC = () => {
  const { mutate } = useSWRConfig();
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher);
  const { data: channelData, error: channelError } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  const [logOutError, setLogOutError] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [newWorkspace, onChangeNewWorkpace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

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

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickUserProfile = useCallback(() => {
    setShowUserProfile((prev) => !prev);
  }, []);

  const onClickCreateWorkSpace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteChannelModal(false);
    setShowInviteWorkspaceModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
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
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((err) => {
          console.dir(err);

          toast.error(err.response?.data, { position: 'bottom-center' });
        });
    },
    [newUrl, newWorkspace, mutate, setNewWorkspace, setNewUrl],
  );

  const onCloseUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserProfile(false);
  }, []);

  if (userData === false) {
    return <Navigate to="/login" />;
  }

  if (!userData) {
    return <div>Loading</div>;
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
          {userData?.Workspaces?.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.name}/channel/general`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkSpace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}> Slack</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <button onClick={onClickAddChannel}>Create Channel</button>
                <button onClick={onClickInviteWorkspace}>Invite a user</button>
                <button onClick={onLogout}>Log out</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
          </MenuScroll>
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
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
        toggleWorkspaceModal={toggleWorkspaceModal}
      ></CreateChannelModal>
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      ></InviteWorkspaceModal>
      {/* <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      ></InviteChannelModal> */}
    </div>
  );
};

export default Workspace;
