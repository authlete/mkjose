import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Tabs, Container, Section, Level, Form, Columns, Card, Table, Notification } from 'react-bulma-components';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';
import { Translation } from 'react-i18next';
import base64url from 'base64url';

class MkJose extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			language: 'en', // can also be 'ja'
			payload: '',
			alg: 'none',
			jwk: '',
			payloadMode: 'plain',   // can also be 'ciba' or 'ro' or 'ca' or 'dpop'
			output: '',
			keyLoading: false,
			joseLoading: false,
			jwtHeader: '{}'
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
		this.setState({payloadMode: payloadMode}, () => {
			// If DPoP mode is selected, initialize header and payload
			if (payloadMode === 'dpop') {
				// Set default algorithm to PS256 for DPoP
				this.setAlgVal('PS256');
				
				// Set default RSA key using existing preset key functionality
				if (!this.state.jwk) {
					// Find the SigningKey component's loadPresetKey method via refs isn't available,
					// so we'll directly call the same logic from the existing loadPresetKey method
					const defaultRSAKey = {
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
					this.setKey(JSON.stringify(defaultRSAKey, null, 4));
				}
				
				// Initialize header with DPoP defaults
				setTimeout(() => {
					// Use setTimeout to ensure key is set first
					const defaultHeader = {
						alg: 'PS256',
						typ: 'dpop+jwt'
					};
					
					// Add jwk (public key) if we have a key
					if (this.state.jwk) {
						try {
							const privateKey = JSON.parse(this.state.jwk);
							const publicKey = this.extractPublicKey(privateKey);
							defaultHeader.jwk = publicKey;
						} catch (e) {
							// Invalid key, ignore
						}
					}
					
					this.setState({jwtHeader: JSON.stringify(defaultHeader, null, 2)});
				}, 50);
				
				// Initialize payload if empty
				if (!this.state.payload) {
					const jti = base64url(crypto.getRandomValues(new Uint8Array(32)));
					const now = Math.floor(Date.now() / 1000);
					
					const defaultPayload = {
						jti: jti,
						htm: 'POST',
						htu: 'https://as.authlete.com/token',
						iat: now
					};
					
					this.setPayload(JSON.stringify(defaultPayload, null, 4));
				}
			}
		});
	}
	
	setAlgEvt = (e) => {
		this.setAlgVal(e.target.value);
	}
	
	setAlgVal = (val) => {
		this.setState({alg: val}, () => {
			this.updateHeaderAlg();
		});
	}
	
	setJwtHeader = (val) => {
		this.setState({jwtHeader: val});
	}
	
	updateHeaderAlg = () => {
		if (this.state.payloadMode === 'dpop') {
			try {
				const header = JSON.parse(this.state.jwtHeader);
				header.alg = this.state.alg;
				this.setState({jwtHeader: JSON.stringify(header, null, 2)});
			} catch (e) {
				// Invalid JSON, ignore
			}
		}
	}
	
	updateHeaderJwk = () => {
		if (this.state.payloadMode === 'dpop' && this.state.jwk) {
			try {
				const privateKey = JSON.parse(this.state.jwk);
				const publicKey = this.extractPublicKey(privateKey);
				const header = JSON.parse(this.state.jwtHeader);
				header.jwk = publicKey;
				this.setState({jwtHeader: JSON.stringify(header, null, 2)});
			} catch (e) {
				// Invalid JSON or key, ignore
			}
		}
	}
	
	extractPublicKey = (privateKey) => {
		const publicKey = {
			kty: privateKey.kty
		};
		
		if (privateKey.kty === 'RSA') {
			publicKey.n = privateKey.n;
			publicKey.e = privateKey.e;
			if (privateKey.alg) publicKey.alg = privateKey.alg;
			if (privateKey.use) publicKey.use = privateKey.use;
			if (privateKey.key_ops) publicKey.key_ops = privateKey.key_ops;
			if (privateKey.kid) publicKey.kid = privateKey.kid;
		} else if (privateKey.kty === 'EC') {
			publicKey.crv = privateKey.crv;
			publicKey.x = privateKey.x;
			publicKey.y = privateKey.y;
			if (privateKey.alg) publicKey.alg = privateKey.alg;
			if (privateKey.use) publicKey.use = privateKey.use;
			if (privateKey.key_ops) publicKey.key_ops = privateKey.key_ops;
			if (privateKey.kid) publicKey.kid = privateKey.kid;
		} else if (privateKey.kty === 'OKP') {
			publicKey.crv = privateKey.crv;
			publicKey.x = privateKey.x;
			if (privateKey.alg) publicKey.alg = privateKey.alg;
			if (privateKey.use) publicKey.use = privateKey.use;
			if (privateKey.key_ops) publicKey.key_ops = privateKey.key_ops;
			if (privateKey.kid) publicKey.kid = privateKey.kid;
		} else if (privateKey.kty === 'oct') {
			// For symmetric keys, return the original key (already public)
			return privateKey;
		}
		
		return publicKey;
	}
	
	setKey = (val) => {
		this.setState({
			jwk: val
		}, () => {
			this.setAlgForKey();
			this.updateHeaderJwk();
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
		} else if (kty == 'OKP') {
			url = url + 'okp?crv=Ed25519'
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
					_self.setKey(JSON.stringify(data.jwk, null, 4));
				});
			}
		});
	}
		
	setAlgForKey = () => {
		// only called when the key changes
		if (!this.state.jwk) {
			// not a valid key, don't change anything
			return;
		}
		
		try {
			const k = JSON.parse(this.state.jwk);

			if (k.alg) {
				// if the key has an alg, just use that no matter its value
				this.setAlgVal(k.alg);
				return;
			}
			
			if (!k.kty) {
				// if we don't know the key type, we can't test on it, so don't change the alg
				return;
			}
			
			if (k.kty == 'RSA') {
				if (this.state.alg == 'RS256' 
					|| this.state.alg == 'RS384'
					|| this.state.alg == 'RS512'
					|| this.state.alg == 'PS256'
					|| this.state.alg == 'PS384'
					|| this.state.alg == 'PS512'
				) {
					// already set to an RSA value, no need to change it 
					return;
				} else {
					// otherwise set a default
					this.setAlgVal('RS256');
				}
			} else if (k.kty == 'EC') {
				const crv = k.crv;
				if (!crv) {
					// no curve value, don't change it
					return;
				} else if (crv == 'P-256') {
					this.setAlgVal('ES256');
				} else if (crv == 'P-384') {
					this.setAlgVal('ES384');
				} else if (crv == 'P-521') {
					this.setAlgVal('ES512');
				} else if (crv == 'secp256k1') {
					this.setAlgVal('ES256K');
				}
			} else if (k.kty == 'oct') {
				if (this.state.alg == 'HS256' 
					|| this.state.alg == 'HS384'
					|| this.state.alg == 'HS512'
				) {
					// already set to an HMAC value, no need to change it 
					return;
				} else {
					// otherwise set a default
					this.setAlgVal('HS256');
				}
			} else if (k.kty == 'OKP') {
				this.setAlgVal('EdDSA');
			}

		
		} catch (e) {
			// not a valid key, don't change anything
			return;
		}
	}
	
	generate = (e) => {
		if (!this.state.payload) {
			alert(this.props.t('err.input_payload'));
			return;
		}
		
		if (this.state.alg != 'none' && !this.state.jwk) {
			alert(this.props.t('err.input_jwk'));
			return;
		}
		
		const url = location.origin + '/api/jose/generate';
		const headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
		});
		
		const body = new URLSearchParams();
		body.append('payload', this.state.payload);
		body.append('signing-alg', this.state.alg);
		body.append('jwk-signing-alg', this.state.jwk);
		
		// Add JWT header if DPoP mode is enabled
		if (this.state.payloadMode === 'dpop' && this.state.jwtHeader) {
			body.append('jws-header', this.state.jwtHeader);
		}
		
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
					{this.state.payloadMode === 'dpop' && (
						<HeaderForm 
							jwtHeader={this.state.jwtHeader}
							setJwtHeader={this.setJwtHeader}
							t={this.props.t} />
					)}
					<SigningAlg alg={this.state.alg} setAlg={this.setAlgEvt} payloadMode={this.state.payloadMode} t={this.props.t} />
					<SigningKey jwk={this.state.jwk} alg={this.state.alg} keyLoading={this.keyLoading} payloadMode={this.state.payloadMode} t={this.props.t} 
						setKey={this.setKey} clearKey={this.clearKey} callMkJwk={this.callMkJwk} />
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
	} else if (props.payloadMode == 'ca') {
		label = props.t('input_form.payload_ca');
		payload = <ClientAssertionPayload payload={props.payload}
			setPayload={props.setPayload} t={props.t} />;
	} else if (props.payloadMode == 'dpop') {
		label = 'DPoP JWT Payload';
		payload = <DpopPayload payload={props.payload}
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
								<span className="is-hidden-touch">{props.t('input_form.tabs.desktop.plain')}</span>
								<span className="is-hidden-desktop">{props.t('input_form.tabs.mobile.plain')}</span>
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ciba'} onClick={props.selectTab('ciba')}>
								<span className="is-hidden-touch">{props.t('input_form.tabs.desktop.ciba')}</span>
								<span className="is-hidden-desktop">{props.t('input_form.tabs.mobile.ciba')}</span>
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ro'} onClick={props.selectTab('ro')}>
								<span className="is-hidden-touch">{props.t('input_form.tabs.desktop.ro')}</span>
								<span className="is-hidden-desktop">{props.t('input_form.tabs.mobile.ro')}</span>
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'ca'} onClick={props.selectTab('ca')}>
								<span className="is-hidden-touch">{props.t('input_form.tabs.desktop.ca')}</span>
								<span className="is-hidden-desktop">{props.t('input_form.tabs.mobile.ca')}</span>
							</Tabs.Tab>
							<Tabs.Tab active={props.payloadMode == 'dpop'} onClick={props.selectTab('dpop')}>
								<span className="is-hidden-touch">DPoP JWT</span>
								<span className="is-hidden-desktop">DPoP</span>
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
		exp: 'number',
		nbf: 'number',
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
		var type = e.target.attributes["type"].value;
				
		if (type == 'number') {
			val = Number(val);
		}
		
		p[field] = val;
		
		if (!val && type == 'number') {
			delete p[field];
		}

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
					<div className="table-container">
						<Table>
							<tbody>
								{fields}
							</tbody>
						</Table>
					</div>
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
		exp: 'number',
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
		code_challenge_method: 'text',
	}

	setPayloadItem = (field) => (e) => {
		
		var p = this.state.payload;
		
		var val = e.target.value;
		var type = e.target.attributes["type"].value;
				
		if (type == 'number') {
			val = Number(val);
		}
		
		p[field] = val;
		
		if (!val && type == 'number') {
			delete p[field];
		}

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
					<div className="table-container">
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
					</div>
				</Card.Content>
			</Card>
		);
	}
}

