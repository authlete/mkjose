import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Tabs, Container, Section, Level, Form, Columns, Card, Table } from 'react-bulma-components';

class MkJose extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			payload: '',
			cibaPayload: {},
			requestPayload: {},
			alg: 'none',
			key: {},
			payloadMode: 'ciba'   // can also be 'ciba' or 'request'
		};
	}
	
	setPayload = (e) => {
		if (this.state.mode == 'plain') {
			this.setState({
				payload: e.target.value
			});
		} 
	}
	
	render() {
		return (
			<Section>
				<Container>
					<InputForm payload={this.state.payload} payloadMode={this.state.payloadMode} setPayload={this.setPayload} />
				</Container>
				<Container>
					<OutputForm />
				</Container>
			</Section>
		);
	}
}

const InputForm = ({...props}) => {
	var label = 'Payload';
	if (props.payloadMode == 'ro') {
		label = 'Payload for Request Object';
	} else if (props.payloadMode == 'ciba') {
		label = 'Payload for Backchannel Authentication';
	}
	return (
		<div>
			<Level className="is-mobile">
				<Level.Side align="left">
					<Level.Item>
						<Form.Field>
							<Form.Label className="is-medium">{label}</Form.Label>
						</Form.Field>
					</Level.Item>
				</Level.Side>
				<Level.Side align="right">
					<Level.Item>
						<Form.Field>
							<Button color="light">Request Object</Button>
						</Form.Field>
					</Level.Item>
					<Level.Item>
						<Form.Field>
							<Button color="light">CIBA</Button>
						</Form.Field>
					</Level.Item>
					<Level.Item>
						<Form.Field>
							<Button color="light"><i className="far fa-trash-alt"></i></Button>
						</Form.Field>
					</Level.Item>
				</Level.Side>
			</Level>
			
			<Form.Field>
				<Form.Control>
					<Payload payload={props.payload} mode={props.payloadMode} setPayload={props.setPayload} />
				</Form.Control>
			</Form.Field>
		
		</div>			
	);
}

const Payload = ({...props}) => {
	if (props.mode == 'plain') {
		return (
			<Form.Textarea className="textarea" rows={10} spellCheck={false} value={props.payload} onChange={props.setPayload} />
		);
	} else if (props.mode == 'ro') {
		return null;
	} else if (props.mode == 'ciba') {
		const fieldTypes = {
			exp: 'datetime-local',
			nbf: 'datetime-local',
			iss: 'text',
			aud: 'text',
			scope: 'text',
			client_notification_token: 'text',
			acr_values: 'text',
			login_hint_token: 'text',
			id_token_hint: 'text',
			login_hint: 'text',
			binding_message: 'text',
			user_code: 'text',
			requested_expiry: 'number',
			request_context: 'text'
		};
		const fields = [];
		Object.keys(fieldTypes).forEach((field) => {
			fields.push(
				<tr key={'ciba-' + field}>
					<td><code>{field}</code></td>
					<td><input id={'ciba-' + field} type={fieldTypes[field]} size={60} /></td>
					<td><Button><i className="far fa-trash-alt"></i></Button></td>
				</tr>
			);
		});
		
		return (
		<Card color="light">
			<Card.Content>
			<Table>
				<tbody>
					{fields}
				</tbody>
			</Table>
			</Card.Content>
		</Card>
		);
	} else {
		return null;
	}
}

const OutputForm = ({...props}) => {
	return null;
}

ReactDOM.render((
	<MkJose />
	),
	document.getElementById('react')
);
