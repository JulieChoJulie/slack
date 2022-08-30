import React, { useCallback, useRef } from 'react';
import { Container, Header } from '@pages/DirectMessage/styles';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { IUser, IDM } from '@typings/db';
import { useParams } from 'react-router';
import gravatar from 'gravatar';
import fetcher from '@utils/fetcher';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars-2';

const DirectMessage = () => {
  const { workspace, dm } = useParams<{ workspace: string; dm: string }>();
  const { data: userData } = useSWR<IUser | false>(`/api/workspaces/${workspace}/users/${dm}`, fetcher);
  const { data: myData } = useSWR<IUser | false>(`/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index: number) => `/api/workspaces/${workspace}/dms/${dm}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // chatData: 2-d array
  //  [[{id: 3}, {id: 4}], [{ id:1, id: 2}]]
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

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

  const scrollbarRef = useRef<Scrollbars>(null);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  if (!userData || !myData) {
    return <div>Loading..</div>;
  }
  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
