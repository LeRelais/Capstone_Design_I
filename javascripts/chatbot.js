// 채팅 메시지를 표시할 DOM
const chatMessages = document.querySelector('#chat-messages');
// 사용자 입력 필드
const userInput = document.querySelector('#user-input input');
// 전송 버튼
const sendButton = document.querySelector('#user-input button');
// 발급받은 OpenAI API 키를 변수로 저장
const apiKey = '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';
// OpenAI API 엔드포인트 주소를 변수로 저장
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
// 사용자가 선호하는 장르
const genre_prefer = 'action, romance';
// 사용자가 선호하는 영화
const movie_prefer = '어바웃 타임, 어벤져스-엔드게임';
// 사용자 id
const user_id = 'jiseok99';

const list = "어벤져스1: 액션, 어벤져스 엔드게임: 액션, 터미네이터: 액션, 미션임파서블1: 액션, 러브 액츄얼리: 로맨스, 노트북: 로맨스";

function addMessage(sender, message) {
    // 새로운 div 생성
    const messageElement = document.createElement('div');
    // 생성된 요소에 클래스 추가
    messageElement.className = 'message';
     // 채팅 메시지 목록에 새로운 메시지 추가
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.prepend(messageElement);
}
// ChatGPT API 요청
async function fetchAIResponse(prompt) {
    // API 요청에 사용할 옵션을 정의
    const requestOptions = {
        method: 'POST',
        // API 요청의 헤더를 설정
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",  // 사용할 AI 모델
            messages: [
            {
                role: "system", 
                content: "You have to recommend movie to user"
            }, 
            {
                role: "assistant",
                content: "user prefers "+genre_prefer+" movies."
            },
            {
                role: "assistant",
                content: "user likes "+genre_prefer
            },
            {
                role: "assistant",
                content: "user`s name is" + user_id
            },
            {
                role: "assistant",
                content: "Recommend up to two movies."
            },
            {
                role: "assistant",
                content: "Use Korean. provide the title in English too."
            },
            {
                role: "assistant",
                content: "When recommending movies, I should recommend only those within the"+list
            },
            {
                role: "user", // 메시지 역할을 user로 설정
                content: prompt // 사용자가 입력한 메시지
            }
            ],
            temperature: 1, // 모델의 출력 다양성
            max_tokens: 500, // 응답받을 메시지 최대 토큰(단어) 수 설정
            top_p: 1, // 토큰 샘플링 확률을 설정
            frequency_penalty: 0, // 일반적으로 나오지 않는 단어를 억제하는 정도
            presence_penalty: 0, // 동일한 단어나 구문이 반복되는 것을 억제하는 정도
            //stop: ["Human"], // 생성된 텍스트에서 종료 구문을 설정
        }),
    };
    // API 요청후 응답 처리
    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        return aiResponse;
    } catch (error) {
		console.error('OpenAI API 호출 중 오류 발생:', error);
        return 'OpenAI API 호출 중 오류 발생';
    }
}
// 전송 버튼 클릭 이벤트 처리
sendButton.addEventListener('click', async () => {
    // 사용자가 입력한 메시지
    const message = userInput.value.trim();
    // 메시지가 비어있으면 리턴
    if (message.length === 0) return;
    // 사용자 메시지 화면에 추가
    addMessage(user_id, message);
    userInput.value = '';
    //ChatGPT API 요청후 답변을 화면에 추가
    const aiResponse = await fetchAIResponse(message);
    addMessage('chatbot', aiResponse);
});
// 사용자 입력 필드에서 Enter 키 이벤트를 처리
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});