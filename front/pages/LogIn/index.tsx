import React, { useCallback, useState } from 'react';
import useInput from '@hooks/useInput';
import fetcher from '@utils/fetcher';
import {
  Button,
  Error,
  Form,
  Header,
  Input,
  Label,
  LinkContainer,
} from '@pages/SignUp/styles';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import useSWR from 'swr';

const LogIn = () => {
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const { data, error, mutate } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000,
  });

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      axios
        .post(
          '/api/users/login',
          { email, password },
          { withCredentials: true },
        )
        .then(() => {
          mutate();
        })
        .catch((err) => {
          console.log(err);
          setLogInError(err.response?.data?.statusCode === 401);
        });
    },
    [email, password, mutate],
  );

  if (data === undefined) {
    return <div>Loading</div>;
  }

  if (data) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div id="container">
      <Header>Slack</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>Email</span>
          <div>
            <Input
              type="email"
              value={email}
              name="email"
              id="email"
              onChange={onChangeEmail}
            />
          </div>
        </Label>
        <Label>
          <span>Password</span>
          <div>
            <Input
              type="password"
              value={password}
              name="password"
              id="password"
              onChange={onChangePassword}
            />
          </div>
        </Label>
        <Button>Log in</Button>
        {logInError && <Error></Error>}
      </Form>
      <LinkContainer>
        Don't have an account?
        <Link to="/signup">Sign up</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
