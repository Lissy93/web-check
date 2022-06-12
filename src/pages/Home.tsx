import { useState } from 'react';
import styled from 'styled-components';
import colors from 'styles/colors';
import Input from 'components/Form/Input'

const HomeContainer = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const UserInputMain = styled.div`
  background: ${colors.backgroundLighter};
  border-radius: 8px;
  padding: 1rem;
`;

const Home = (): JSX.Element => {
  const [userInput, setUserInput] = useState('');
  return (
    <HomeContainer>
      <UserInputMain>
        <Input
          id="user-input"
          value={userInput}
          label="Enter an IP or URL"
          size="large"
          orientation="vertical"
          handleChange={(e) => setUserInput(e.target.value)}
        />
        <p>{ userInput }</p>
      </UserInputMain>
    </HomeContainer>
  );
}

export default Home;
