import React, { useCallback } from 'react';
import { Container, Header } from '@pages/DirectMessage/styles';
import useSWR from 'swr';
import { IUser, IDM } from '@typings/db';
import { useParams } from 'react-router';
import gravatar from 'gravatar';
import fetcher from '@utils/fetcher';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';

const DirectMessage = () => {
  const { workspace, dm } = useParams<{ workspace: string; dm: string }>();
  const { data: userData } = useSWR<IUser | false>(`/api/workspaces/${workspace}/users/${dm}`, fetcher);
  const { data: myData } = useSWR<IUser | false>(`/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  const {
    data: chatData,
    error: chatError,
    mutate: mutateChat,
  } = useSWR<IDM[]>(`/api/workspaces/${workspace}/dms/${dm}/chats?perPage=20&page=1`, fetcher);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(chat);
      if (chat?.trim()) {
        axios
          .post(`/api/workspaces/${workspace}/dms/${dm}/chats`, {
            content: chat,
          })
          .then(() => {
            mutateChat();
            setChat('');
          })
          .catch((err) => {
            console.dir(err);
          });
      }

      // axios.post()
    },
    [chat, dm, workspace],
  );

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
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
