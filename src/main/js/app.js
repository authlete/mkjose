import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Tabs, Container, Section, Level, Form, Columns, Card, Table } from 'react-bulma-components';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import { Translation } from 'react-i18next';

class MkJose extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			language: 'en', // can also be 'ja'
			payload: '',
			alg: 'none',
			jwk: '',
			payloadMode: 'plain',   // can also be 'ciba' or 'ro'
			output: '',
			keyLoading: false,
			joseLoading: false
		};
	}
	
	setPayload = (val) => {
		this.setState({
			payload: val
		});
	}
	
	clearPayload = () => {
		this.setPayload('');
	}
	
	selectTab = (payloadMode) => () => {
		this.setState({payloadMode: payloadMode});
	}
	
	setAlgEvt = (e) => {
		this.setAlgVal(e.target.value);
	}
	
	setAlgVal = (val) => {
		this.setState({alg: val});
	}
	
	setKey = (val) => {
		this.setState({
			jwk: val
		});
	}
	
	clearKey = () => {
		this.setKey('');
		this.setAlgVal('none');
	}
	
	callMkJwk = (kty) => {
		var url = 'https://mkjwk.org/jwk/';
		if (kty === 'RSA') {
			url = url + 'rsa?size=2048';
		} else if (kty === 'EC') {
			url = url + 'ec?crv=P-256';
		} else if (kty === 'oct') {
			url = url + 'oct?size=2048';
		} else {
			return;
		}
		
		const _self = this;

		this.setState({
			keyLoading: true
		});
		
		fetch(url).then(function (res) {
			if (res.ok) {
				res.json().then(function (data) {
					_self.setState({
						jwk: JSON.stringify(data.jwk, null, 4),
						keyLoading: false
					});
					_self.setAlgForKty(kty);
				});
			}
		});
	}
		
	setAlgForKty = (kty) => {
		if (kty == 'RSA') {
			this.setAlgVal('RS256');
		} else if (kty == 'EC') {
			this.setAlgVal('ES256');
		} else if (kty == 'oct') {
			this.setAlgVal('HS256');
		}
	}
	
	generate = (e) => {
		if (!this.state.payload) {
			alert(this.props.t('err.input_payload'));
			return;
		}
		
		if (this.state.alg != 'none' && !this.state.jwk) {
			alert('err.input_jwk');
		}
		
		const url = location.origin + '/api/jose/generate';
		const headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
		});
		
		const body = new URLSearchParams();
		body.append('payload', this.state.payload);
		body.append('signing-alg', this.state.alg);
		body.append('jwk-signing-alg', this.state.jwk);
		
		this.setState({joseLoading: true});
		
		fetch(new Request(url, {
			method: 'POST',
			headers: headers,
			body: body
		})).then((res) => {
			res.text().then((jose) => {
				this.setState({
					output: jose,
					joseLoading: false
				});
			});
		});
		
	}
	
	copyToClipboard = () => {
		navigator.clipboard.writeText(this.state.output);
	}
	
	render() {
		return (
		<>
			<Section>
				<Container>
					<InputForm payload={this.state.payload} payloadMode={this.state.payloadMode} t={this.props.t}
						setPayload={this.setPayload} selectTab={this.selectTab} clearPayload={this.clearPayload} />
					<SigningAlg alg={this.state.alg} setAlg={this.setAlgEvt} t={this.props.t} />
					<SigningKey jwk={this.state.jwk} keyLoading={this.keyLoading} t={this.props.t} 
						setKey={this.setKey} setAlgForKty={this.setAlgForKty} clearKey={this.clearKey} callMkJwk={this.callMkJwk} />
					<GenerateButton generate={this.generate} t={this.props.t} />
				</Container>
			</Section>
			<Section>
				<Container>
					<OutputForm output={this.state.output} copyToClipboard={this.copyToClipboard} joseLoading={this.joseLoading}  t={this.props.t} />
				</Container>
			</Section>
		</>
		);
	}
}

