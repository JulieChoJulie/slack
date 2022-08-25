import { Error } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback, useState } from 'react';
import { Navigate } from 'react-router';
import useSWR from 'swr';

const Workspace: FC = ({ children }) => {
  const { data, error, mutate } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000,
  });
  const [logOutError, setLogOutError] = useState(false);
  const onLogout = useCallback(() => {
    setLogOutError(false);
    axios
      .post('/api/users/logout', null, { withCredentials: true })
      .then(() => {
        mutate();
      })
      .catch((err) => {
        console.log(err);
        setLogOutError(true);
      });
  }, [mutate]);

  if (!data) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <button onClick={onLogout}>Log out</button>
      {children}
      {logOutError && <Error>Failed to </Error>}
    </div>
  );
};

export default Workspace;
