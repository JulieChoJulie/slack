import { Container, Header } from './styles';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import useInput from '@hooks/useInput';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser | false>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const { data: myData } = useSWR<IUser | false>(`/api/users`, fetcher);

  const [chat, onChangeChat] = useInput('');

  const onSubmitForm = useCallback((e) => {
    e.preventDefault();
    // axios.post()
  }, []);

  if (!userData || !myData) {
    return <div>Loading..</div>;
  }
  return (
    <Container>
      <Header>
        <span>{channel}</span>
      </Header>
      {/* <ChatList /> */}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default Channel;
