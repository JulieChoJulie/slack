import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header } from '@pages/DirectMessage/styles';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { IUser, IChat, IChannel } from '@typings/db';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars-2';
import useSocket from '@hooks/useSocket';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR<IUser | false>(`/api/users`, fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels`, fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index: number) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );
  const [chat, onChangeChat, setChat] = useInput('');

  const [socket, disconnect] = useSocket(workspace);
  const scrollbarRef = useRef<Scrollbars>(null);

  // chatData: 2-d array
  //  [[{id: 3}, {id: 4}], [{ id:1, id: 2}]]
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData && myData && channelData) {
        const savedChat = chat;
        mutateChat((prev) => {
          prev?.[0]?.unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            createdAt: new Date(),
            ChannelId: channelData.id,
            Channel: channelData,
          });
          return prev;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
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
    [chat, myData, chatData, workspace, channel, mutateChat, setChat, channelData],
  );

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // scroll to the bottom after loading
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 50);
            }
          }
        });
      }
    },
    [channel, mutateChat, scrollbarRef],
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  if (!channelData || !myData) {
    return <div>Loading..</div>;
  }
  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
