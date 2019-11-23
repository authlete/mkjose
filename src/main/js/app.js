import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Tabs, Container, Section, Level, Form, Columns, Card, Table } from 'react-bulma-components';

class MkJose extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			payload: '',
			alg: 'none',
			key: {},
			payloadMode: 'ro'   // can also be 'ciba' or 'request'
		};
	}
	
	setPayload = (val) => {
		this.setState({
			payload: val
		});
	}
	
	selectTab = (payloadMode) => () => {
		this.setState({payloadMode: payloadMode});
	}
	
	render() {
		return (
			<Section>
				<Container>
					<InputForm payload={this.state.payload} payloadMode={this.state.payloadMode} setPayload={this.setPayload} selectTab={this.selectTab} />
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
	var payload = <PlainPayload payload={props.payload} 
		setPayload={props.setPayload} />;

	if (props.payloadMode == 'ro') {
		label = 'Payload for Request Object';
		payload = <RequestObjectPayload payload={props.payload} 
			setPayload={props.setPayload} />;
	} else if (props.payloadMode == 'ciba') {
		label = 'Payload for Backchannel Authentication';
		payload = <CibaPayload payload={props.payload} 
			setPayload={props.setPayload} />;
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
						<Tabs type='boxed'>
							<Tabs.Tab active={props.payloadMode == 'plain'} onClick={props.selectTab('plain')}>
							Plain
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ciba'} onClick={props.selectTab('ciba')}>
							CIBA
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ro'} onClick={props.selectTab('ro')}>
							Request Object
							</Tabs.Tab>
						</Tabs>
					</Level.Item>
				</Level.Side>
			</Level>
			
			<Form.Field>
				<Form.Control>
					{payload}
				</Form.Control>
			</Form.Field>
		
		</div>			
	);
}

class PlainPayload extends React.Component {
	setPayload = (e) => {
		this.props.setPayload(e.target.value);
	}
	
	render() {
		return (
			<Form.Textarea className="textarea" rows={10} spellCheck={false} 
				value={this.props.payload} onChange={this.setPayload} />
		);
	}
}

class CibaPayload extends React.Component {
	constructor(props) {
		super(props);
		
		var p = {};
		try {
			p = JSON.parse(props.payload);	
		} catch (e) {
			// non-json payload, ignore
		}
		
		this.state = {
			payload: p
		};
	}
	
	fieldTypes = {
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
	}

	setPayloadItem = (field) => (e) => {
		
		var p = this.state.payload;
		
		var val = e.target.value;
				
		if (e.target.attributes["type"].value == 'number' 
			|| e.target.attributes["type"].value == 'datetime-local') {
			val = Number(val);
		}
		
		p[field] = val;
		
		this.props.setPayload(JSON.stringify(p, null, 4));
		
		this.setState({
			payload: p
		});
	}
	
	render() {
		const fields = [];
		Object.keys(this.fieldTypes).forEach((field) => {
			fields.push(
				<tr key={'ciba-' + field}>
					<td><code>{field}</code></td>
					<td><input id={'ciba-' + field} type={this.fieldTypes[field]} size={60} 
						onChange={this.setPayloadItem(field)} value={this.state.payload[field] || ''} /></td>
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
	}
}

class RequestObjectPayload extends React.Component {
	constructor(props) {
		super(props);
		
		var p = {};
		try {
			p = JSON.parse(props.payload);	
		} catch (e) {
			// non-json payload, ignore
		}
		
		
		var claims = '';
		if (p.claims) {
			claims = JSON.stringify(p.claims, null, 4);
		}

		var arb = {};
		var arbString = '';
		Object.keys(p).forEach((field) => {
			console.log(field);
			if (field != 'claims' 
				&& Object.keys(this.fieldTypes).indexOf(field) < 0) {
				arb[field] = p[field];
			}
		});
		console.log(arb);
		if (Object.keys(arb).length > 0) {
			arbString = JSON.stringify(arb, null, 4);
		}
		
		this.state = {
			payload: p,
			claimsString: claims,
			arbString: arbString
		};
	}

	fieldTypes = {
		exp: 'datetime-local',
		iss: 'text',
		aud: 'text',
		scope: 'text',
		response_type: 'text',
		client_id: 'text',
		redirect_uri: 'text',
		state: 'text',
		nonce: 'text',
		max_age: 'number',
		code_challenge: 'text',
	}

	setPayloadItem = (field) => (e) => {
		
		var p = this.state.payload;
		
		var val = e.target.value;
				
		if (e.target.attributes["type"].value == 'number' 
			|| e.target.attributes["type"].value == 'datetime-local') {
			val = Number(val);
		}
		
		p[field] = val;
		
		this.props.setPayload(JSON.stringify(p, null, 4));
		
		this.setState({
			payload: p
		});
	}
	
	setClaims = (e) => {
		const val = e.target.value;

		var p = this.state.payload;

		if (!val) {
			p['claims'] = c;

			this.props.setPayload(JSON.stringify(p, null, 4));
			
		} else {
		
			// try to parse as json
			var c = undefined;
			try {
				c = JSON.parse(val);	
	
				p['claims'] = c;
	
				this.props.setPayload(JSON.stringify(p, null, 4));
				
			} catch (e) {
				// non-json payload, ignore the update
			}
		}
		
		this.setState({
			payload: p,
			claimsString: val
		});
		
	}
	
	setArbitrary = (e) => {
		const val = e.target.value;

		var p = this.state.payload;

		// try to parse as json
		var arb = undefined;
		try {
			arb = JSON.parse(val);	

			Object.keys(arb).forEach((field) => {
				p[field] = arb[field];
			});

			this.props.setPayload(JSON.stringify(p, null, 4));
			
		} catch (e) {
			// non-json payload, ignore the update
		}
		
		this.setState({
			payload: p,
			arbString: val
		});
		
	}
	
	render() {
		const fields = [];
		Object.keys(this.fieldTypes).forEach((field) => {
			fields.push(
				<tr key={'ro-' + field}>
					<td><code>{field}</code></td>
					<td><input id={'ro-' + field} type={this.fieldTypes[field]} size={60} 
						onChange={this.setPayloadItem(field)} value={this.state.payload[field] || ''} /></td>
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
							<tr>
								<td><code>claims</code></td>
								<td><textarea id="ro-claims" rows="5" cols="50" spellCheck="false"
									onChange={this.setClaims} value={this.state.claimsString}></textarea></td>
								<td><Button><i className="far fa-trash-alt"></i></Button></td>
							</tr>
							<tr>
								<td>Arbitrary JSON</td>
								<td><textarea id="ro-arbitrary_json" rows="5" cols="50" spellCheck="false"
									onChange={this.setArbitrary} value={this.state.arbString}></textarea></td>
								<td><Button><i className="far fa-trash-alt"></i></Button></td>
							</tr>
						</tbody>
					</Table>
				</Card.Content>
			</Card>
		);
	}
}

const PayloadInput = ({...props}) => {
	if (props.mode == 'plain') {
		return (
			<Form.Textarea className="textarea" rows={10} spellCheck={false} value={props.payload} onChange={props.setPayload} />
		);
	} else if (props.mode == 'ro') {
		return null;
	} else if (props.mode == 'ciba') {
		return null
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
