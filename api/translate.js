export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 환경변수에서 API 키 읽기, 없으면 기본값 사용
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY || 'a703cc7a-b212-4099-89f3-15938922f568:fx';

    try {
        const { text, source_lang, target_lang } = req.body;

        if (!text || !target_lang) {
            return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
        }

        const bodyParams = {
            text: [text],
            target_lang: target_lang
        };

        // source_lang이 있고 AUTO가 아닌 경우에만 추가
        if (source_lang && source_lang !== 'AUTO') {
            bodyParams.source_lang = source_lang;
        }

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyParams)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '번역 요청 실패');
        }

        return res.status(200).json({
            translatedText: data.translations[0].text,
            detectedLanguage: data.translations[0].detected_source_language
        });

    } catch (error) {
        console.error('Translation error:', error);
        return res.status(500).json({
            error: '번역 중 오류가 발생했습니다: ' + error.message
        });
    }
}
