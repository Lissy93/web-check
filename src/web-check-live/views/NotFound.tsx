
import styled from '@emotion/styled';

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import Button from 'web-check-live/components/Form/Button';
import { StyledCard } from 'web-check-live/components/Form/Card';

const AboutContainer = styled.div`
  width: 95vw;
  max-width: 1000px;
  margin: 2rem auto;
  padding-bottom: 1rem;
  header {
    margin 1rem 0;
  }
  a {
    color: ${colors.primary};
  }
  .im-drink { font-size: 6rem; }
  header {
    width: auto;
    margin: 1rem;
  }
`;

const HeaderLinkContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  a {
    text-decoration: none;
  }
`;

const NotFoundInner = styled(StyledCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem;
  gap: 0.5rem;
  h2 { font-size: 8rem; }
`;


const NotFound = (): JSX.Element => {
  return (
    <>
    <AboutContainer>
    <Nav />
    <NotFoundInner>
      <Heading as="h2" size="large" color={colors.primary}>404</Heading>
      <span className="im-drink">🥴</span>
      <Heading as="h3" size="large" color={colors.primary}>Not Found</Heading>
      <HeaderLinkContainer>
        <a href="/"><Button>Back to Homepage</Button></a>
      </HeaderLinkContainer>
      <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check">Report Issue</a>
    </NotFoundInner>
    </AboutContainer>
    <Footer isFixed={true} />
    </>
  );
};

export default NotFound;
