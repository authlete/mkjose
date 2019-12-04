import i18n from "i18next";
import { initReactI18next } from "react-i18next";

//the translations
const resources = {
		en: {
			translation: {
				input_form: {
					payload: "Payload",
					payload_ro: "Payload for Request Object",
					payload_ciba: "Payload for CIBA",
					plain: 'Plain',
					ciba: 'CIBA',
					ro: 'Request Object'
				},
				ro: {
					arbitrary: 'Arbitrary JSON'
				},
				err: {
					input_payload: 'Input payload.',
					input_jwk: 'Input JWK for signing.'
				}
			}
		},
		ja: {
			translation: {
				input_form: {
					payload: "ペイロード"
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