import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}
const InviteChannelModal: FC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMenber] = useInput('');

  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { mutate: mutateMembers } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  toast.configure();

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) {
        return;
      }
      axios
        .post(`/api/workspaces/${workspace}/members`, {
          email: newMember,
        })
        .then(() => {
          mutateMembers();
          setShowInviteChannelModal(false);
          setNewMenber('');
        })
        .catch((err) => {
          console.dir(err);
          toast.error(err.response?.data, { position: 'bottom-center' });
        });
    },
    [newMember, workspace, mutateMembers, setNewMenber, setShowInviteChannelModal],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>Email</span>
          <Input id="email" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">Invite</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
