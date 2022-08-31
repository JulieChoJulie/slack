import React, { useCallback, useEffect, useRef } from 'react';
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
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${dm}`, fetcher);
  const { data: myData } = useSWR(`/api/users`, fetcher);
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
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prev) => {
          prev?.[0]?.unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prev;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${dm}/chats`, {
            content: chat,
          })
          .then(() => {
            mutateChat();
          })
          .catch((err) => {
            console.dir(err);
          });
      }
    },
    [chat, chatData, myData, userData, workspace, dm, mutateChat, setChat],
  );

  const scrollbarRef = useRef<Scrollbars>(null);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // scroll to the bottom after loading
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

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
