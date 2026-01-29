// DeepL API를 호출하는 서버리스 함수
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
    
    // ⚠️ 여기에 DeepL API 키를 입력하세요
    const DEEPL_API_KEY = 'a703cc7a-b212-4099-89f3-15938922f568:fx';
    
    // API 키 확인
    if (!DEEPL_API_KEY || DEEPL_API_KEY === 'a703cc7a-b212-4099-89f3-15938922f568:fx') {
        return res.status(500).json({ 
            error: 'DeepL API 키가 설정되지 않았습니다. api/translate.js 파일을 확인하세요.' 
        });
    }
    
    try {
        const { text, source_lang, target_lang } = req.body;
        
        if (!text || !target_lang) {
            return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
        }
        
        // DeepL API 호출
        const deeplParams = new URLSearchParams({
            auth_key: DEEPL_API_KEY,
            text: text,
            target_lang: target_lang
        });
        
        // source_lang이 있고 AUTO가 아닌 경우에만 추가
        if (source_lang && source_lang !== 'AUTO') {
            deeplParams.append('source_lang', source_lang);
        }
        
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: deeplParams
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