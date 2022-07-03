import styled from 'styled-components';

import colors from 'styles/colors';

export const StyledCard = styled.section`
  background: ${colors.backgroundLighter};
  box-shadow: 4px 4px 0px ${colors.bgShadowColor};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  max-width: 24rem;
`;

interface CardProps {
  children: React.ReactNode;
};

const Card = (props: CardProps): JSX.Element => {
  const { children } = props;
  return (
    <StyledCard>{children}</StyledCard>
  );
}

export default Card;

