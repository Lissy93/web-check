import styled from 'styled-components';
import colors from 'styles/colors';

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  align?: 'left' | 'center' | 'right';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  inline?: boolean;
  children: React.ReactNode;
};

const StyledHeading = styled.h1<HeadingProps>`
  margin: 0.5rem;
  text-shadow: 2px 2px 0px ${colors.bgShadowColor};
  ${props => {
    switch (props.size) {
      case 'small': return 'font-size: 1rem;';
      case 'medium': return 'font-size: 2rem;';
      case 'large': return 'font-size: 3rem;';
    }
  }};
  ${props => {
    switch (props.align) {
      case 'left': return 'text-align: left;';
      case 'right': return 'text-align: right;';
      case 'center': return 'text-align: center;';
    }
  }};
  ${props => props.color ? `color: ${props.color};` : '' }
  ${props => props.inline ? 'display: inline;' : '' }
`;


const Heading = (props: HeadingProps): JSX.Element => {
  const { children, as, size, align, color, inline } = props;
  return (
    <StyledHeading as={as} size={size} align={align} color={color} inline={inline}>
      {children}
    </StyledHeading>
  );
}

export default Heading;
