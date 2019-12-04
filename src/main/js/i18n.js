import i18n from "i18next";
import { initReactI18next } from "react-i18next";

//the translations
const resources = {
		en: {
			translation: {
				input_form: {
					payload: 'Payload',
					payload_ro: 'Payload for Request Object',
					payload_ciba: 'Payload for CIBA',
					plain: 'Plain',
					ciba: 'CIBA',
					ro: 'Request Object'
				},
				ro: {
					arbitrary: 'Arbitrary JSON'
				},
				signing_alg: {
					label: 'Signing Algorithm',
		            none: 'none',
		            HS256: 'HS256 (HMAC using SHA-256)',
		            HS384: 'HS384 (HMAC using SHA-384)',
		            HS512: 'HS512 (HMAC using SHA-512)',
		            RS256: 'RS256 (RSASSA-PKCS1-v1_5 using SHA-256)',
		            RS384: 'RS384 (RSASSA-PKCS1-v1_5 using SHA-384)',
		            RS512: 'RS512 (RSASSA-PKCS1-v1_5 using SHA-512)',
		            ES256: 'ES256 (ECDSA using P-256 and SHA-256)',
		            ES384: 'ES384 (ECDSA using P-384 and SHA-384)',
		            ES512: 'ES512 (ECDSA using P-521 and SHA-512)',
		            PS256: 'PS256 (RSASSA-PSS using SHA-256 and MGF1 with SHA-256)',
		            PS384: 'PS384 (RSASSA-PSS using SHA-384 and MGF1 with SHA-384)',
		            PS512: 'PS512 (RSASSA-PSS using SHA-512 and MGF1 with SHA-512)'
				},
				signing_key: {
					label: 'Signing Key',
					preset: 'Preset',
					generated: 'Generated',
					rsa: 'RSA',
					ec: 'EC',
					oct: 'oct'
				},
				generate: 'Generate',
				output_form: {
					label: 'Output',
					copy: 'Copy to Clipboard'
				},
				err: {
					input_payload: 'Input payload.',
					input_jwk: 'Input JWK for signing.'
				},
				footer: {
					provided: 'This service is provided as a free service by <a href="https://www.authlete.com/">Authlete, Inc</a>, and will never log or store any input data and keys.',
					source: 'The source code of the server and the JOSE generator used in the background are available at <a href="https://github.com/authlete/mkjose">authlete/mkjose</a> and <a href="https://github.com/authlete/authlete-jose">authlete/authlete-jose</a>, respectively.'
				}
			}
		},
		ja: {
			translation: {
				input_form: {
					payload: "ペイロード",
					ro: 'リクエストオブジェクト'
				},
				signing_alg: {
					label: '署名アルゴリズム',
				},
				signing_key: {
					label: '署名鍵',
					generated: '自動生成'
				},
				generate: '生成する',
				output_form: {
					label: '結果',
					copy: 'クリップボードにコピー'
				},
				footer: {
					provided: 'このサービスは <a href="https://www.authlete.com/">株式会社 Authlete</a> により保証無しの無料サービスとして提供されています。 なお、このサーバーは入力されたデータや鍵を一切記録しません。',
					source: 'このサーバー及び JOSE 生成エンジンのソースコードは GitHub 上の <a href="https://github.com/authlete/mkjose">authlete/mkjose</a> 及び <a href="https://github.com/authlete/authlete-jose">authlete/authlete-jose</a> にて公開されています。'
				}
			}
		}
};

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		lng: "en",
		fallbackLng: "en",
	
		interpolation: {
			escapeValue: false // react already safes from xss
		}
});

export default i18n;