const InputForm = ({...props}) => {
	var label = props.t('input_form.payload');
	var payload = <PlainPayload payload={props.payload} 
		setPayload={props.setPayload} t={props.t} />;

	if (props.payloadMode == 'ro') {
		label = props.t('input_form.payload_ro');
		payload = <RequestObjectPayload payload={props.payload} 
			setPayload={props.setPayload} t={props.t} />;
	} else if (props.payloadMode == 'ciba') {
		label = props.t('input_form.payload_ciba');
		payload = <CibaPayload payload={props.payload} 
			setPayload={props.setPayload} t={props.t} />;
	}
	return (
		<>
			<Level>
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
							{props.t('input_form.plain')}
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ciba'} onClick={props.selectTab('ciba')}>
							{props.t('input_form.ciba')}
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ro'} onClick={props.selectTab('ro')}>
							{props.t('input_form.ro')}
							</Tabs.Tab>
						</Tabs>
					</Level.Item>
					<Level.Item>
						<Button onClick={props.clearPayload}><i className="far fa-trash-alt"></i></Button>
					</Level.Item>
				</Level.Side>
			</Level>
			
			<Form.Field>
				<Form.Control>
					{payload}
				</Form.Control>
			</Form.Field>
		</>			
	);
}

class PlainPayload extends React.Component {
	setPayload = (e) => {
		this.props.setPayload(e.target.value);
	}
	
