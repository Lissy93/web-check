
import styled from 'styled-components';
import { ServerLocation } from 'utils/result-processer';
import colors from 'styles/colors';
import Card from 'components/Form/Card';

const Row = styled.div`
  border-bottom: 1px solid ${colors.primary};
  display: flex;
  justify-content: space-between;
`;

const ServerLocationCard = (location: ServerLocation): JSX.Element => {

  const { city, regionCode, countryCode, countryName, coords } = location;

  return (
  <Card>
    <Row>
      <span>Location</span>
      <span>{ city }, { countryName }</span>
    </Row>
  </Card>
  );
}

export default ServerLocationCard;
