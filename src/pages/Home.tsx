import { useState } from 'react';
import styled from 'styled-components';

import colors from 'styles/colors';
import Heading from 'components/Form/Heading';
import Input from 'components/Form/Input'
import Button from 'components/Form/Button';
import FancyBackground from 'components/misc/FancyBackground';

import { determineAddressType } from 'utils/address-type-checker';

const HomeContainer = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-family: 'PTMono';
`;

const UserInputMain = styled.div`
  background: ${colors.backgroundLighter};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  z-index: 5;
  min-height: 25vh;
  min-width: 50vw;
  margin: 1rem;
`;

const Home = (): JSX.Element => {
  const [userInput, setUserInput] = useState('');

  const submit = () => {
    // TODO - Submit form, using the following data:
    console.log('Will Submit with: ', userInput);
    console.log('Address Type: ', determineAddressType(userInput));
  };

  return (
    <HomeContainer>
      <FancyBackground />
      <UserInputMain>
        <Heading as="h1" size="large" align="center" color={colors.primary}>Web Check</Heading>
        <Input
          id="user-input"
          value={userInput}
          label="Enter an IP or URL"
          size="large"
          orientation="vertical"
          placeholder="e.g. https://duck.com"
          handleChange={(e) => setUserInput(e.target.value)}
        />
        <Button size="large" onClick={submit}>Analyze!</Button>
      </UserInputMain>
    </HomeContainer>
  );
}

export default Home;