	render() {
		return (
			<Form.Textarea rows={10} spellCheck={false} 
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
	
	componentDidUpdate(prevProps) {
		if (!!prevProps.payload && !this.props.payload) {
			this.setState({
				payload: {}
			});
		}
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
	
	clearPayloadItem = (field) => (e) => {
		var p = this.state.payload;

		p[field] = undefined;
		
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
					<td><Button onClick={this.clearPayloadItem(field)}><i className="far fa-trash-alt"></i></Button></td>
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
			if (field != 'claims' 
				&& Object.keys(this.fieldTypes).indexOf(field) < 0) {
				arb[field] = p[field];
			}
		});
		if (Object.keys(arb).length > 0) {
			arbString = JSON.stringify(arb, null, 4);
		}
		
		this.state = {
			payload: p,
			claimsString: claims,
			arbString: arbString
		};
	}
	
	componentDidUpdate(prevProps) {
		if (!!prevProps.payload && !this.props.payload) {
			this.setState({
				payload: {},
				claimsString: '',
				arbString: ''
			});
		}
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
	
	clearPayloadItem = (field) => (e) => {
		var p = this.state.payload;

		p[field] = undefined;
		
		this.props.setPayload(JSON.stringify(p, null, 4));
		
		this.setState({
			payload: p
		});
	}
	
	setClaims = (e) => {
		const val = e.target.value;

		var p = this.state.payload;

		if (!val) {
			p['claims'] = undefined;

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
	
	clearClaims = (e) => {
		const p = this.state.payload;
		p['claims'] = undefined;

		this.props.setPayload(JSON.stringify(p, null, 4));
		
		this.setState({
			payload: p,
			claimsString: ''
		});
	}
	
	setArbitrary = (e) => {
		const val = e.target.value;

		var p = {};

		// try to parse as json
		var arb = undefined;
		try {
			// copy over standard fields first
			Object.keys(this.fieldTypes).forEach((field) => {
				p[field] = this.state.payload[field];
			});
			// handle 'claims' separately
			p['claims'] = this.state.payload['claims'];

			// if there are new fields, copy them over
			if (val) {
				arb = JSON.parse(val);	

				Object.keys(arb).forEach((field) => {
					p[field] = arb[field];
				});
			}
			
			this.props.setPayload(JSON.stringify(p, null, 4));
			
		} catch (e) {
			// non-json payload, ignore the update
		}
		
		this.setState({
			payload: p,
			arbString: val
		});
		
	}
	
	clearArbitrary = (e) => {
		var p = {};
		// copy over standard fields first
		Object.keys(this.fieldTypes).forEach((field) => {
			p[field] = this.state.payload[field];
		});
		// handle 'claims' separately
		p['claims'] = this.state.payload['claims'];
		
		this.props.setPayload(JSON.stringify(p, null, 4));

		this.setState({
			payload: p,
			arbString: ''
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
					<td><Button onClick={this.clearPayloadItem(field)}><i className="far fa-trash-alt"></i></Button></td>
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
								<td><Form.Textarea id="ro-claims" rows={5} cols={50} spellCheck="false"
									onChange={this.setClaims} value={this.state.claimsString} /></td>
								<td><Button onClick={this.clearClaims}><i className="far fa-trash-alt"></i></Button></td>
							</tr>
							<tr>
								<td>{this.props.t('ro.arbitrary')}</td>
								<td><Form.Textarea id="ro-arbitrary_json" rows={5} cols={50} spellCheck="false"
									onChange={this.setArbitrary} value={this.state.arbString} /></td>
								<td><Button onClick={this.clearArbitrary}><i className="far fa-trash-alt"></i></Button></td>
							</tr>
						</tbody>
					</Table>
				</Card.Content>
			</Card>
		);
	}
}

const SigningAlg = ({...props}) => {
	return (
		<Form.Field>
			<Form.Label className="is-medium">{props.t('signing_alg.label')}</Form.Label>
			<Form.Control>
				<Form.Select onChange={props.setAlg} value={props.alg || ''}>
	                <option value="none">{props.t('signing_alg.none')}</option>
	                <option value="HS256">{props.t('signing_alg.HS256')}</option>
	                <option value="HS384">{props.t('signing_alg.HS384')}</option>
	                <option value="HS512">{props.t('signing_alg.HS512')}</option>
	                <option value="RS256">{props.t('signing_alg.RS256')}</option>
	                <option value="RS384">{props.t('signing_alg.RS384')}</option>
	                <option value="RS512">{props.t('signing_alg.RS512')}</option>
	                <option value="ES256">{props.t('signing_alg.ES256')}</option>
	                <option value="ES384">{props.t('signing_alg.ES384')}</option>
	                <option value="ES512">{props.t('signing_alg.ES512')}</option>
	                <option value="PS256">{props.t('signing_alg.PS256')}</option>
	                <option value="PS384">{props.t('signing_alg.PS384')}</option>
	                <option value="PS512">{props.t('signing_alg.PS512')}</option>
				</Form.Select>
			</Form.Control>
		</Form.Field>
	);
}

class SigningKey extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			keyGen: 'preset' // can also be 'generate'
		};
	}
	
	selectTab = (val) => () => {
		this.setState({keyGen: val});
	}
	
	setKey = (e) => {
		this.props.setKey(e.target.value);
	}
	
	genKey = (kty) => (e) => {
		if (this.state.keyGen == 'preset') {
			var k = this.loadPresetKey(kty);
			this.props.setKey(JSON.stringify(k, null, 4));
			this.props.setAlgForKty(kty);
		} else {
			this.props.callMkJwk(kty);
		}
	}
	
	loadPresetKey = (kty) => {
		if (kty == 'RSA') {
			return {
			  "kty":"RSA",
			  "n":"ofgWCuLjybRlzo0tZWJjNiuSfb4p4fAkd_wWJcyQoTbji9k0l8W26mPddxHmfHQp-Vaw-4qPCJrcS2mJPMEzP1Pt0Bm4d4QlL-yRT-SFd2lZS-pCgNMsD1W_YpRPEwOWvG6b32690r2jZ47soMZo9wGzjb_7OMg0LOL-bSf63kpaSHSXndS5z5rexMdbBYUsLA9e-KXBdQOS-UTo7WTBEMa2R2CapHg665xsmtdVMTBQY4uDZlxvb3qCo5ZwKh9kG4LT6_I5IhlJH7aGhyxXFvUK-DWNmoudF8NAco9_h9iaGNj8q2ethFkMLs91kzk2PAcDTW9gb54h4FRWyuXpoQ",
			  "e":"AQAB",
			  "d":"Eq5xpGnNCivDflJsRQBXHx1hdR1k6Ulwe2JZD50LpXyWPEAeP88vLNO97IjlA7_GQ5sLKMgvfTeXZx9SE-7YwVol2NXOoAJe46sui395IW_GO-pWJ1O0BkTGoVEn2bKVRUCgu-GjBVaYLU6f3l9kJfFNS3E0QbVdxzubSu3Mkqzjkn439X0M_V51gfpRLI9JYanrC4D4qAdGcopV_0ZHHzQlBjudU2QvXt4ehNYTCBr6XCLQUShb1juUO1ZdiYoFaFQT5Tw8bGUl_x_jTj3ccPDVZFD9pIuhLhBOneufuBiB4cS98l2SR_RQyGWSeWjnczT0QU91p1DhOVRuOopznQ",
			  "p":"4BzEEOtIpmVdVEZNCqS7baC4crd0pqnRH_5IB3jw3bcxGn6QLvnEtfdUdiYrqBdss1l58BQ3KhooKeQTa9AB0Hw_Py5PJdTJNPY8cQn7ouZ2KKDcmnPGBY5t7yLc1QlQ5xHdwW1VhvKn-nXqhJTBgIPgtldC-KDV5z-y2XDwGUc",
			  "q":"uQPEfgmVtjL0Uyyx88GZFF1fOunH3-7cepKmtH4pxhtCoHqpWmT8YAmZxaewHgHAjLYsp1ZSe7zFYHj7C6ul7TjeLQeZD_YwD66t62wDmpe_HlB-TnBA-njbglfIsRLtXlnDzQkv5dTltRJ11BKBBypeeF6689rjcJIDEz9RWdc",
			  "dp":"BwKfV3Akq5_MFZDFZCnW-wzl-CCo83WoZvnLQwCTeDv8uzluRSnm71I3QCLdhrqE2e9YkxvuxdBfpT_PI7Yz-FOKnu1R6HsJeDCjn12Sk3vmAktV2zb34MCdy7cpdTh_YVr7tss2u6vneTwrA86rZtu5Mbr1C1XsmvkxHQAdYo0",
			  "dq":"h_96-mK1R_7glhsum81dZxjTnYynPbZpHziZjeeHcXYsXaaMwkOlODsWa7I9xXDoRwbKgB719rrmI2oKr6N3Do9U0ajaHF-NKJnwgjMd2w9cjz3_-kyNlxAr2v4IKhGNpmM5iIgOS1VZnOZ68m6_pbLBSp3nssTdlqvd0tIiTHU",
			  "qi":"IYd7DHOhrWvxkwPQsRM2tOgrjbcrfvtQJipd-DlcxyVuuM9sQLdgjVk2oy26F0EmpScGLq2MowX7fhd_QJQ3ydy5cY7YIBi87w93IKLEdfnbJtoOPLUW0ITrJReOgo1cq9SbsxYawBgfp_gh6A5603k2-ZQwVK0JKSHuLFkuQ3U"
			};
		} else if (kty == 'EC') {
			return {
			  "kty":"EC",
			  "crv":"P-256",
			  "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
			  "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
			  "d":"jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI"
			};
		} else if (kty == 'oct') {
			return {
			  "kty":"oct",
			  "k":"cMjpBMzDsh92LJfxqOeIZ8d9K0-p7-1ppPQAArKLdZZtr6LrkOO_8VjjRJT3hWPB1rd5r8U3bPvZo9W_hnt1VLR14BamM1sjn6_64gTCdxUKD3pxsmM848-WxL-esBIKcy2z6Lp6FeXyhkLJP-yETife6lrIdr_HNHiqI3Sy0TJLfd-QOGMDAuHUAMYLAqinKPgS3UqgOOh1-3Uak4rhX4gT4KgO-olKamW0uCiLLCzSGofyc3qeHN0eOqVYVEQ2jKIv7QzWt7tbrRWLX7AKtgR30zsKUgnyMsmirNJygDv9HY-BSsTswQpDtswj6AG3HQAgzr4BKRhn6wOi6ymKDg"
			};
		}
	}
	
	render() {
		return (
		<>
			<Level>
				<Level.Side align="left">
					<Level.Item>
						<Form.Field>
							<Form.Label className="is-medium">{this.props.t('signing_key.label')}</Form.Label>
						</Form.Field>
					</Level.Item>
				</Level.Side>
				<Level.Side align="right">
					<Level.Item>
						<Tabs type='toggle-rounded'>
							<Tabs.Tab active={this.state.keyGen == 'preset'} onClick={this.selectTab('preset')}>
							{this.props.t('signing_key.preset')}
							</Tabs.Tab>
							<Tabs.Tab active={this.state.keyGen == 'generate'} onClick={this.selectTab('generate')}>
							{this.props.t('signing_key.generated')}
							</Tabs.Tab>
						</Tabs>
					</Level.Item>
					<Level.Item>
						<Button onClick={this.genKey('RSA')}>{this.props.t('signing_key.rsa')}</Button>
						<Button onClick={this.genKey('EC')}>{this.props.t('signing_key.ec')}</Button>
						<Button onClick={this.genKey('oct')}>{this.props.t('signing_key.oct')}</Button>
					</Level.Item>
					<Level.Item>
						<Button onClick={this.props.clearKey}><i className="far fa-trash-alt"></i></Button>
					</Level.Item>
				</Level.Side>
			</Level>			
			<Form.Field>
				<Form.Control loading={this.props.keyLoading}>
					<Form.Textarea rows={10} spellCheck={false} onChange={this.setKey} value={this.props.jwk} />
				</Form.Control>
			</Form.Field>
		</>
		);
	}
}

const GenerateButton = ({...props}) => {
	return (
		<Form.Field>
			<Form.Control>
				<Button size="large" color="primary" fullwidth onClick={props.generate}>{props.t('generate')}</Button>
			</Form.Control>
		</Form.Field>
	);
}

const OutputForm = ({...props}) => {
	return (
	<>
		<Form.Field>
			<Form.Label className="is-medium">{props.t('output_form.label')}</Form.Label>
			<Form.Control loading={props.joseLoading}>
				<Form.Textarea rows={10} spellCheck={false} readOnly value={props.output} />
			</Form.Control>
		</Form.Field>
		<Form.Control>
			<Button size="large" color="primary" fullwidth onClick={props.copyToClipboard}>{props.t('output_form.copy')}</Button>
		</Form.Control>
	</>
	);
}

class LanguageSwitch extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			language: 'en'
		};
	}
	
	selectTab = (lang) => () => {
		// short circuit out if it's not changing
		if (lang == this.state.language) {
			return;
		}
		
		var _self = this;
		
		i18n.changeLanguage(lang).then((t) => {
			_self.setState({
				language: lang
			});
			
			// re-render the main component with a new language loaded
			ReactDOM.render((
				<MkJose t={t} />
				),
				document.getElementById('react')
			);
		});
	}
	
	render = () => {
		return (
			<Tabs type='toggle' className='has-background-dark'>
				<Tabs.Tab active={this.state.language == 'en'} onClick={this.selectTab('en')}>
				English
				</Tabs.Tab>
				<Tabs.Tab active={this.state.language == 'ja'} onClick={this.selectTab('ja')}>
				日本語
			</Tabs.Tab>
	</Tabs>
);
	}
}

const Footer = ({...props}) => {
	return (
	<Container size={5}>
		<ul>
			<li dangerouslySetInnerHTML={{__html: props.t('footer.provided')}}></li>
			<li dangerouslySetInnerHTML={{__html: props.t('footer.source')}}></li>
		</ul>
	</Container>
	);
}

ReactDOM.render((
	<LanguageSwitch />
	), 
	document.getElementById('languageSwitch')
);

ReactDOM.render((
	<Translation i18n={i18n}>
		{
			(t, { i18n }) => <MkJose t={t} />
		}
	</Translation>
	),
	document.getElementById('react')
);

ReactDOM.render((
		<Translation i18n={i18n}>
			{
				(t, { i18n }) => <Footer t={t} />
			}
		</Translation>
		),
		document.getElementById('footer')
	);
