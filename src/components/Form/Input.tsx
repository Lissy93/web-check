import { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import colors from 'styles/colors';


type InputSize = 'small' | 'medium' | 'large';
type Orientation = 'horizontal' | 'vertical';

interface Props {
  id: string,
  value: string,
  label?: string,
  placeholder?: string,
  size?: InputSize,
  orientation?: Orientation;
  handleChange: (nweVal: React.ChangeEvent<HTMLInputElement>) => void,
};

type SupportedElements = HTMLInputElement | HTMLLabelElement | HTMLDivElement;
interface StyledInputTypes extends InputHTMLAttributes<SupportedElements> {
  inputSize?: InputSize;
  orientation?: Orientation;
};

const applySize = (inputSize?: InputSize) => {
  const sizeSpecificStyles = {
    small: `
      font-size: 1rem;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      margin: 0.5rem;
    `,
    medium: `
      font-size: 1.5rem;
      border-radius: 0.25rem;
      padding: 0.75rem 1.5rem;
      margin: 0.5rem;
    `,
    large: `
      font-size: 2rem;
      border-radius: 0.25rem;
      padding: 1rem 1.75rem;
      margin: 0.5rem;
    `,
  };
  switch (inputSize) {
    case 'small': return sizeSpecificStyles.small;
    case 'medium': return sizeSpecificStyles.medium;
    case 'large': return sizeSpecificStyles.large;
    default: return sizeSpecificStyles.small;
  }
};


const InputContainer = styled.div<StyledInputTypes>`
  display: flex;
  ${props => props.orientation === 'vertical' ? 'flex-direction: column;' : ''};
`;

const StyledInput = styled.input<StyledInputTypes>`
  background: ${colors.background};
  color: ${colors.textColor};
  border: none;
  border-radius: 0.25rem;
  &:focus {
    outline: 1px solid ${colors.primary}
  }

  ${props => applySize(props.inputSize)};
`;

const StyledLabel = styled.label<StyledInputTypes>`
  color: ${colors.textColor};
  ${props => applySize(props.inputSize)};
`;

const Input = (inputProps: Props): JSX.Element => {

  const { id, value, label, placeholder, size, orientation, handleChange } = inputProps;

  return (
  <InputContainer orientation={orientation}>
    { label && <StyledLabel htmlFor={id} inputSize={size}>{ label }</StyledLabel> }
    <StyledInput
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      inputSize={size}
    />
  </InputContainer>
  );
};

export default Input;
