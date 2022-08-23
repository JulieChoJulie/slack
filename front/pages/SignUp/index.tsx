import React, { useCallback, useState } from 'react';
import axios from 'axios';
import {
  Header,
  Form,
  Label,
  Input,
  LinkContainer,
  Button,
  Success,
  Error,
} from './styles';
import useInput from '@hooks/useInput';

const SignUp = () => {
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [missmatchError, setMissmatchError] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!missmatchError && nickname && email && password && passwordCheck) {
        console.log('Sign up through server.');
        // initializing status
        setSignUpError('');
        setSignUpSuccess(false);
        axios
          .post('/api/users', {
            email,
            nickname,
            password,
          })
          .then((response) => {
            console.log(response);
            setSignUpSuccess(true);
            setSignUpError('');
          })
          .catch((err) => {
            console.log(err.response);
            setSignUpSuccess(false);
            setSignUpError(err.response.data);
          });
      }
      if (missmatchError) {
        console.log(`passwords don't match`);
      }
    },
    [email, nickname, password, passwordCheck, missmatchError],
  );
  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
      setMissmatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck],
  );
  const onChangepasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMissmatchError(e.target.value !== password);
    },
    [password],
  );
  return (
    <div>
      <div id="container">
        <Header>Slack</Header>
        <Form onSubmit={onSubmit}>
          <Label id="email-label">
            <span>Email</span>
            <div>
              <Input
                type="email"
                id="Email"
                name="Email"
                value={email}
                onChange={onChangeEmail}
              />
            </div>
          </Label>
          <Label id="nickname-label">
            <span>Nickname</span>
            <div>
              <Input
                type="text"
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={onChangeNickname}
              />
            </div>
          </Label>
          <Label id="password-label">
            <span>Password</span>
            <div>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={onChangePassword}
              />
            </div>
          </Label>
          <Label id="password-check-label">
            <span>Confirm Password</span>
            <div>
              <Input
                id="password-check"
                type="password"
                name="password-check"
                value={passwordCheck}
                onChange={onChangepasswordCheck}
              />
            </div>
            {missmatchError && <Error>Password don't match.</Error>}
            {!nickname && <Error>Please fill out nickname.</Error>}
            {signUpError && <Error>{signUpError}</Error>}
            {signUpSuccess && (
              <Success>You have successfully signed up.</Success>
            )}
          </Label>
          <Button type="submit">Sign Up</Button>
        </Form>
        <LinkContainer>
          Do you already have an account?
          <a href="/login">Click here to log in.</a>
        </LinkContainer>
      </div>
    </div>
  );
};

export default SignUp;
