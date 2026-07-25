const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    java: 62,
};

async function executetestcode(code, language, stdin = "") {

    try {

        const languageId = LANGUAGE_IDS[language];

        if (!languageId) {
            throw new Error(`Unsupported language: ${language}`);
        }

        if (!code?.trim()) {
            throw new Error("Code is required");
        }

        const response = await fetch(
            "https://ce.judge0.com/submissions/?base64_encoded=false&wait=true",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin,
                }),
            }
        );

        const data = await response.json();

        return {
            success: true,
            data,
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
        };
    }
}

export default executetestcode;