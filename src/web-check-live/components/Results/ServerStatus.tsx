
import colors from 'web-check-live/styles/colors';
import { Card } from 'web-check-live/components/Form/Card';
import Row from 'web-check-live/components/Form/Row';

const cardStyles = `
span.val {
  &.up { color: ${colors.success}; }
  &.down { color: ${colors.danger}; }
}
`;

const ServerStatusCard = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const serverStatus = props.data;
  return (
    <Card heading={props.title.toString()} actionButtons={props.actionButtons} styles={cardStyles}>
      <Row lbl="" val="">
        <span className="lbl">Is Up?</span>
        { serverStatus.isUp ? <span className="val up">✅ Online</span> : <span className="val down">❌ Offline</span>}
      </Row>
      <Row lbl="Status Code" val={serverStatus.responseCode} />
      { serverStatus.responseTime && <Row lbl="Response Time" val={`${Math.round(serverStatus.responseTime)}ms`} /> }
    </Card>
  );
}

export default ServerStatusCard;
