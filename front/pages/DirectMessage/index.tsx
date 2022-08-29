import React from 'react';
import { Container, Header } from '@pages/DirectMessage/styles';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import { useParams } from 'react-router';
import gravatar from 'gravatar';
import fetcher from '@utils/fetcher';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';

const DirectMessage = () => {
  const { workspace, dm } = useParams<{ workspace: string; dm: string }>();
  const { data: userData } = useSWR<IUser | false>(`/api/workspaces/${workspace}/users/${dm}`, fetcher);
  const { data: myData } = useSWR<IUser | false>(`/api/users`, fetcher);

  if (!userData || !myData) {
    return <div>Loading..</div>;
  }
  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList />
      <ChatBox chat={`hello`} />
    </Container>
  );
};

export default DirectMessage;