class ClientAssertionPayload extends React.Component {
	constructor(props) {
		super(props);
		
		var p = {};
		try {
			p = JSON.parse(props.payload);	
		} catch (e) {
			// non-json payload, ignore
		}
		
		
		var arb = {};
		var arbString = '';
		Object.keys(p).forEach((field) => {
			if (Object.keys(this.fieldTypes).indexOf(field) < 0) {
				arb[field] = p[field];
			}
		});
		if (Object.keys(arb).length > 0) {
			arbString = JSON.stringify(arb, null, 4);
		}
		
		this.state = {
			payload: p,
			arbString: arbString
		};
	}
	
	componentDidUpdate(prevProps) {
		if (!!prevProps.payload && !this.props.payload) {
			this.setState({
				payload: {},
				arbString: ''
			});
		}
	}

	fieldTypes = {
		iss: 'text',
		sub: 'text',
		aud: 'text',
		exp: 'number',
		nbf: 'number',
		iat: 'number',
		jti: 'text',
	}

	setPayloadItem = (field) => (e) => {
		
		var p = this.state.payload;
		
		var val = e.target.value;
		var type = e.target.attributes["type"].value;
				
		if (type == 'number') {
			val = Number(val);
		}
		
		p[field] = val;
		
		if (!val && type == 'number') {
			delete p[field];
		}

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
				<tr key={'ca-' + field}>
					<td><code>{field}</code></td>
					<td><input id={'ca-' + field} type={this.fieldTypes[field]} size={60} 
						onChange={this.setPayloadItem(field)} value={this.state.payload[field] || ''} /></td>
					<td><Button onClick={this.clearPayloadItem(field)}><i className="far fa-trash-alt"></i></Button></td>
				</tr>
			);
		});
		
		return (
			<Card color="light">
				<Card.Content>
					<div className="table-container">
						<Table>
							<tbody>
								{fields}
								<tr>
									<td>{this.props.t('ca.arbitrary')}</td>
									<td><Form.Textarea id="ca-arbitrary_json" rows={5} cols={50} spellCheck="false"
										onChange={this.setArbitrary} value={this.state.arbString} /></td>
									<td><Button onClick={this.clearArbitrary}><i className="far fa-trash-alt"></i></Button></td>
								</tr>
							</tbody>
						</Table>
					</div>
				</Card.Content>
			</Card>
		);
	}
}

