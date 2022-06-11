interface Props {
  message: string,
};

const Demo = ({ message }: Props): JSX.Element => <div>{message}</div>;

export default Demo;
