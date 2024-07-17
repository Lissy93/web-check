
import styled from '@emotion/styled';
import type { ServerLocation } from 'web-check-live/utils/result-processor';
import { Card } from 'web-check-live/components/Form/Card';
import LocationMap from 'web-check-live/components/misc/LocationMap';
import Flag from 'web-check-live/components/misc/Flag';
import { TextSizes } from 'web-check-live/styles/typography';
import Row, { StyledRow } from 'web-check-live/components/Form/Row';

const cardStyles = '';

const SmallText = styled.span`
  opacity: 0.5;
  font-size: ${TextSizes.xSmall};
  text-align: right;
  display: block;
`;

const MapRow = styled(StyledRow)`
  padding-top: 1rem;
  flex-direction: column;
`;

const CountryValue = styled.span`
  display: flex;
  gap: 0.5rem;
`;

const ServerLocationCard = (props: { data: ServerLocation, title: string, actionButtons: any }): JSX.Element => {
  const location = props.data;
  const {
    city, region, country,
    postCode, countryCode, coords,
    isp, timezone, languages, currency, currencyCode,
  } = location;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles={cardStyles}>
      <Row lbl="City" val={`${postCode}, ${city}, ${region}`} />
      <Row lbl="" val="">
        <b>Country</b>
        <CountryValue>
          {country}
          { countryCode && <Flag countryCode={countryCode} width={28} /> }
        </CountryValue>
      </Row>
      <Row lbl="Timezone" val={timezone} />
      <Row lbl="Languages" val={languages} />
      <Row lbl="Currency" val={`${currency} (${currencyCode})`} />
      <MapRow>
        <LocationMap lat={coords.latitude} lon={coords.longitude} label={`Server (${isp})`} />
        <SmallText>Latitude: {coords.latitude}, Longitude: {coords.longitude} </SmallText>
      </MapRow>
    </Card>
  );
}

export default ServerLocationCard;
