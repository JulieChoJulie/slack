import React, { useCallback, useState } from 'react';
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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [missmatchError, setMissmatchError] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpError, setSignUpError] = useState(false);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log(email, nickname, password, passwordCheck);
      if (!missmatchError && nickname && email && password && passwordCheck) {
        console.log('Sign up through server.');
        setSignUpSuccess(true);
        setSignUpError(false);
      } else {
        console.log('Error');
        setSignUpSuccess(false);
      }
      if (missmatchError) {
        console.log(`passwords don't match`);
      }
    },
    [email, nickname, password, passwordCheck, missmatchError],
  );
  const onChangeEmail = useCallback((e) => {
    setEmail(e.target.value);
  }, []);
  const onChangeNickname = useCallback((e) => {
    setNickname(e.target.value);
  }, []);
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
            {signUpError && (
              <Error>Oops, something went wrong. Please try again.</Error>
            )}
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
