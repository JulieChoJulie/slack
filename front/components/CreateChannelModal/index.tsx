import Modal from '@components/Modal';
import React, { useCallback, VFC, useEffect } from 'react';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
  toggleWorkspaceModal: (flag: boolean) => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal, toggleWorkspaceModal }) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData, error: userError } = useSWR<IUser | false>('/api/users', fetcher);

  const { data: channelData, mutate: channelMutate } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );
  toast.configure();

  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      axios
        .post(
          `/api/workspaces/${workspace}/channels`,
          {
            name: newChannel,
          },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          channelMutate();
          setShowCreateChannelModal(false);
          setNewChannel('');
          toggleWorkspaceModal(false);
        })
        .catch((err) => {
          console.dir(err);
          toast.error(err.response?.data, { position: 'bottom-center' });
        });
    },
    [newChannel, workspace],
  );

  useEffect(() => {
    setNewChannel('');
  }, [show]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>Channel name</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