const SigningAlg = ({...props}) => {
	const isDPoPMode = props.payloadMode === 'dpop';
	
	return (
		<Form.Field>
			<Form.Label className="is-medium">{props.t('signing_alg.label')}</Form.Label>
			<Form.Control>
				<Form.Select onChange={props.setAlg} value={props.alg || ''}>
					{!isDPoPMode && <option value="none">{props.t('signing_alg.none')}</option>}
					{!isDPoPMode && <option value="HS256">{props.t('signing_alg.HS256')}</option>}
					{!isDPoPMode && <option value="HS384">{props.t('signing_alg.HS384')}</option>}
					{!isDPoPMode && <option value="HS512">{props.t('signing_alg.HS512')}</option>}
	                <option value="RS256">{props.t('signing_alg.RS256')}</option>
	                <option value="RS384">{props.t('signing_alg.RS384')}</option>
	                <option value="RS512">{props.t('signing_alg.RS512')}</option>
	                <option value="ES256">{props.t('signing_alg.ES256')}</option>
	                <option value="ES384">{props.t('signing_alg.ES384')}</option>
	                <option value="ES512">{props.t('signing_alg.ES512')}</option>
	                <option value="PS256">{props.t('signing_alg.PS256')}</option>
	                <option value="PS384">{props.t('signing_alg.PS384')}</option>
	                <option value="PS512">{props.t('signing_alg.PS512')}</option>
	                <option value="ES256K">{props.t('signing_alg.ES256K')}</option>
	                <option value="EdDSA">{props.t('signing_alg.EdDSA')}</option>
				</Form.Select>
			</Form.Control>
			{isDPoPMode && (
				<Form.Help color="info">
					DPoP requires asymmetric key algorithms (RSA, ECDSA, EdDSA)
				</Form.Help>
			)}
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
		} else {
			this.props.callMkJwk(kty, this.props.alg);
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
		} else if (kty == 'OKP') {
			return {
			  "kty": "OKP",
			  "d": "167PK2ixTR7o0LbPKT7281_6JPOEMOol3ZgUcrmZwkg",
			  "crv": "Ed25519",
			  "x": "GArObvFeRARjhFSbXgGKXwEMow-Tx1SKHg0ZaTuYweA"
			};
		}
	}
	
	getShared = (jwk) => {
		if (jwk) {
			// get out the shared secret portion
			try {
				const k = JSON.parse(jwk);
				if (k.kty == "oct") {
					const shared = base64url.decode(k.k);
					return shared;
				} else {
					return '';
				}
			} catch (e) {
				// bad key
				return '';
			}
		} else {
			return '';
		}
	}
	
	setShared = (e) => {
		const shared = e.target.value;
		// if someone's editing the shared value the key gets replaced completely
		const k = {
			kty: 'oct',
			k: base64url.encode(shared)
		};
		this.props.setKey(JSON.stringify(k, null, 4));
	}
	
	render() {
		const isDPoPMode = this.props.payloadMode === 'dpop';
		
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
						{this.props.t('signing_key.source')}
						<Tabs type='toggle-rounded'>
							<Tabs.Tab active={this.state.keyGen == 'preset'} onClick={this.selectTab('preset')}>
							{this.props.t('signing_key.preset')}
							</Tabs.Tab>
							<Tabs.Tab active={this.state.keyGen == 'generate'} onClick={this.selectTab('generate')}>
							{this.props.t('signing_key.generated')}
							</Tabs.Tab>
							{!isDPoPMode && (
								<Tabs.Tab active={this.state.keyGen == 'shared'} onClick={this.selectTab('shared')}>
								{this.props.t('signing_key.shared')}
								</Tabs.Tab>
							)}
						</Tabs>
					</Level.Item>
					<Level.Item>
						<Button onClick={this.props.clearKey}><i className="far fa-trash-alt"></i></Button>
					</Level.Item>
				</Level.Side>
			</Level>			
			{this.state.keyGen != 'shared' && ( 
				<Level>
					<Level.Side align="left">
						{ this.state.keyGen == 'generate' && (
							<Notification color="info" dangerouslySetInnerHTML={{__html: this.props.t('signing_key.mkjwk')}}></Notification>
						)}
					</Level.Side>
					<Level.Side align="right">
						<Level.Item>
							{this.state.keyGen == 'preset' ? this.props.t('signing_key.load') : this.props.t('signing_key.generate')}
							<Button onClick={this.genKey('RSA')}>{this.props.t('signing_key.rsa')}</Button>
							<Button onClick={this.genKey('EC')}>{this.props.t('signing_key.ec')}</Button>
							{!isDPoPMode && <Button onClick={this.genKey('oct')}>{this.props.t('signing_key.oct')}</Button>}
							<Button onClick={this.genKey('OKP')}>{this.props.t('signing_key.okp')}</Button>
						</Level.Item>
					</Level.Side>
				</Level>
			)}
			<Form.Field>
				<Form.Control loading={this.props.keyLoading}>
					{ this.state.keyGen == 'shared' && !isDPoPMode && (
						<Form.Input className="has-background-light has-text-primary" type="text" placeholder={this.props.t('signing_key.shared_secret')} onChange={this.setShared} value={this.getShared(this.props.jwk)} />
					)}

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
			<Button size="large" color="info" fullwidth onClick={props.copyToClipboard}>{props.t('output_form.copy')}</Button>
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
		
		if (props.lang) {
			this.selectTab(props.lang)();
		}
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

const HeaderForm = ({...props}) => {
	const clearHeader = () => {
		props.setJwtHeader('{}');
	};

	return (
		<>
			<Level>
				<Level.Side align="left">
					<Level.Item>
						<Form.Field>
							<Form.Label className="is-medium">JWT Header</Form.Label>
						</Form.Field>
					</Level.Item>
				</Level.Side>
				<Level.Side align="right">
					<Level.Item>
						<Button onClick={clearHeader}><i className="far fa-trash-alt"></i></Button>
					</Level.Item>
				</Level.Side>
			</Level>
			<Form.Field>
				<Form.Control>
					<Form.Textarea 
						rows={8} 
						spellCheck={false} 
						value={props.jwtHeader}
						onChange={(e) => props.setJwtHeader(e.target.value)}
						placeholder='{"alg": "ES256", "typ": "dpop+jwt", "jwk": {...}}'
					/>
				</Form.Control>
			</Form.Field>
		</>
	);
};

class DpopPayload extends React.Component {
	constructor(props) {
		super(props);
		
		var p = {};
		try {
			p = JSON.parse(props.payload);	
		} catch (e) {
			// non-json payload, ignore
		}
		
		// Generate default DPoP payload
		if (Object.keys(p).length === 0) {
			p = this.generateDefaultPayload();
		}
		
		var arbString = '';
		var customFields = {};
		
		// Separate default fields from custom fields
		const defaultFields = ['jti', 'htm', 'htu', 'iat'];
		Object.keys(p).forEach((field) => {
			if (!defaultFields.includes(field)) {
				customFields[field] = p[field];
			}
		});
		
		if (Object.keys(customFields).length > 0) {
			arbString = JSON.stringify(customFields, null, 4);
		} else {
			// Initialize with default nbf and exp in arbitrary fields
			const now = Math.floor(Date.now() / 1000);
			const defaultArbitrary = {
				nbf: now,
				exp: now + 600
			};
			arbString = JSON.stringify(defaultArbitrary, null, 4);
		}
		
		this.state = {
			payload: p,
			arbString: arbString
		};
	}
	
	componentDidUpdate(prevProps) {
		if (!!prevProps.payload && !this.props.payload) {
			this.setState({
				payload: this.generateDefaultPayload(),
				arbString: ''
			});
		}
	}

	defaultFields = ['jti', 'htm', 'htu', 'iat'];

	generateDefaultPayload = () => {
		// Generate random JTI (32 bytes base64url encoded)
		const jti = base64url(crypto.getRandomValues(new Uint8Array(32)));
		const now = Math.floor(Date.now() / 1000);
		
		return {
			jti: jti,
			htm: 'POST',
			htu: 'https://as.authlete.com/token',
			iat: now
		};
	};
	
	fieldTypes = {
		jti: 'text',
		htm: 'text',
		htu: 'text',
		iat: 'number'
	}

	setPayloadItem = (field) => (e) => {
		var p = this.state.payload;
		var val = e.target.value;
		var type = e.target.attributes["type"].value;
				
		if (type == 'number') {
			val = Number(val);
		}
		
		p[field] = val;
		
		if (!val && type == 'number') {
			delete p[field];
		}

		this.updatePayload(p);
	}
	
	clearPayloadItem = (field) => (e) => {
		var p = this.state.payload;
		p[field] = undefined;
		
		this.updatePayload(p);
	}

	setArbitrary = (e) => {
		const val = e.target.value;
		
		try {
			if (val) {
				const arbFields = JSON.parse(val);
				var p = {};
				
				// Copy default fields
				this.defaultFields.forEach((field) => {
					if (this.state.payload[field] !== undefined) {
						p[field] = this.state.payload[field];
					}
				});
				
				// Add arbitrary fields
				Object.keys(arbFields).forEach((field) => {
					p[field] = arbFields[field];
				});
				
				this.updatePayload(p);
			}
		} catch (e) {
			// Invalid JSON, ignore
		}
		
		this.setState({ arbString: val });
	}

	clearArbitrary = () => {
		var p = {};
		// Keep only default fields
		this.defaultFields.forEach((field) => {
			if (this.state.payload[field] !== undefined) {
				p[field] = this.state.payload[field];
			}
		});
		
		this.updatePayload(p);
		this.setState({ arbString: '' });
	}

	updatePayload = (p) => {
		this.props.setPayload(JSON.stringify(p, null, 4));
		this.setState({ payload: p });
	}

	generateNewJti = () => {
		const jti = base64url(crypto.getRandomValues(new Uint8Array(32)));
		this.setPayloadItem('jti')({target: {value: jti, attributes: {type: {value: 'text'}}}});
	}

	setCurrentTime = () => {
		const now = Math.floor(Date.now() / 1000);
		this.setPayloadItem('iat')({target: {value: now, attributes: {type: {value: 'number'}}}});
	}

	
	render() {
		const fields = [];
		
		// Render default fields
		this.defaultFields.forEach((field) => {
			const isJti = field === 'jti';
			const isIat = field === 'iat';
			
			fields.push(
				<tr key={'dpop-' + field}>
					<td><code>{field}</code></td>
					<td>
						<input 
							id={'dpop-' + field} 
							type={this.fieldTypes[field]} 
							size={60} 
							onChange={this.setPayloadItem(field)} 
							value={this.state.payload[field] || ''} 
						/>
						{isJti && (
							<Button size="small" onClick={this.generateNewJti} style={{marginLeft: '8px'}}>
								Generate
							</Button>
						)}
						{isIat && (
							<Button size="small" onClick={this.setCurrentTime} style={{marginLeft: '8px'}}>
								Now
							</Button>
						)}
					</td>
					<td><Button onClick={this.clearPayloadItem(field)}><i className="far fa-trash-alt"></i></Button></td>
				</tr>
			);
		});
		
		return (
			<Card color="light">
				<Card.Content>
					<div className="table-container">
						<Table>
							<tbody>
								{fields}
								<tr>
									<td>Arbitrary JSON</td>
									<td>
										<Form.Textarea 
											rows={5} 
											cols={50} 
											spellCheck="false"
											placeholder='{"nbf": 1234567890, "exp": 1234568490, "custom_field": "value"}'
											onChange={this.setArbitrary} 
											value={this.state.arbString} 
										/>
									</td>
									<td><Button onClick={this.clearArbitrary}><i className="far fa-trash-alt"></i></Button></td>
								</tr>
							</tbody>
						</Table>
					</div>
				</Card.Content>
			</Card>
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

const urlObject = new URL(window.location);
const lang = urlObject.searchParams.get('lang')

ReactDOM.render((
	<LanguageSwitch lang={lang} />
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
